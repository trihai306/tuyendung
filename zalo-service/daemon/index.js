/**
 * Zalo Daemon - Real-time event listener
 * 
 * This daemon:
 * 1. Auto-login all saved accounts on startup
 * 2. Listen for incoming messages and events
 * 3. Forward events to Laravel webhook for Soketi broadcast
 * 
 * IMPORTANT NOTES:
 * - Only ONE listener per Zalo account can be active at a time
 * - If you open Zalo in browser, this daemon will be disconnected
 * - Cookie/session can expire, requiring re-login
 * 
 * Usage:
 *   node daemon/index.js
 */

import { Zalo } from 'zca-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const COOKIES_DIR = path.join(DATA_DIR, 'cookies');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:8000/api/zalo-webhook';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// KeepAlive interval (3 minutes) - prevents idle timeout
const KEEPALIVE_INTERVAL_MS = 3 * 60 * 1000;

// Reconnect settings for code 1000
const RECONNECT_BASE_DELAY_MS = 5000; // 5 seconds base delay
const RECONNECT_MAX_DELAY_MS = 2 * 60 * 1000; // Max 2 minutes delay
const RECONNECT_COOLDOWN_AFTER = 5; // After 5 rapid reconnects, use max delay

// Webhook retry settings
const WEBHOOK_MAX_RETRIES = 3;
const WEBHOOK_RETRY_DELAY_MS = 2000; // 2 seconds between retries

// Store active accounts
const accounts = new Map();

// Track reconnect attempts per account
const reconnectCounts = new Map(); // ownId -> { count, lastTime }

// Track webhook health
let webhookHealthy = true;
let webhookFailCount = 0;

// ==================
// Utility Functions
// ==================

function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const emoji = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', event: '📩', debug: '🔍' };
    console.log(`${timestamp} ${emoji[level] || ''} [${level.toUpperCase()}] ${message}`,
        Object.keys(data).length ? JSON.stringify(data) : '');
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Forward event to Laravel webhook with retry logic
 */
async function forwardToWebhook(event, data, retryCount = 0) {
    try {
        const payload = {
            event,
            data,
            timestamp: new Date().toISOString(),
            secret: WEBHOOK_SECRET
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Zalo-Signature': WEBHOOK_SECRET
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            // Server returned error
            if (response.status >= 500 && retryCount < WEBHOOK_MAX_RETRIES) {
                // Server error - retry with backoff
                const delay = WEBHOOK_RETRY_DELAY_MS * Math.pow(2, retryCount);
                if (retryCount === 0) {
                    log('warn', `Webhook server error, retrying...`, { status: response.status, event });
                }
                await sleep(delay);
                return forwardToWebhook(event, data, retryCount + 1);
            }

            // Log failure only if retries exhausted or client error
            if (retryCount >= WEBHOOK_MAX_RETRIES) {
                log('error', `Webhook failed after ${retryCount} retries`, { status: response.status, event });
            } else if (response.status < 500) {
                log('warn', 'Webhook client error', { status: response.status, event });
            }

            webhookFailCount++;
            if (webhookFailCount >= 10 && webhookHealthy) {
                webhookHealthy = false;
                log('warn', 'Webhook appears unhealthy, reducing log verbosity');
            }
        } else {
            // Success
            if (!webhookHealthy) {
                webhookHealthy = true;
                webhookFailCount = 0;
                log('success', 'Webhook recovered!');
            }
            // Only log success for important events, not every message
            if (event.startsWith('account:')) {
                log('info', 'Webhook sent', { event });
            }
        }
    } catch (error) {
        // Network error or timeout
        if (retryCount < WEBHOOK_MAX_RETRIES) {
            const delay = WEBHOOK_RETRY_DELAY_MS * Math.pow(2, retryCount);
            await sleep(delay);
            return forwardToWebhook(event, data, retryCount + 1);
        }

        if (webhookHealthy) {
            log('error', 'Webhook error', { error: error.message, event });
        }
        webhookFailCount++;
        if (webhookFailCount >= 10 && webhookHealthy) {
            webhookHealthy = false;
            log('warn', 'Webhook appears unhealthy, will retry silently');
        }
    }
}

/**
 * Get all saved account credentials
 */
function getSavedAccounts() {
    if (!fs.existsSync(COOKIES_DIR)) return [];

    return fs.readdirSync(COOKIES_DIR)
        .filter(f => f.startsWith('cred_') && f.endsWith('.json'))
        .map(f => ({
            ownId: f.replace('cred_', '').replace('.json', ''),
            path: path.join(COOKIES_DIR, f)
        }));
}

/**
 * Safe string extraction from content
 */
function getContentPreview(rawContent, maxLen = 50) {
    if (typeof rawContent === 'string') {
        return rawContent.substring(0, maxLen);
    }
    if (rawContent && typeof rawContent === 'object') {
        // Try to extract text from object
        if (rawContent.text) return String(rawContent.text).substring(0, maxLen);
        if (rawContent.title) return String(rawContent.title).substring(0, maxLen);
        return '[Attachment]';
    }
    return '[Empty]';
}

/**
 * Setup event listeners for an account
 */
function setupListeners(api, ownId, displayName) {
    // Message received
    api.listener.on('message', (msg) => {
        try {
            const rawContent = msg.data?.content;
            const content = typeof rawContent === 'string' ? rawContent : getContentPreview(rawContent);
            const senderId = msg.data?.uidFrom || '';
            const threadId = msg.threadId || senderId;
            const threadType = msg.type === 1 ? 'group' : 'user';

            log('event', `Message from ${senderId}`, {
                account: displayName,
                type: threadType,
                preview: getContentPreview(rawContent)
            });

            forwardToWebhook('message:received', {
                ownId: ownId,
                accountName: displayName,
                threadId,
                threadType,
                senderId,
                senderName: msg.data?.fromId?.displayName || 'Unknown',
                content,
                msgId: msg.msgId,
                raw: msg
            });
        } catch (err) {
            log('error', 'Error processing message', { error: err.message, account: displayName });
        }
    });

    // Reaction
    api.listener.on('reaction', (reaction) => {
        try {
            // Don't log every reaction, just forward
            forwardToWebhook('message:reaction', {
                ownId: ownId,
                accountName: displayName,
                reaction
            });
        } catch (err) {
            log('error', 'Error processing reaction', { error: err.message });
        }
    });

    // Group event
    api.listener.on('group_event', (event) => {
        try {
            log('event', 'Group event', { account: displayName, type: event.type });
            forwardToWebhook('group:event', {
                ownId: ownId,
                accountName: displayName,
                event
            });
        } catch (err) {
            log('error', 'Error processing group event', { error: err.message });
        }
    });

    // Undo (message deleted)
    api.listener.on('undo', (data) => {
        try {
            log('event', 'Message deleted', { account: displayName });
            forwardToWebhook('message:deleted', {
                ownId: ownId,
                accountName: displayName,
                data
            });
        } catch (err) {
            log('error', 'Error processing undo', { error: err.message });
        }
    });

    // Connection status
    api.listener.onConnected(() => {
        log('success', `Connected: ${displayName}`);
        // Reset reconnect counter on successful stable connection
        reconnectCounts.set(ownId, { count: 0, lastTime: Date.now() });
        forwardToWebhook('account:connected', { ownId: ownId, accountName: displayName });
    });

    api.listener.onClosed((code, reason) => {
        log('warn', `Disconnected: ${displayName}`, { code, reason: reason || 'Unknown' });
        forwardToWebhook('account:disconnected', {
            ownId: ownId,
            accountName: displayName,
            code,
            reason: reason || 'Unknown'
        });

        // Special handling for code 1000 (graceful close)
        if (code === 1000) {
            handleCode1000Reconnect(api, ownId, displayName);
        }
    });

    // Handle errors to prevent crash
    api.listener.on('error', (err) => {
        log('error', `Listener error: ${displayName}`, { error: err?.message || 'Unknown' });
    });
}

/**
 * Handle code 1000 disconnection with exponential backoff
 */
function handleCode1000Reconnect(api, ownId, displayName) {
    const now = Date.now();
    let reconnectInfo = reconnectCounts.get(ownId) || { count: 0, lastTime: 0 };

    // Reset counter if last reconnect was more than 5 minutes ago
    if (now - reconnectInfo.lastTime > 5 * 60 * 1000) {
        reconnectInfo.count = 0;
    }

    reconnectInfo.count++;
    reconnectInfo.lastTime = now;
    reconnectCounts.set(ownId, reconnectInfo);

    // Calculate delay with exponential backoff
    let delay;
    if (reconnectInfo.count >= RECONNECT_COOLDOWN_AFTER) {
        delay = RECONNECT_MAX_DELAY_MS;
        log('warn', `Too many reconnects (${reconnectInfo.count}). Consider checking if Zalo is open elsewhere.`);
    } else {
        delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectInfo.count - 1);
        delay = Math.min(delay, RECONNECT_MAX_DELAY_MS);
    }

    log('info', `Reconnect #${reconnectInfo.count} in ${Math.round(delay / 1000)}s for: ${displayName}`);

    setTimeout(() => {
        try {
            log('info', `Attempting reconnect for: ${displayName}`);
            api.listener.start({ retryOnClose: true });
        } catch (err) {
            log('error', `Reconnect failed: ${displayName}`, { error: err.message });
            forwardToWebhook('account:needs_relogin', {
                ownId: ownId,
                accountName: displayName,
                error: err.message
            });
        }
    }, delay);
}

/**
 * Login a single account
 */
async function loginAccount(ownId, credPath) {
    try {
        const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));

        const zalo = new Zalo({
            selfListen: false,
            checkUpdate: false,
            logging: false
        });

        const api = await zalo.login(credentials);
        const accountInfo = await api.fetchAccountInfo();
        const displayName = accountInfo.profile.displayName;

        // Store account
        accounts.set(ownId, { api, displayName });

        // Setup listeners
        setupListeners(api, ownId, displayName);

        // Start listening with auto-retry on close
        api.listener.start({ retryOnClose: true });

        // Setup keepAlive to prevent idle timeout
        const keepAliveInterval = setInterval(async () => {
            try {
                await api.keepAlive();
                // Silent keepalive - don't log success
            } catch (err) {
                log('warn', `KeepAlive failed: ${displayName}`, { error: err.message });
            }
        }, KEEPALIVE_INTERVAL_MS);

        // Update account with interval
        accounts.set(ownId, { api, displayName, keepAliveInterval });

        log('success', `Logged in: ${displayName} (${ownId})`);

        // Notify Laravel
        forwardToWebhook('account:login', {
            ownId: ownId,
            displayName,
            phone: accountInfo.profile.phoneNumber
        });

        return true;
    } catch (error) {
        log('error', `Failed to login ${ownId}`, { error: error.message });
        return false;
    }
}

/**
 * Auto-login all saved accounts
 */
async function autoLoginAll() {
    const savedAccounts = getSavedAccounts();
    log('info', `Found ${savedAccounts.length} saved account(s)`);

    for (const { ownId, path } of savedAccounts) {
        await loginAccount(ownId, path);
        // Small delay between logins
        await sleep(1000);
    }
}

/**
 * Graceful shutdown
 */
function shutdown() {
    log('info', 'Shutting down daemon...');

    for (const [ownId, { api, displayName, keepAliveInterval }] of accounts) {
        try {
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
            }
            api.listener.stop();
            log('info', `Stopped listener: ${displayName}`);
        } catch (e) {
            // Ignore
        }
    }

    process.exit(0);
}

// Handle signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions to prevent crash
process.on('uncaughtException', (err) => {
    log('error', 'Uncaught exception', { error: err.message, stack: err.stack?.split('\n')[1] });
});

process.on('unhandledRejection', (reason) => {
    log('error', 'Unhandled rejection', { reason: String(reason) });
});

// ==================
// CLI Argument Parsing
// ==================

function parseArgs() {
    const args = process.argv.slice(2);
    const result = { accountId: null };

    for (const arg of args) {
        if (arg.startsWith('--account=')) {
            result.accountId = arg.replace('--account=', '');
        }
    }

    return result;
}

// ==================
// Main
// ==================

async function main() {
    const { accountId } = parseArgs();

    console.log(`
╔═══════════════════════════════════════════════╗
║         ZALO DAEMON - Event Listener          ║
╠═══════════════════════════════════════════════╣
║  Webhook: ${WEBHOOK_URL.padEnd(34)} ║
║  Mode: ${accountId ? `Single (${accountId.substring(0, 12)}...)`.padEnd(36) : 'Multi-account                       '} ║
║  KeepAlive: ${(KEEPALIVE_INTERVAL_MS / 1000 / 60).toFixed(0)} minutes                        ║
╚═══════════════════════════════════════════════╝
    `);

    // Wait for webhook to be ready (give Laravel time to start)
    log('info', 'Waiting for webhook to be ready...');
    await sleep(3000);

    if (accountId) {
        // Single account mode - for supervisor
        const credPath = path.join(COOKIES_DIR, `cred_${accountId}.json`);

        if (!fs.existsSync(credPath)) {
            log('error', `Credentials not found for account: ${accountId}`);
            process.exit(1);
        }

        const success = await loginAccount(accountId, credPath);
        if (!success) {
            log('error', 'Failed to login account');
            process.exit(1);
        }
    } else {
        // Multi-account mode - login all saved accounts
        await autoLoginAll();
    }

    log('info', `Daemon running with ${accounts.size} active account(s)`);
    log('info', 'Listening for events... (Ctrl+C to stop)');
}

main().catch(err => {
    log('error', 'Daemon crashed', { error: err.message });
    process.exit(1);
});
