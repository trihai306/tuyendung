/**
 * ZaloHandler - TaskHandler for all Zalo operations
 * 
 * Receives tasks from backend via Soketi Agent Bridge and executes
 * Zalo operations using the ZaloManager (zca-js).
 * 
 * Supported task types:
 * - zalo_login: Login with credentials
 * - zalo_send_message: Send message to user/group
 * - zalo_get_groups: Get list of groups
 * - zalo_group_info: Get group details
 * - zalo_get_friends: Get friends list
 * - zalo_find_user: Find user by phone
 * - zalo_user_info: Get user info
 * - zalo_send_file: Send file
 * - zalo_leave_group: Leave a group
 * - zalo_react: React to message
 * - zalo_account_info: Get account info
 * - zalo_get_accounts: List active accounts
 */

import { TaskHandler, TaskResult } from './index.js';
import { zaloManager } from '../services/zalo-manager.js';

export class ZaloHandler implements TaskHandler {
    type = 'zalo_command' as any;

    async execute(payload: Record<string, any>): Promise<TaskResult> {
        const { action, ownId, ...params } = payload;

        if (!action) {
            return this.fail('Missing "action" in payload');
        }

        try {
            switch (action) {
                case 'login':
                    return await this.handleLogin(ownId, params);
                case 'login_qr':
                    return await this.handleLoginQR(params);
                case 'send_message':
                    return await this.handleSendMessage(ownId, params);
                case 'get_groups':
                    return await this.handleGetGroups(ownId, params);
                case 'group_info':
                    return await this.handleGroupInfo(ownId, params);
                case 'get_friends':
                    return await this.handleGetFriends(ownId);
                case 'find_user':
                    return await this.handleFindUser(ownId, params);
                case 'user_info':
                    return await this.handleUserInfo(ownId, params);
                case 'send_file':
                    return await this.handleSendFile(ownId, params);
                case 'leave_group':
                    return await this.handleLeaveGroup(ownId, params);
                case 'react':
                    return await this.handleReact(ownId, params);
                case 'account_info':
                    return await this.handleAccountInfo(ownId);
                case 'get_accounts':
                    return this.handleGetAccounts();
                case 'logout':
                    return await this.handleLogout(ownId);
                default:
                    return this.fail(`Unknown Zalo action: ${action}`);
            }
        } catch (error: any) {
            console.error(`[ZaloHandler] ${action} error:`, error.message);
            return this.fail(error.message);
        }
    }

    // ==========================================
    // ACTION HANDLERS
    // ==========================================

    private async handleLogin(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId || !params.credentials) {
            return this.fail('Missing ownId or credentials');
        }

        const result = await zaloManager.loginWithCredentials(ownId, params.credentials);
        if (!result.success) return this.fail(result.error || 'Login failed');
        return this.ok(result.data);
    }

    private async handleLoginQR(params: any): Promise<TaskResult> {
        // QR login — the QR image will be sent back in the result
        const result = await zaloManager.loginWithQR();
        if (!result.success) return this.fail(result.error || 'QR login failed');
        return this.ok(result.data);
    }

    private async handleSendMessage(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId) return this.fail('Missing ownId');
        if (!params.threadId || !params.message) return this.fail('Missing threadId or message');

        const data = await zaloManager.sendMessage(
            ownId, params.threadId, params.message, params.type || 'user'
        );
        return this.ok(data);
    }

    private async handleGetGroups(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId) return this.fail('Missing ownId');

        const groups = await zaloManager.getGroups(ownId, params.limit || 50);
        return this.ok({ groups, total: groups.length });
    }

    private async handleGroupInfo(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId || !params.groupId) return this.fail('Missing ownId or groupId');

        const info = await zaloManager.getGroupInfo(ownId, params.groupId);
        return this.ok(info);
    }

    private async handleGetFriends(ownId: string): Promise<TaskResult> {
        if (!ownId) return this.fail('Missing ownId');

        const friends = await zaloManager.getFriends(ownId);
        return this.ok(friends);
    }

    private async handleFindUser(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId || !params.phone) return this.fail('Missing ownId or phone');

        const user = await zaloManager.findUser(ownId, params.phone);
        return this.ok(user);
    }

    private async handleUserInfo(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId || !params.userId) return this.fail('Missing ownId or userId');

        const info = await zaloManager.getUserInfo(ownId, params.userId);
        return this.ok(info);
    }

    private async handleSendFile(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId || !params.threadId || !params.filePath) {
            return this.fail('Missing ownId, threadId, or filePath');
        }

        const data = await zaloManager.sendFile(ownId, params.threadId, params.filePath, params.type || 'user');
        return this.ok(data);
    }

    private async handleLeaveGroup(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId || !params.groupId) return this.fail('Missing ownId or groupId');

        const result = await zaloManager.leaveGroup(ownId, params.groupId);
        return this.ok(result);
    }

    private async handleReact(ownId: string, params: any): Promise<TaskResult> {
        if (!ownId || !params.threadId || !params.msgId || !params.icon) {
            return this.fail('Missing required react parameters');
        }

        const result = await zaloManager.reactToMessage(
            ownId, params.threadId, params.msgId, params.icon, params.type || 'user'
        );
        return this.ok(result);
    }

    private async handleAccountInfo(ownId: string): Promise<TaskResult> {
        if (!ownId) return this.fail('Missing ownId');

        const info = await zaloManager.getAccountInfo(ownId);
        return this.ok(info);
    }

    private handleGetAccounts(): TaskResult {
        const accounts = zaloManager.getActiveAccounts();
        return {
            success: true,
            data: { accounts, count: accounts.length },
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
        };
    }

    private async handleLogout(ownId: string): Promise<TaskResult> {
        if (!ownId) return this.fail('Missing ownId');

        await zaloManager.logout(ownId);
        return this.ok({ ownId, logged_out: true });
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private ok(data: any): TaskResult {
        return {
            success: true,
            data,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
        };
    }

    private fail(error: string): TaskResult {
        return {
            success: false,
            error,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
        };
    }
}
