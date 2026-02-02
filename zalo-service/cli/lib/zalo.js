/**
 * Shared Zalo utilities
 */

import { Zalo } from 'zca-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const COOKIES_DIR = path.join(DATA_DIR, 'cookies');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(COOKIES_DIR)) fs.mkdirSync(COOKIES_DIR, { recursive: true });

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
 * Get cookies path for an account
 */
export function getCookiePath(ownId) {
    return path.join(COOKIES_DIR, `cred_${ownId}.json`);
}

/**
 * Save credentials for an account
 */
export function saveCredentials(ownId, credentials) {
    fs.writeFileSync(getCookiePath(ownId), JSON.stringify(credentials, null, 2));
}

/**
 * Load credentials for an account
 */
export function loadCredentials(ownId) {
    const cookiePath = getCookiePath(ownId);
    if (!fs.existsSync(cookiePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
}

/**
 * Get all saved account IDs
 */
export function getSavedAccounts() {
    if (!fs.existsSync(COOKIES_DIR)) return [];

    return fs.readdirSync(COOKIES_DIR)
        .filter(f => f.startsWith('cred_') && f.endsWith('.json'))
        .map(f => f.replace('cred_', '').replace('.json', ''));
}

/**
 * Delete credentials for an account
 */
export function deleteCredentials(ownId) {
    const cookiePath = getCookiePath(ownId);
    if (fs.existsSync(cookiePath)) {
        fs.unlinkSync(cookiePath);
        return true;
    }
    return false;
}

/**
 * Create Zalo instance and login with saved credentials
 */
export async function getZaloApi(ownId) {
    const credentials = loadCredentials(ownId);
    if (!credentials) {
        throw new Error(`Account ${ownId} not found. Please login first.`);
    }

    const zalo = new Zalo({
        selfListen: false,
        checkUpdate: false,
        logging: false
    });

    const api = await zalo.login(credentials);
    return api;
}

export { DATA_DIR, COOKIES_DIR };
