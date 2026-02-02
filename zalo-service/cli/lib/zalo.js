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

export { DATA_DIR };
