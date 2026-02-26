/**
 * Stealth Plugin for Playwright
 * Comprehensive anti-bot-detection module that patches browser fingerprints
 * to make automated browsers indistinguishable from real user browsers.
 */

import { BrowserContext } from 'playwright-core';
import { generateUA } from './userAgentGenerator';

export interface FingerprintConfig {
    seed: string;
    webglVendor: string;
    webglRenderer: string;
    hardwareConcurrency: number;
    deviceMemory: number;
    screenWidth: number;
    screenHeight: number;
    languages: string[];
    platform?: string;
}

// Common WebGL vendor/renderer pairs from real hardware
const WEBGL_PROFILES = [
    { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)' },
    { vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)' },
];

/**
 * Simple seeded PRNG (Mulberry32) for deterministic fingerprint generation.
 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

/**
 * Generate a complete fingerprint config from a seed string.
 * The same seed always produces the same fingerprint.
 */
export function generateFingerprint(seed: string): FingerprintConfig {
    const rng = seededRandom(hashString(seed));

    const webglProfile = WEBGL_PROFILES[Math.floor(rng() * WEBGL_PROFILES.length)];
    const concurrencyOptions = [4, 6, 8, 12, 16];
    const memoryOptions = [4, 8, 16, 32];
    const screenOptions = [
        { width: 1920, height: 1080 },
        { width: 2560, height: 1440 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 },
        { width: 1680, height: 1050 },
    ];

    const screen = screenOptions[Math.floor(rng() * screenOptions.length)];

    return {
        seed,
        webglVendor: webglProfile.vendor,
        webglRenderer: webglProfile.renderer,
        hardwareConcurrency: concurrencyOptions[Math.floor(rng() * concurrencyOptions.length)],
        deviceMemory: memoryOptions[Math.floor(rng() * memoryOptions.length)],
        screenWidth: screen.width,
        screenHeight: screen.height,
        languages: ['vi-VN', 'vi', 'en-US', 'en'],
    };
}

/**
 * Apply all stealth patches to a browser context.
 * This is the main entry point - call after creating a context.
 */
export async function applyStealthToContext(
    context: BrowserContext,
    config: FingerprintConfig,
): Promise<void> {
    const uaProfile = generateUA(config.seed);

    // All scripts are injected via addInitScript so they run in every frame (including iframes)
    await context.addInitScript({
        path: undefined as unknown as string,
        // Inline the script as a function with the config as an argument
    }).catch(() => {
        // fallback: addInitScript with string
    });

    // 1. Navigator overrides (webdriver, plugins, languages, platform, etc.)
    await context.addInitScript(`
        (() => {
            // --- navigator.webdriver ---
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
                configurable: true,
            });
            // Also delete the property if it exists
            if (navigator.webdriver !== undefined) {
                try { delete (navigator as any).__proto__.webdriver; } catch(e) {}
            }

            // --- navigator.languages ---
            Object.defineProperty(navigator, 'languages', {
                get: () => ${JSON.stringify(config.languages)},
                configurable: true,
            });

            // --- navigator.platform ---
            Object.defineProperty(navigator, 'platform', {
                get: () => '${uaProfile.platform}',
                configurable: true,
            });

            // --- navigator.hardwareConcurrency ---
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => ${config.hardwareConcurrency},
                configurable: true,
            });

            // --- navigator.deviceMemory ---
            Object.defineProperty(navigator, 'deviceMemory', {
                get: () => ${config.deviceMemory},
                configurable: true,
            });

            // --- navigator.vendor ---
            Object.defineProperty(navigator, 'vendor', {
                get: () => '${uaProfile.vendor}',
                configurable: true,
            });

            // --- navigator.maxTouchPoints (desktop = 0) ---
            Object.defineProperty(navigator, 'maxTouchPoints', {
                get: () => 0,
                configurable: true,
            });

            // --- navigator.plugins (fake realistic plugins) ---
            const fakePlugins = [
                { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
                { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
                { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
            ];

            const pluginArray = Object.create(PluginArray.prototype);
            fakePlugins.forEach((p, i) => {
                const plugin = Object.create(Plugin.prototype);
                Object.defineProperties(plugin, {
                    name: { get: () => p.name, enumerable: true },
                    filename: { get: () => p.filename, enumerable: true },
                    description: { get: () => p.description, enumerable: true },
                    length: { get: () => 1, enumerable: true },
                });
                Object.defineProperty(pluginArray, i, { get: () => plugin, enumerable: true });
                Object.defineProperty(pluginArray, p.name, { get: () => plugin });
            });
            Object.defineProperty(pluginArray, 'length', { get: () => fakePlugins.length });
            Object.defineProperty(pluginArray, 'refresh', { value: () => {} });

            Object.defineProperty(navigator, 'plugins', {
                get: () => pluginArray,
                configurable: true,
            });

            // --- navigator.mimeTypes ---
            const fakeMimeTypes = [
                { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format' },
            ];
            const mimeArray = Object.create(MimeTypeArray.prototype);
            fakeMimeTypes.forEach((m, i) => {
                const mime = Object.create(MimeType.prototype);
                Object.defineProperties(mime, {
                    type: { get: () => m.type, enumerable: true },
                    suffixes: { get: () => m.suffixes, enumerable: true },
                    description: { get: () => m.description, enumerable: true },
                });
                Object.defineProperty(mimeArray, i, { get: () => mime, enumerable: true });
                Object.defineProperty(mimeArray, m.type, { get: () => mime });
            });
            Object.defineProperty(mimeArray, 'length', { get: () => fakeMimeTypes.length });
            Object.defineProperty(navigator, 'mimeTypes', {
                get: () => mimeArray,
                configurable: true,
            });
        })();
    `);

    // 2. Chrome runtime object emulation
    await context.addInitScript(`
        (() => {
            if (!window.chrome) {
                window.chrome = {};
            }
            window.chrome.runtime = {
                connect: function() { return { onMessage: { addListener: function() {} }, postMessage: function() {}, onDisconnect: { addListener: function() {} } }; },
                sendMessage: function() {},
                id: undefined,
                onMessage: { addListener: function() {}, removeListener: function() {}, hasListener: function() { return false; } },
                onConnect: { addListener: function() {}, removeListener: function() {}, hasListener: function() { return false; } },
                onInstalled: { addListener: function() {}, removeListener: function() {}, hasListener: function() { return false; } },
            };

            window.chrome.loadTimes = function() {
                return {
                    commitLoadTime: Date.now() / 1000 - 2.5,
                    connectionInfo: 'h2',
                    finishDocumentLoadTime: Date.now() / 1000 - 0.3,
                    finishLoadTime: Date.now() / 1000 - 0.1,
                    firstPaintAfterLoadTime: 0,
                    firstPaintTime: Date.now() / 1000 - 1.8,
                    navigationType: 'Other',
                    npnNegotiatedProtocol: 'h2',
                    requestTime: Date.now() / 1000 - 3,
                    startLoadTime: Date.now() / 1000 - 2.8,
                    wasAlternateProtocolAvailable: false,
                    wasFetchedViaSpdy: true,
                    wasNpnNegotiated: true,
                };
            };

            window.chrome.csi = function() {
                return {
                    onloadT: Date.now(),
                    pageT: Math.random() * 1000 + 500,
                    startE: Date.now() - 3000,
                    tran: 15,
                };
            };

            // Make chrome properties non-writable to appear native
            try {
                Object.keys(window.chrome).forEach(key => {
                    Object.defineProperty(window.chrome, key, {
                        writable: false,
                        configurable: false,
                    });
                });
            } catch(e) {}
        })();
    `);

    // 3. WebGL fingerprint spoofing
    await context.addInitScript(`
        (() => {
            const VENDOR = '${config.webglVendor}';
            const RENDERER = '${config.webglRenderer}';

            const getParameterOrig = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) return VENDOR;   // UNMASKED_VENDOR_WEBGL
                if (parameter === 37446) return RENDERER;  // UNMASKED_RENDERER_WEBGL
                return getParameterOrig.call(this, parameter);
            };

            // WebGL2
            if (typeof WebGL2RenderingContext !== 'undefined') {
                const getParameter2Orig = WebGL2RenderingContext.prototype.getParameter;
                WebGL2RenderingContext.prototype.getParameter = function(parameter) {
                    if (parameter === 37445) return VENDOR;
                    if (parameter === 37446) return RENDERER;
                    return getParameter2Orig.call(this, parameter);
                };
            }

            // Debug extension
            const getExtensionOrig = WebGLRenderingContext.prototype.getExtension;
            WebGLRenderingContext.prototype.getExtension = function(name) {
                const ext = getExtensionOrig.call(this, name);
                if (name === 'WEBGL_debug_renderer_info' && ext) {
                    return ext;
                }
                return ext;
            };
        })();
    `);

    // 4. Canvas fingerprint noise (adds minimal noise to canvas to create unique fingerprint per profile)
    await context.addInitScript(`
        (() => {
            const SEED = ${hashString(config.seed)};

            // Simple seeded random for canvas noise
            let canvasState = SEED;
            function canvasRng() {
                canvasState |= 0;
                canvasState = (canvasState + 0x6d2b79f5) | 0;
                let t = Math.imul(canvasState ^ (canvasState >>> 15), 1 | canvasState);
                t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            }

            const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
                const ctx = this.getContext('2d');
                if (ctx && this.width > 0 && this.height > 0) {
                    try {
                        const imageData = ctx.getImageData(0, 0, Math.min(this.width, 16), Math.min(this.height, 16));
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            // Add very small noise to RGB channels
                            imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + (canvasRng() > 0.5 ? 1 : -1)));
                        }
                        ctx.putImageData(imageData, 0, 0);
                    } catch(e) {
                        // Cross-origin canvas, skip
                    }
                }
                return origToDataURL.call(this, type, quality);
            };

            const origToBlob = HTMLCanvasElement.prototype.toBlob;
            HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
                // Trigger noise via toDataURL first
                this.toDataURL(type, quality);
                return origToBlob.call(this, callback, type, quality);
            };
        })();
    `);

    // 5. Permissions API override
    await context.addInitScript(`
        (() => {
            const origQuery = navigator.permissions.query;
            navigator.permissions.query = function(parameters) {
                // Return 'prompt' for notifications (common bot detection check)
                if (parameters.name === 'notifications') {
                    return Promise.resolve({ state: 'prompt', onchange: null, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true });
                }
                return origQuery.call(this, parameters);
            };
        })();
    `);

    // 6. WebRTC leak prevention
    await context.addInitScript(`
        (() => {
            // Override RTCPeerConnection to prevent IP leaks
            const origRTCPeerConnection = window.RTCPeerConnection;
            if (origRTCPeerConnection) {
                window.RTCPeerConnection = function(config, constraints) {
                    // Force using relay (TURN) only to prevent IP leak
                    if (config && config.iceServers) {
                        config.iceTransportPolicy = 'relay';
                    }
                    return new origRTCPeerConnection(config, constraints);
                };
                window.RTCPeerConnection.prototype = origRTCPeerConnection.prototype;
                Object.defineProperty(window.RTCPeerConnection, 'name', { value: 'RTCPeerConnection' });

                // Also handle the old prefixed version
                if (window.webkitRTCPeerConnection) {
                    window.webkitRTCPeerConnection = window.RTCPeerConnection;
                }
            }
        })();
    `);

    // 7. Screen resolution spoofing
    await context.addInitScript(`
        (() => {
            Object.defineProperty(screen, 'width', { get: () => ${config.screenWidth}, configurable: true });
            Object.defineProperty(screen, 'height', { get: () => ${config.screenHeight}, configurable: true });
            Object.defineProperty(screen, 'availWidth', { get: () => ${config.screenWidth}, configurable: true });
            Object.defineProperty(screen, 'availHeight', { get: () => ${config.screenHeight - 40}, configurable: true });
            Object.defineProperty(screen, 'colorDepth', { get: () => 24, configurable: true });
            Object.defineProperty(screen, 'pixelDepth', { get: () => 24, configurable: true });
        })();
    `);

    // 8. Iframe content window protection
    await context.addInitScript(`
        (() => {
            // Ensure contentWindow of iframes also appears non-automated
            const originalAttachShadow = Element.prototype.attachShadow;
            if (originalAttachShadow) {
                Element.prototype.attachShadow = function(options) {
                    return originalAttachShadow.call(this, options);
                };
            }

            // Prevent detection via toString checks
            const nativeToString = Function.prototype.toString;
            const proxyToString = new Proxy(nativeToString, {
                apply: function(target, thisArg, args) {
                    // If checking our overridden functions, return native-looking code
                    if (thisArg === navigator.permissions.query) {
                        return 'function query() { [native code] }';
                    }
                    return nativeToString.call(thisArg);
                },
            });
            Function.prototype.toString = proxyToString;
        })();
    `);

    // 9. Automation-specific property cleanup
    await context.addInitScript(`
        (() => {
            // Remove Playwright/automation traces
            delete window.__playwright;
            delete window.__pw_manual;
            delete window.__PW_inspect;

            // Remove CDP traces
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;

            // Clean up error stack traces that mention automation
            const originalError = Error;
            const cleanStack = (stack) => {
                if (!stack) return stack;
                return stack.split('\\n').filter(line =>
                    !line.includes('playwright') &&
                    !line.includes('puppeteer') &&
                    !line.includes('automation')
                ).join('\\n');
            };

            // Override Error.captureStackTrace if exists
            if (Error.captureStackTrace) {
                const origCapture = Error.captureStackTrace;
                Error.captureStackTrace = function(obj, fn) {
                    origCapture.call(this, obj, fn);
                    if (obj.stack) {
                        obj.stack = cleanStack(obj.stack);
                    }
                };
            }
        })();
    `);
}

/**
 * Get the full list of Chrome launch args for anti-detection.
 */
export function getStealthLaunchArgs(): string[] {
    return [
        // Core anti-detection
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--no-first-run',
        '--no-default-browser-check',

        // Disable automation-related features
        '--disable-features=AutomationControlled,CalculateNativeWinOcclusion',
        '--disable-background-networking',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-sync',
        '--disable-translate',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',

        // Privacy and fingerprint
        '--disable-web-security=false',
        '--disable-site-isolation-trials',
        '--metrics-recording-only',
        '--no-pings',
        '--disable-breakpad',

        // Appear as a regular browser
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--password-store=basic',
        '--use-mock-keychain',
        '--lang=vi-VN',

        // Performance
        '--disable-gpu-sandbox',
        '--ignore-certificate-errors',
    ];
}
