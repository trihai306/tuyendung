import { chromium, Browser, BrowserContext, Page, LaunchOptions } from 'playwright';
import { createRequire } from 'module';

// ESM workaround for CommonJS modules
const require = createRequire(import.meta.url);
const playwrightExtra = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin to chromium
const stealthChromium = playwrightExtra.chromium;
stealthChromium.use(StealthPlugin());

export interface StealthLaunchOptions {
    profilePath?: string;
    proxy?: {
        server: string;
        username?: string;
        password?: string;
    };
    headless?: boolean;
}

export interface StealthBrowserInstance {
    browser: Browser;
    context: BrowserContext;
}

// ── Updated User Agent pool (Chrome 131 - Feb 2026) ──
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
];

// Screen resolutions pool
const SCREEN_RESOLUTIONS = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
];

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getRandomResolution() {
    return SCREEN_RESOLUTIONS[Math.floor(Math.random() * SCREEN_RESOLUTIONS.length)];
}

// ── Generate stable random values per-session (NOT per-call) ──
function generateSessionFingerprint() {
    const cores = [4, 6, 8, 12, 16];
    const memory = [4, 8, 16, 32];
    return {
        hardwareConcurrency: cores[Math.floor(Math.random() * cores.length)],
        deviceMemory: memory[Math.floor(Math.random() * memory.length)],
        maxTouchPoints: 0,
        platform: Math.random() > 0.5 ? 'Win32' : 'MacIntel',
    };
}

/**
 * Launch a stealth browser instance with anti-detection configurations
 */
export async function launchStealthBrowser(options?: StealthLaunchOptions): Promise<StealthBrowserInstance> {
    const resolution = getRandomResolution();
    const userAgent = getRandomUserAgent();
    const fingerprint = generateSessionFingerprint();

    // Determine platform from UA
    const isWindows = userAgent.includes('Windows');
    const platform = isWindows ? 'Win32' : 'MacIntel';
    const chromeVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || '131';

    const args = [
        // ── Core anti-detection ──
        '--disable-blink-features=AutomationControlled',

        // ── Realistic browser behavior ──
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',

        // ── Window ──
        `--window-size=${resolution.width},${resolution.height}`,

        // ── Privacy / fingerprint hardening ──
        '--disable-features=IsolateOrigins,site-per-process,TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',

        // ── Fake being a normal Chrome with extensions ──
        '--disable-extensions-except=',
        '--enable-features=NetworkService,NetworkServiceInProcess',

        // ── Hide headless indicators ──
        '--disable-gpu-sandbox',
        '--hide-scrollbars=false',
        '--mute-audio',
    ];

    // Build Sec-Ch-Ua header matching the UA version
    const secChUa = `"Chromium";v="${chromeVersion}", "Google Chrome";v="${chromeVersion}", "Not-A.Brand";v="99"`;

    const contextOptions: any = {
        viewport: resolution,

        // Timezone & Locale (Vietnam)
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh',

        // Permissions
        permissions: ['geolocation', 'notifications'] as string[],

        // Geolocation (Ho Chi Minh City)
        geolocation: { latitude: 10.7769, longitude: 106.7009 },

        // User Agent
        userAgent: userAgent,

        // Extra HTTP headers - must match UA
        extraHTTPHeaders: {
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Sec-Ch-Ua': secChUa,
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': `"${isWindows ? 'Windows' : 'macOS'}"`,
            'Upgrade-Insecure-Requests': '1',
        },

        // Ignore HTTPS errors (useful for some proxies)
        ignoreHTTPSErrors: true,

        // Device scale factor
        deviceScaleFactor: isWindows ? 1 : 2,

        // Color scheme
        colorScheme: 'light' as const,
    };

    // Add proxy if provided
    if (options?.proxy) {
        contextOptions.proxy = {
            server: options.proxy.server,
            username: options.proxy.username,
            password: options.proxy.password,
        };
    }

    let browser: Browser;
    let context: BrowserContext;

    // Use launchPersistentContext if profilePath is provided (for session persistence)
    if (options?.profilePath) {
        context = await stealthChromium.launchPersistentContext(options.profilePath, {
            headless: options?.headless ?? false, // Default to headed for better stealth
            args,
            ...contextOptions,
        });
        browser = context.browser()!;
    } else {
        browser = await stealthChromium.launch({
            headless: options?.headless ?? false, // Default to headed
            args,
        });
        context = await browser.newContext(contextOptions);
    }

    // ── COMPREHENSIVE ANTI-DETECTION SCRIPTS ──
    await context.addInitScript((fp: any) => {
        // ═══════════════════════════════════════════
        // 1. NAVIGATOR PROPERTY OVERRIDES
        // ═══════════════════════════════════════════

        // Remove webdriver flag completely
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
            configurable: true,
        });

        // Delete from prototype chain
        try {
            const proto = Object.getPrototypeOf(navigator);
            if (proto.hasOwnProperty('webdriver')) {
                delete proto.webdriver;
            }
        } catch (e) { }

        // Stable hardware concurrency (same value per session)
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => fp.hardwareConcurrency,
            configurable: true,
        });

        // Stable device memory
        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => fp.deviceMemory,
            configurable: true,
        });

        // Max touch points (0 for desktop)
        Object.defineProperty(navigator, 'maxTouchPoints', {
            get: () => fp.maxTouchPoints,
            configurable: true,
        });

        // Platform must match UA
        Object.defineProperty(navigator, 'platform', {
            get: () => fp.platform,
            configurable: true,
        });

        // Languages
        Object.defineProperty(navigator, 'languages', {
            get: () => Object.freeze(['vi-VN', 'vi', 'en-US', 'en']),
            configurable: true,
        });

        // ═══════════════════════════════════════════
        // 2. PLUGINS - Proper PluginArray emulation
        // ═══════════════════════════════════════════

        const pluginData = [
            {
                name: 'PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                    { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                    { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                ],
            },
            {
                name: 'Chrome PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                    { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                ],
            },
            {
                name: 'Chromium PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                    { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                ],
            },
            {
                name: 'Microsoft Edge PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                    { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                ],
            },
            {
                name: 'WebKit built-in PDF',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                    { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                ],
            },
        ];

        // Create proper Plugin-like objects
        const fakePlugins: any = {
            length: pluginData.length,
            item: (index: number) => fakePlugins[index] || null,
            namedItem: (name: string) => pluginData.find(p => p.name === name) || null,
            refresh: () => { },
            [Symbol.iterator]: function* () {
                for (let i = 0; i < pluginData.length; i++) {
                    yield fakePlugins[i];
                }
            },
        };

        pluginData.forEach((p, i) => {
            fakePlugins[i] = {
                name: p.name,
                description: p.description,
                filename: p.filename,
                length: p.mimeTypes.length,
                item: (idx: number) => p.mimeTypes[idx] || null,
                namedItem: (name: string) => p.mimeTypes.find((m: any) => m.type === name) || null,
                [Symbol.toStringTag]: 'Plugin',
            };
        });

        Object.defineProperty(navigator, 'plugins', {
            get: () => fakePlugins,
            configurable: true,
        });

        // MimeTypes
        const allMimeTypes: any[] = [];
        pluginData.forEach(p => {
            p.mimeTypes.forEach(m => {
                allMimeTypes.push({ ...m, enabledPlugin: { name: p.name } });
            });
        });

        const fakeMimeTypes: any = {
            length: allMimeTypes.length,
            item: (index: number) => allMimeTypes[index] || null,
            namedItem: (name: string) => allMimeTypes.find(m => m.type === name) || null,
            [Symbol.iterator]: function* () {
                for (let i = 0; i < allMimeTypes.length; i++) {
                    yield allMimeTypes[i];
                }
            },
        };
        allMimeTypes.forEach((m, i) => { fakeMimeTypes[i] = m; });

        Object.defineProperty(navigator, 'mimeTypes', {
            get: () => fakeMimeTypes,
            configurable: true,
        });

        // pdfViewerEnabled (Chrome 87+)
        Object.defineProperty(navigator, 'pdfViewerEnabled', {
            get: () => true,
            configurable: true,
        });

        // ═══════════════════════════════════════════
        // 3. CHROME RUNTIME OBJECT
        // ═══════════════════════════════════════════

        if (!(window as any).chrome) {
            (window as any).chrome = {};
        }

        const chrome = (window as any).chrome;
        chrome.runtime = {
            OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
            OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
            PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
            PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
            PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
            RequestUpdateCheckStatus: { THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available' },
            connect: function () { return { onDisconnect: { addListener: function () { } }, onMessage: { addListener: function () { } }, postMessage: function () { }, disconnect: function () { } }; },
            sendMessage: function () { },
            id: undefined,
        };

        chrome.loadTimes = function () {
            return {
                commitLoadTime: Date.now() / 1000 - Math.random() * 2,
                connectionInfo: 'h2',
                finishDocumentLoadTime: Date.now() / 1000 - Math.random(),
                finishLoadTime: Date.now() / 1000 - Math.random() * 0.5,
                firstPaintAfterLoadTime: 0,
                firstPaintTime: Date.now() / 1000 - Math.random() * 1.5,
                navigationType: 'Other',
                npnNegotiatedProtocol: 'h2',
                requestTime: Date.now() / 1000 - Math.random() * 3,
                startLoadTime: Date.now() / 1000 - Math.random() * 2.5,
                wasAlternateProtocolAvailable: false,
                wasFetchedViaSpdy: true,
                wasNpnNegotiated: true,
            };
        };

        chrome.csi = function () {
            return {
                onloadT: Date.now(),
                pageT: Math.random() * 1000 + 500,
                startE: Date.now() - Math.random() * 3000,
                tran: 15,
            };
        };

        chrome.app = {
            InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
            RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
            getDetails: function () { return null; },
            getIsInstalled: function () { return false; },
            installState: function () { return 'not_installed'; },
            isInstalled: false,
            runningState: function () { return 'cannot_run'; },
        };

        // ═══════════════════════════════════════════
        // 4. CDP DETECTION PREVENTION
        // ═══════════════════════════════════════════

        // Hide Runtime.enable artifacts
        // Some detectors check for the presence of window.cdc_adoQpoasnfa76pfcZLmcfl_ or similar
        // Remove any CDP-related properties
        const cdpProperties = Object.getOwnPropertyNames(window).filter(
            p => p.match(/^(cdc_|__webdriver|__selenium|__fxdriver|_Selenium|calledSelenium|_WEBDRIVER|chromeDr|driver-evaluate|webdriver-evaluate)/)
        );
        cdpProperties.forEach(p => {
            try {
                delete (window as any)[p];
            } catch (e) { }
        });

        // Override Error stack to remove playwright/puppeteer references
        const originalError = Error;
        const _Error = function (this: Error, ...args: any[]) {
            const error = new originalError(...args);
            const stack = error.stack || '';
            // Remove any playwright/puppeteer/cdp references from stack traces
            error.stack = stack
                .split('\n')
                .filter(line => !/playwright|puppeteer|cdp|__puppeteer|DevTools/i.test(line))
                .join('\n');
            return error;
        };
        _Error.prototype = originalError.prototype;
        // Don't override globally to avoid breaking things, but clean up eval traces

        // Prevent detection via toString
        const nativeToString = Function.prototype.toString;
        const overriddenFns = new Map<Function, string>();

        function makeNativeString(fn: Function, nativeName: string) {
            overriddenFns.set(fn, `function ${nativeName}() { [native code] }`);
        }

        Function.prototype.toString = function () {
            if (overriddenFns.has(this)) {
                return overriddenFns.get(this)!;
            }
            return nativeToString.call(this);
        };

        makeNativeString(Function.prototype.toString, 'toString');

        // ═══════════════════════════════════════════
        // 5. PERMISSIONS API FIX
        // ═══════════════════════════════════════════

        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) => {
            if (parameters.name === 'notifications') {
                return Promise.resolve({ state: Notification.permission } as PermissionStatus);
            }
            return originalQuery.call(window.navigator.permissions, parameters);
        };
        makeNativeString(window.navigator.permissions.query, 'query');

        // ═══════════════════════════════════════════
        // 6. IFRAME CONTENTWINDOW PROTECTION
        // ═══════════════════════════════════════════

        // Ensure iframes show consistent navigator
        try {
            const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
            if (elementDescriptor) {
                Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
                    get: function () {
                        const iframe = elementDescriptor.get?.call(this);
                        if (iframe) {
                            try {
                                // Set same navigator properties in iframe
                                Object.defineProperty(iframe.navigator, 'webdriver', { get: () => false });
                            } catch (e) { }
                        }
                        return iframe;
                    },
                });
            }
        } catch (e) { }

        // ═══════════════════════════════════════════
        // 7. WEBGL FINGERPRINT (consistent)
        // ═══════════════════════════════════════════

        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function (parameter: number) {
            if (parameter === 37445) return 'Google Inc. (Intel)';
            if (parameter === 37446) return 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)';
            return getParameter.call(this, parameter);
        };
        makeNativeString(WebGLRenderingContext.prototype.getParameter, 'getParameter');

        if (typeof WebGL2RenderingContext !== 'undefined') {
            const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
            WebGL2RenderingContext.prototype.getParameter = function (parameter: number) {
                if (parameter === 37445) return 'Google Inc. (Intel)';
                if (parameter === 37446) return 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)';
                return getParameter2.call(this, parameter);
            };
            makeNativeString(WebGL2RenderingContext.prototype.getParameter, 'getParameter');
        }

        // ═══════════════════════════════════════════
        // 8. NOTIFICATION & CONNECTION API
        // ═══════════════════════════════════════════

        // NetworkInformation API (realistic)
        if ('connection' in navigator) {
            try {
                Object.defineProperty(navigator, 'connection', {
                    get: () => ({
                        effectiveType: '4g',
                        rtt: 50,
                        downlink: 10,
                        saveData: false,
                    }),
                    configurable: true,
                });
            } catch (e) { }
        }

        // Battery API (return non-promise values)
        if ('getBattery' in navigator) {
            (navigator as any).getBattery = () => Promise.resolve({
                charging: true,
                chargingTime: 0,
                dischargingTime: Infinity,
                level: 1,
                addEventListener: () => { },
                removeEventListener: () => { },
            });
        }

    }, fingerprint);

    return { browser, context };
}

/**
 * Create a new page with additional stealth configurations
 */
export async function createStealthPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();

    // Set extra headers for this specific page
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    return page;
}
