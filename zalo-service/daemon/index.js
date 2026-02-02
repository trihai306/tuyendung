/**
 * Zalo Daemon - Real-time event listener
 * 
 * This daemon:
 * 1. Auto-login all saved accounts on startup
 * 2. Listen for incoming messages and events
 * 3. Forward events to Laravel webhook for Soketi broadcast
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

// Store active accounts
const accounts = new Map();

// ==================
// Utility Functions
// ==================

function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const emoji = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', event: '📩' };
    console.log(`${timestamp} ${emoji[level] || ''} [${level.toUpperCase()}] ${message}`,
        Object.keys(data).length ? JSON.stringify(data) : '');
}

/**
 * Forward event to Laravel webhook
 */
async function forwardToWebhook(event, data) {
    try {
        const payload = {
            event,
            data,
            timestamp: new Date().toISOString(),
            secret: WEBHOOK_SECRET
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Zalo-Signature': WEBHOOK_SECRET // For verification
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            log('error', 'Webhook failed', { status: response.status, event });
        } else {
            log('info', 'Webhook sent', { event });
        }
    } catch (error) {
        log('error', 'Webhook error', { error: error.message, event });
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
 * Setup event listeners for an account
 */
function setupListeners(api, ownId, displayName) {
    // Message received
    api.listener.on('message', (msg) => {
        const content = msg.data?.content || '';
        const senderId = msg.data?.uidFrom || '';
        const threadId = msg.threadId || senderId;
        const threadType = msg.type === 1 ? 'group' : 'user';

        log('event', `Message from ${senderId}`, {
            account: displayName,
            preview: content.substring(0, 50)
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
    });

    // Reaction
    api.listener.on('reaction', (reaction) => {
        log('event', 'Reaction received', { account: displayName });
        forwardToWebhook('message:reaction', {
            ownId: ownId,
            accountName: displayName,
            reaction
        });
    });

    // Group event
    api.listener.on('group_event', (event) => {
        log('event', 'Group event', { account: displayName, type: event.type });
        forwardToWebhook('group:event', {
            ownId: ownId,
            accountName: displayName,
            event
        });
    });

    // Connection status
    api.listener.onConnected(() => {
        log('success', `Connected: ${displayName}`);
        forwardToWebhook('account:connected', { ownId: ownId, accountName: displayName });
    });

    api.listener.onClosed(() => {
        log('warn', `Disconnected: ${displayName}`);
        forwardToWebhook('account:disconnected', { ownId: ownId, accountName: displayName });
    });
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

        // Start listening
        api.listener.start();

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
        await new Promise(r => setTimeout(r, 1000));
    }
}

/**
 * Graceful shutdown
 */
function shutdown() {
    log('info', 'Shutting down daemon...');

    for (const [ownId, { api, displayName }] of accounts) {
        try {
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
╚═══════════════════════════════════════════════╝
    `);

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

