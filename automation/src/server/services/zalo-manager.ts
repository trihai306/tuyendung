/**
 * ZaloManager - Manages Zalo accounts using zca-js on client-side
 * 
 * Ported from zalo-service/daemon/index.js to run inside automation app.
 * Handles:
 * - Login/logout accounts with credentials
 * - Real-time event listeners (messages, reactions, groups)
 * - KeepAlive pings to prevent idle timeout
 * - Reconnection with exponential backoff
 * - Forwarding events to backend webhook
 */

// @ts-ignore - zca-js doesn't have type definitions
import { Zalo } from 'zca-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../../data/zalo');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Constants
const KEEPALIVE_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const RECONNECT_BASE_DELAY_MS = 5000;
const RECONNECT_MAX_DELAY_MS = 2 * 60 * 1000;
const RECONNECT_COOLDOWN_AFTER = 5;
const WEBHOOK_MAX_RETRIES = 3;
const WEBHOOK_RETRY_DELAY_MS = 2000;

interface ZaloAccount {
    api: any;
    ownId: string;
    displayName: string;
    keepAliveInterval?: ReturnType<typeof setInterval>;
}

interface ReconnectInfo {
    count: number;
    lastTime: number;
}

export class ZaloManager {
    private accounts = new Map<string, ZaloAccount>();
    private reconnectCounts = new Map<string, ReconnectInfo>();
    private webhookUrl: string;
    private webhookSecret: string;
    private webhookHealthy = true;
    private webhookFailCount = 0;

    constructor(webhookUrl?: string, webhookSecret?: string) {
        this.webhookUrl = webhookUrl || process.env.WEBHOOK_URL || 'http://localhost:9000/api/zalo-webhook';
        this.webhookSecret = webhookSecret || process.env.WEBHOOK_SECRET || '';
    }

    // ==========================================
    // ACCOUNT MANAGEMENT
    // ==========================================

    /**
     * Login with credentials (from backend DB)
     */
    async loginWithCredentials(ownId: string, credentials: any): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // If already logged in, disconnect first
            if (this.accounts.has(ownId)) {
                await this.logout(ownId);
            }

            const zalo = new Zalo({
                selfListen: false,
                checkUpdate: false,
                logging: false
            });

            const api = await zalo.login(credentials);
            const accountInfo = await api.fetchAccountInfo();
            const displayName = accountInfo.profile.displayName;

            // Store account
            this.accounts.set(ownId, { api, ownId, displayName });

            // Setup event listeners
            this.setupListeners(api, ownId, displayName);

            // Start listening
            api.listener.start({ retryOnClose: true });

            // Setup keepAlive
            const keepAliveInterval = setInterval(async () => {
                try {
                    await api.keepAlive();
                } catch (err: any) {
                    this.log('warn', `KeepAlive failed: ${displayName}`, { error: err.message });
                }
            }, KEEPALIVE_INTERVAL_MS);

            this.accounts.set(ownId, { api, ownId, displayName, keepAliveInterval });

            this.log('success', `Logged in: ${displayName} (${ownId})`);

            // Notify backend
            this.forwardToWebhook('account:login', {
                ownId,
                displayName,
                phone: accountInfo.profile.phoneNumber
            });

            return {
                success: true,
                data: {
                    ownId,
                    displayName,
                    phone: accountInfo.profile.phoneNumber,
                    avatar: accountInfo.profile.avatar
                }
            };
        } catch (error: any) {
            this.log('error', `Failed to login ${ownId}`, { error: error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Login with QR code
     */
    async loginWithQR(onQR?: (qrData: string) => void): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const zalo = new Zalo({
                selfListen: false,
                checkUpdate: true,
                logging: false
            });

            const qrPath = path.join(DATA_DIR, 'qr.png');

            const api = await new Promise<any>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('QR code timeout (60s)')), 60000);

                zalo.loginQR({ qrPath }, (qrData: any) => {
                    if (qrData?.data?.image && onQR) {
                        onQR(`data:image/png;base64,${qrData.data.image}`);
                    }
                }).then((api: any) => {
                    clearTimeout(timeout);
                    resolve(api);
                }).catch((err: Error) => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });

            const accountInfo = await api.fetchAccountInfo();
            const profile = accountInfo.profile;
            const ownId = api.getOwnId();
            const context = await api.getContext();

            // Store account
            this.accounts.set(ownId, { api, ownId, displayName: profile.displayName });
            this.setupListeners(api, ownId, profile.displayName);
            api.listener.start({ retryOnClose: true });

            // Setup keepAlive
            const keepAliveInterval = setInterval(async () => {
                try { await api.keepAlive(); } catch { }
            }, KEEPALIVE_INTERVAL_MS);

            this.accounts.set(ownId, { api, ownId, displayName: profile.displayName, keepAliveInterval });

            this.log('success', `QR Login: ${profile.displayName} (${ownId})`);

            return {
                success: true,
                data: {
                    ownId,
                    displayName: profile.displayName,
                    phone: profile.phoneNumber,
                    avatar: profile.avatar,
                    credentials: {
                        imei: context.imei,
                        cookie: context.cookie,
                        userAgent: context.userAgent
                    }
                }
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout account
     */
    async logout(ownId: string): Promise<void> {
        const account = this.accounts.get(ownId);
        if (!account) return;

        try {
            if (account.keepAliveInterval) clearInterval(account.keepAliveInterval);
            account.api.listener.stop();
            this.log('info', `Stopped: ${account.displayName}`);
        } catch { }

        this.accounts.delete(ownId);
        this.forwardToWebhook('account:disconnected', { ownId, accountName: account.displayName });
    }

    /**
     * Get API instance for an account
     */
    getApi(ownId: string): any | null {
        return this.accounts.get(ownId)?.api || null;
    }

    /**
     * Check if account is logged in
     */
    isLoggedIn(ownId: string): boolean {
        return this.accounts.has(ownId);
    }

    /**
     * Get all active accounts
     */
    getActiveAccounts(): Array<{ ownId: string; displayName: string }> {
        return Array.from(this.accounts.values()).map(a => ({
            ownId: a.ownId,
            displayName: a.displayName
        }));
    }

    // ==========================================
    // ZALO OPERATIONS (using active accounts)
    // ==========================================

    async sendMessage(ownId: string, threadId: string, message: string, type: string = 'user'): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        const threadType = type === 'group' ? 1 : 0;
        const result = await api.sendMessage(message, threadId, threadType);
        return { messageId: result?.msgId, threadId, type, sentAt: new Date().toISOString() };
    }

    async getGroups(ownId: string, limit: number = 50): Promise<any[]> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        const groups = await api.getAllGroups();
        const groupIds = Object.keys(groups.gridVerMap || {});
        const details: any[] = [];

        for (const groupId of groupIds.slice(0, limit)) {
            try {
                const info = await api.getGroupInfo(groupId);
                const groupData = info.gridInfoMap?.[groupId] || info;
                details.push({
                    id: groupId,
                    name: groupData.name || 'Unknown Group',
                    memberCount: groupData.memVerList?.length || groupData.totalMember || 0,
                    avatar: groupData.avt || groupData.avatar
                });
            } catch {
                details.push({ id: groupId, name: 'Unknown Group', memberCount: 0, avatar: null });
            }
        }

        return details;
    }

    async getGroupInfo(ownId: string, groupId: string): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        const info = await api.getGroupInfo(groupId);
        return info.gridInfoMap?.[groupId] || info;
    }

    async getAccountInfo(ownId: string): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        return await api.fetchAccountInfo();
    }

    async getFriends(ownId: string): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        return await api.getFriendList();
    }

    async getUserInfo(ownId: string, userId: string): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        return await api.getUserInfo(userId);
    }

    async findUser(ownId: string, phone: string): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        return await api.findUser(phone);
    }

    async sendFile(ownId: string, threadId: string, filePath: string, type: string = 'user'): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        const threadType = type === 'group' ? 1 : 0;
        return await api.sendFile(filePath, threadId, threadType);
    }

    async leaveGroup(ownId: string, groupId: string): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        return await api.leaveGroup(groupId);
    }

    async createGroup(ownId: string, name: string, members: string[] = []): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        return await api.createGroup(name, members);
    }

    async addFriend(ownId: string, userId: string, message: string = 'Xin chào!'): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        return await api.addFriend(userId, message);
    }

    async reactToMessage(ownId: string, threadId: string, msgId: string, icon: string, type: string = 'user'): Promise<any> {
        const api = this.getApi(ownId);
        if (!api) throw new Error(`Account ${ownId} not logged in`);

        const threadType = type === 'group' ? 1 : 0;
        return await api.react(msgId, icon, threadId, threadType);
    }

    // ==========================================
    // EVENT LISTENERS (from daemon)
    // ==========================================

    private setupListeners(api: any, ownId: string, displayName: string): void {
        // Message received
        api.listener.on('message', (msg: any) => {
            try {
                const rawContent = msg.data?.content;
                const content = typeof rawContent === 'string' ? rawContent : this.getContentPreview(rawContent);
                const senderId = msg.data?.uidFrom || '';
                const threadId = msg.threadId || senderId;
                const threadType = msg.type === 1 ? 'group' : 'user';

                this.forwardToWebhook('message:received', {
                    ownId, accountName: displayName,
                    threadId, threadType, senderId,
                    senderName: msg.data?.fromId?.displayName || 'Unknown',
                    content, msgId: msg.msgId, raw: msg
                });
            } catch (err: any) {
                this.log('error', 'Error processing message', { error: err.message });
            }
        });

        // Reaction
        api.listener.on('reaction', (reaction: any) => {
            try {
                this.forwardToWebhook('message:reaction', { ownId, accountName: displayName, reaction });
            } catch { }
        });

        // Group event
        api.listener.on('group_event', (event: any) => {
            try {
                this.forwardToWebhook('group:event', { ownId, accountName: displayName, event });
            } catch { }
        });

        // Message deleted
        api.listener.on('undo', (data: any) => {
            try {
                this.forwardToWebhook('message:deleted', { ownId, accountName: displayName, data });
            } catch { }
        });

        // Connection status
        api.listener.onConnected(() => {
            this.log('success', `Connected: ${displayName}`);
            this.reconnectCounts.set(ownId, { count: 0, lastTime: Date.now() });
            this.forwardToWebhook('account:connected', { ownId, accountName: displayName });
        });

        api.listener.onClosed((code: number, reason: string) => {
            this.log('warn', `Disconnected: ${displayName}`, { code, reason });
            this.forwardToWebhook('account:disconnected', { ownId, accountName: displayName, code, reason });

            if (code === 1000) {
                this.handleReconnect(api, ownId, displayName);
            }
        });

        api.listener.on('error', (err: any) => {
            this.log('error', `Listener error: ${displayName}`, { error: err?.message });
        });
    }

    private handleReconnect(api: any, ownId: string, displayName: string): void {
        const now = Date.now();
        let info = this.reconnectCounts.get(ownId) || { count: 0, lastTime: 0 };

        if (now - info.lastTime > 5 * 60 * 1000) info.count = 0;
        info.count++;
        info.lastTime = now;
        this.reconnectCounts.set(ownId, info);

        let delay = info.count >= RECONNECT_COOLDOWN_AFTER
            ? RECONNECT_MAX_DELAY_MS
            : Math.min(RECONNECT_BASE_DELAY_MS * Math.pow(2, info.count - 1), RECONNECT_MAX_DELAY_MS);

        this.log('info', `Reconnect #${info.count} in ${Math.round(delay / 1000)}s for: ${displayName}`);

        setTimeout(() => {
            try {
                api.listener.start({ retryOnClose: true });
            } catch (err: any) {
                this.log('error', `Reconnect failed: ${displayName}`, { error: err.message });
                this.forwardToWebhook('account:needs_relogin', { ownId, accountName: displayName, error: err.message });
            }
        }, delay);
    }

    // ==========================================
    // WEBHOOK FORWARDING
    // ==========================================

    private async forwardToWebhook(event: string, data: any, retryCount = 0): Promise<void> {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Zalo-Signature': this.webhookSecret
                },
                body: JSON.stringify({
                    event, data,
                    timestamp: new Date().toISOString(),
                    secret: this.webhookSecret
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok && response.status >= 500 && retryCount < WEBHOOK_MAX_RETRIES) {
                await this.sleep(WEBHOOK_RETRY_DELAY_MS * Math.pow(2, retryCount));
                return this.forwardToWebhook(event, data, retryCount + 1);
            }

            if (response.ok && !this.webhookHealthy) {
                this.webhookHealthy = true;
                this.webhookFailCount = 0;
                this.log('success', 'Webhook recovered!');
            }
        } catch (error: any) {
            if (retryCount < WEBHOOK_MAX_RETRIES) {
                await this.sleep(WEBHOOK_RETRY_DELAY_MS * Math.pow(2, retryCount));
                return this.forwardToWebhook(event, data, retryCount + 1);
            }
            this.webhookFailCount++;
            if (this.webhookFailCount >= 10 && this.webhookHealthy) {
                this.webhookHealthy = false;
                this.log('warn', 'Webhook appears unhealthy');
            }
        }
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    private getContentPreview(rawContent: any, maxLen = 50): string {
        if (typeof rawContent === 'string') return rawContent.substring(0, maxLen);
        if (rawContent?.text) return String(rawContent.text).substring(0, maxLen);
        if (rawContent?.title) return String(rawContent.title).substring(0, maxLen);
        return '[Attachment]';
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private log(level: string, message: string, data: any = {}): void {
        const emoji: Record<string, string> = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
        console.log(`${new Date().toISOString()} ${emoji[level] || ''} [ZaloManager] ${message}`,
            Object.keys(data).length ? JSON.stringify(data) : '');
    }

    /**
     * Graceful shutdown — stop all listeners
     */
    shutdown(): void {
        this.log('info', 'Shutting down ZaloManager...');
        for (const [ownId, account] of this.accounts) {
            try {
                if (account.keepAliveInterval) clearInterval(account.keepAliveInterval);
                account.api.listener.stop();
            } catch { }
        }
        this.accounts.clear();
    }
}

// Singleton instance
export const zaloManager = new ZaloManager();
