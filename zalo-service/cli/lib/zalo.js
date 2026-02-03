/**
 * Shared Zalo utilities
 * 
 * Credentials are passed from Laravel via --credentials argument
 * No file-based storage - database is source of truth
 */

import { Zalo } from 'zca-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data dir exists for QR images
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/**
 * Output JSON result to stdout
 */
export function output(data, success = true) {
    console.log(JSON.stringify({ success, ...data }));
}

/**
 * Output error to stderr
 */
export function error(message, code = 1) {
    console.error(JSON.stringify({ success: false, error: message }));
    process.exit(code);
}

/**
 * Parse credentials from JSON string or object
 */
export function parseCredentials(credentialsArg) {
    if (!credentialsArg) return null;

    if (typeof credentialsArg === 'string') {
        try {
            return JSON.parse(credentialsArg);
        } catch {
            return null;
        }
    }
    return credentialsArg;
}

/**
 * Create Zalo instance and login with credentials
 * Credentials MUST be passed via --credentials argument (from DB)
 */
export async function getZaloApi(ownId, credentialsArg) {
    const credentials = parseCredentials(credentialsArg);

    if (!credentials) {
        throw new Error(`No credentials provided for account ${ownId}. Credentials must be passed via --credentials argument.`);
    }

    const zalo = new Zalo({
        selfListen: false,
        checkUpdate: false,
        logging: false
    });

    const api = await zalo.login(credentials);
    return api;
}

/**
 * Save credentials - stub function for compatibility
 * In new architecture, credentials are returned via stdout and saved by Laravel to DB
 */
export function saveCredentials(ownId, credentials) {
    // No-op: Credentials are now saved via Laravel to database
    return;
}

/**
 * Load credentials - stub function for compatibility
 * In new architecture, credentials should be passed via --credentials argument from Laravel
 */
export function loadCredentials(ownId) {
    // No-op: Credentials should be passed via --credentials argument
    // This returns null - caller should handle missing credentials
    return null;
}

/**
 * Delete credentials - stub function for compatibility
 * In new architecture, deletion happens in Laravel database
 */
export function deleteCredentials(ownId) {
    // No-op: Credentials are deleted from Laravel database
    return;
}

/**
 * Get saved accounts - stub function for compatibility
 * In new architecture, accounts list comes from Laravel database
 */
export function getSavedAccounts() {
    // No-op: Accounts are now fetched from Laravel database
    // Return empty array - this command should not be used in new architecture
    return [];
}

export { DATA_DIR };
