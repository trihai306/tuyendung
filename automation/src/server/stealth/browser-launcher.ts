import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { createRequire } from 'module';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

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
    useRealChrome?: boolean; // Use real Chrome binary instead of Playwright Chromium
}

export interface StealthBrowserInstance {
    browser: Browser;
    context: BrowserContext;
}

// ── Detect real Chrome/Edge/Chromium binary on the system ──
interface DetectedBrowser {
    name: string;
    executablePath: string;
    profileDir: string; // User data directory
    version: string;
}

function detectRealBrowsers(): DetectedBrowser[] {
    const browsers: DetectedBrowser[] = [];
    const platform = os.platform();
    const homeDir = os.homedir();

    if (platform === 'darwin') {
        // macOS paths
        const checks = [
            {
                name: 'Google Chrome',
                exec: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                profile: path.join(homeDir, 'Library/Application Support/Google Chrome'),
            },
            {
                name: 'Microsoft Edge',
                exec: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
                profile: path.join(homeDir, 'Library/Application Support/Microsoft Edge'),
            },
            {
                name: 'Chromium',
                exec: '/Applications/Chromium.app/Contents/MacOS/Chromium',
                profile: path.join(homeDir, 'Library/Application Support/Chromium'),
            },
            {
                name: 'Brave Browser',
                exec: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
                profile: path.join(homeDir, 'Library/Application Support/BraveSoftware/Brave-Browser'),
            },
        ];

        for (const check of checks) {
            try {
                const stats = require('fs').statSync(check.exec);
                if (stats) {
                    let version = 'unknown';
                    try {
                        version = execSync(`"${check.exec}" --version 2>/dev/null`, { timeout: 5000 })
                            .toString().trim().replace(/^.*?(\d+\.\d+\.\d+\.\d+).*$/, '$1');
                    } catch (e) { }
                    browsers.push({
                        name: check.name,
                        executablePath: check.exec,
                        profileDir: check.profile,
                        version,
                    });
                }
            } catch (e) { /* not installed */ }
        }
    } else if (platform === 'win32') {
        // Windows paths
        const checks = [
            {
                name: 'Google Chrome',
                exec: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                profile: path.join(homeDir, 'AppData/Local/Google/Chrome/User Data'),
            },
            {
                name: 'Microsoft Edge',
                exec: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                profile: path.join(homeDir, 'AppData/Local/Microsoft/Edge/User Data'),
            },
        ];

        for (const check of checks) {
            try {
                const stats = require('fs').statSync(check.exec);
                if (stats) {
                    browsers.push({
                        name: check.name,
                        executablePath: check.exec,
                        profileDir: check.profile,
                        version: 'unknown',
                    });
                }
            } catch (e) { }
        }
    } else {
        // Linux
        const checks = [
            {
                name: 'Google Chrome',
                exec: '/usr/bin/google-chrome',
                profile: path.join(homeDir, '.config/google-chrome'),
            },
            {
                name: 'Chromium',
                exec: '/usr/bin/chromium-browser',
                profile: path.join(homeDir, '.config/chromium'),
            },
        ];

        for (const check of checks) {
            try {
                const stats = require('fs').statSync(check.exec);
                if (stats) {
                    browsers.push({
                        name: check.name,
                        executablePath: check.exec,
                        profileDir: check.profile,
                        version: 'unknown',
                    });
                }
            } catch (e) { }
        }
    }

    return browsers;
}

// ── Copy essential profile data (cookies, localStorage, etc.) ──
async function cloneProfileData(sourceProfileDir: string, targetDir: string): Promise<boolean> {
    const defaultProfile = path.join(sourceProfileDir, 'Default');
    try {
        await fs.access(defaultProfile);
    } catch {
        console.log(`No Default profile found at ${sourceProfileDir}`);
        return false;
    }

    // Essential files/dirs to copy for a realistic profile
    const essentialItems = [
        'Preferences',           // Browser preferences
        'Secure Preferences',    // Secure prefs
        'Login Data',           // Saved logins (encrypted)
        'Web Data',             // Autofill data
        'Bookmarks',           // Bookmarks
        'Favicons',            // Website icons
        'History',             // Browsing history
        'Cookies',             // Cookies
        'Local Storage',       // localStorage data
        'Session Storage',     // sessionStorage data
        'IndexedDB',           // IndexedDB data
        'Extension State',     // Extension data
        'Local Extension Settings',
    ];

    const targetDefault = path.join(targetDir, 'Default');
    await fs.mkdir(targetDefault, { recursive: true });

    let copiedCount = 0;
    for (const item of essentialItems) {
        const src = path.join(defaultProfile, item);
        const dst = path.join(targetDefault, item);
        try {
            await fs.access(src);
            await copyRecursive(src, dst);
            copiedCount++;
        } catch {
            // Item doesn't exist, skip
        }
    }

    // Also copy the Local State file (contains encryption keys, etc.)
    const localState = path.join(sourceProfileDir, 'Local State');
    try {
        await fs.access(localState);
        await fs.copyFile(localState, path.join(targetDir, 'Local State'));
        copiedCount++;
    } catch { }

    console.log(`Cloned ${copiedCount} profile items from ${sourceProfileDir}`);
    return copiedCount > 0;
}

async function copyRecursive(src: string, dst: string): Promise<void> {
    const stats = await fs.stat(src);
    if (stats.isDirectory()) {
        await fs.mkdir(dst, { recursive: true });
        const entries = await fs.readdir(src);
        for (const entry of entries) {
            await copyRecursive(path.join(src, entry), path.join(dst, entry));
        }
    } else {
        await fs.copyFile(src, dst);
    }
}

// ── Get the real Chrome version from the binary ──
function getChromeVersion(execPath: string): string {
    try {
        const output = execSync(`"${execPath}" --version 2>/dev/null`, { timeout: 5000 }).toString().trim();
        const match = output.match(/(\d+)\./);
        return match ? match[1] : '131';
    } catch {
        return '131';
    }
}

// ════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════

/** Get list of detected browsers on the system */
export function getDetectedBrowsers(): DetectedBrowser[] {
    return detectRealBrowsers();
}

/**
 * Launch a stealth browser using the REAL Chrome/Edge binary
 * This is the most effective anti-detection method
 */
export async function launchStealthBrowser(options?: StealthLaunchOptions): Promise<StealthBrowserInstance> {
    const detectedBrowsers = detectRealBrowsers();
    const realBrowser = detectedBrowsers[0]; // Use first detected browser

    // ── Decide: use real Chrome or Playwright's Chromium ──
    const useReal = (options?.useRealChrome !== false) && realBrowser;

    if (useReal) {
        console.log(`🚀 Using REAL browser: ${realBrowser.name} (${realBrowser.version})`);
        console.log(`   Binary: ${realBrowser.executablePath}`);
        return launchWithRealChrome(realBrowser, options);
    } else {
        console.log('🔧 Using Playwright Chromium with stealth plugins');
        return launchWithPlaywright(options);
    }
}

// ── Launch with REAL Chrome binary ──
async function launchWithRealChrome(
    browserInfo: DetectedBrowser,
    options?: StealthLaunchOptions
): Promise<StealthBrowserInstance> {

    const chromeVersion = getChromeVersion(browserInfo.executablePath);

    const args = [
        // Core anti-detection — CRITICAL
        '--disable-blink-features=AutomationControlled',
        '--disable-automation',  // Remove "Chrome is being controlled" banner
        '--disable-infobars',
        '--no-first-run',
        '--no-default-browser-check',

        // Performance
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',

        // Remove automation indicators
        '--disable-features=IsolateOrigins,site-per-process,TranslateUI,AutomationControlled',
        '--enable-features=NetworkService,NetworkServiceInProcess',

        // Disable debugger / CDP-related detections
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-sync',

        // Misc
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--mute-audio',

        // Move window off-screen so it doesn't bother the user
        '--window-position=-32000,-32000',
        '--window-size=1920,1080',
    ];

    let browser: Browser;
    let context: BrowserContext;

    const contextOptions: any = {
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh',
        permissions: ['geolocation', 'notifications'],
        geolocation: { latitude: 10.7769, longitude: 106.7009 },
        ignoreHTTPSErrors: true,
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

    if (options?.profilePath) {
        // Clone real browser profile data into our profile path
        const hasRealData = await cloneProfileData(browserInfo.profileDir, options.profilePath);
        if (hasRealData) {
            console.log(`   ✅ Cloned real profile data into ${options.profilePath}`);
        }

        // Launch persistent context with REAL Chrome binary
        context = await stealthChromium.launchPersistentContext(options.profilePath, {
            headless: true, // Chrome 131 new headless mode — undetectable, no visible window
            executablePath: browserInfo.executablePath,
            args,
            ...contextOptions,
            channel: undefined, // Don't use channel when providing executablePath
        });
        browser = context.browser()!;
    } else {
        // Launch without persistence but with real binary
        browser = await stealthChromium.launch({
            headless: true, // Chrome 131 new headless — no window popup
            executablePath: browserInfo.executablePath,
            args,
        });
        context = await browser.newContext(contextOptions);
    }

    // ── Inject minimal anti-detection (real Chrome needs less) ──
    await context.addInitScript((params: { chromeVer: string }) => {
        // 1. Ensure webdriver is false
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
            configurable: true,
        });
        try {
            const proto = Object.getPrototypeOf(navigator);
            if (proto.hasOwnProperty('webdriver')) { delete proto.webdriver; }
        } catch (e) { }

        // 2. Clean up CDP artifacts
        const cdpProps = Object.getOwnPropertyNames(window).filter(
            p => /^(cdc_|__webdriver|__selenium|_Selenium|chromeDr|driver-evaluate|webdriver-evaluate)/.test(p)
        );
        cdpProps.forEach(p => { try { delete (window as any)[p]; } catch (e) { } });

        // 3. Ensure chrome.runtime exists properly
        if (!(window as any).chrome) (window as any).chrome = {};
        const c = (window as any).chrome;
        if (!c.runtime) {
            c.runtime = {
                OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
                OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
                PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
                PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
                PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
                RequestUpdateCheckStatus: { THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available' },
                connect: () => ({ onDisconnect: { addListener: () => { } }, onMessage: { addListener: () => { } }, postMessage: () => { }, disconnect: () => { } }),
                sendMessage: () => { },
                id: undefined,
            };
        }

        // 4. Override Function.prototype.toString for native appearance
        const nativeToString = Function.prototype.toString;
        const overrides = new Map<Function, string>();
        function makeNative(fn: Function, name: string) {
            overrides.set(fn, `function ${name}() { [native code] }`);
        }
        Function.prototype.toString = function () {
            return overrides.has(this) ? overrides.get(this)! : nativeToString.call(this);
        };
        makeNative(Function.prototype.toString, 'toString');

        // 5. Permissions
        const origQuery = navigator.permissions.query;
        navigator.permissions.query = (params: any) => {
            if (params.name === 'notifications') {
                return Promise.resolve({ state: Notification.permission } as PermissionStatus);
            }
            return origQuery.call(navigator.permissions, params);
        };
        makeNative(navigator.permissions.query, 'query');

        // 6. ── AGGRESSIVE isDevtoolOpen BYPASS ──

        // Method A: outerWidth/outerHeight must match inner
        Object.defineProperty(window, 'outerWidth', { get: () => window.innerWidth, configurable: true });
        Object.defineProperty(window, 'outerHeight', { get: () => window.innerHeight, configurable: true });

        // Method B: Defeat debugger-timing detection
        // When CDP is connected, `debugger;` pauses execution.
        // Detectors measure: let t = performance.now(); debugger; if (performance.now() - t > 100) DETECTED!
        // Fix: Track time and if a suspicious gap occurs, compress it.
        const origPerfNow = performance.now.bind(performance);
        const origDateNow = Date.now;
        let perfOffset = 0;
        let lastPerfTime = 0;

        performance.now = function () {
            const real = origPerfNow();
            const adjusted = real - perfOffset;
            // If there was a gap > 50ms since the last call, it might be a debugger pause
            if (lastPerfTime > 0 && (real - lastPerfTime) > 50) {
                const gap = real - lastPerfTime;
                if (gap > 50 && gap < 5000) {
                    // This looks like a debugger pause — absorb the gap
                    perfOffset += gap - 1; // Make it look like only 1ms passed
                }
            }
            lastPerfTime = real;
            return real - perfOffset;
        };

        let dateOffset = 0;
        let lastDateTime = 0;
        Date.now = function () {
            const real = origDateNow.call(Date);
            if (lastDateTime > 0 && (real - lastDateTime) > 50) {
                const gap = real - lastDateTime;
                if (gap > 50 && gap < 5000) {
                    dateOffset += gap - 1;
                }
            }
            lastDateTime = real;
            return real - dateOffset;
        };
        makeNative(performance.now, 'now');
        makeNative(Date.now, 'now');

        // Method C: Block console-based DevTools detection
        // Detectors log an object with a getter — the getter fires only when DevTools formats it
        const origConsoleLog = console.log;
        const origConsoleTable = console.table;
        const origConsoleClear = console.clear;
        const origConsoleDir = console.dir;

        // Wrap console methods to prevent getter-trigger detection
        console.log = function (...args: any[]) {
            // Filter out objects that might be detection probes
            const safe = args.filter(a => {
                if (a && typeof a === 'object' && !(a instanceof Error)) {
                    try {
                        const desc = Object.getOwnPropertyDescriptor(a, 'id') ||
                            Object.getOwnPropertyDescriptor(a, 'toString');
                        if (desc && desc.get) return false; // Skip getter-trap objects
                    } catch (e) { }
                }
                return true;
            });
            if (safe.length > 0) origConsoleLog.apply(console, safe);
        };

        // Method D: Prevent Firebug/React DevTools detection
        if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            // Don't create it — if it doesn't exist, detectors can't use it
        }

    }, { chromeVer: chromeVersion });

    return { browser, context };
}

// ── Fallback: Launch with Playwright Chromium + full stealth ──
async function launchWithPlaywright(options?: StealthLaunchOptions): Promise<StealthBrowserInstance> {
    const resolutions = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1536, height: 864 },
        { width: 1440, height: 900 },
    ];
    const uas = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    ];

    const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];
    const userAgent = uas[Math.floor(Math.random() * uas.length)];
    const isWindows = userAgent.includes('Windows');

    // Stable per-session fingerprint
    const cores = [4, 6, 8, 12, 16];
    const memory = [4, 8, 16, 32];
    const fp = {
        hardwareConcurrency: cores[Math.floor(Math.random() * cores.length)],
        deviceMemory: memory[Math.floor(Math.random() * memory.length)],
        platform: isWindows ? 'Win32' : 'MacIntel',
    };

    const args = [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        `--window-size=${resolution.width},${resolution.height}`,
        '--disable-features=IsolateOrigins,site-per-process,TranslateUI',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--mute-audio',
        '--window-position=-32000,-32000',
    ];

    const secChUa = `"Chromium";v="131", "Google Chrome";v="131", "Not-A.Brand";v="99"`;

    const contextOptions: any = {
        viewport: resolution,
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh',
        permissions: ['geolocation', 'notifications'],
        geolocation: { latitude: 10.7769, longitude: 106.7009 },
        userAgent,
        extraHTTPHeaders: {
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Sec-Ch-Ua': secChUa,
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': `"${isWindows ? 'Windows' : 'macOS'}"`,
        },
        ignoreHTTPSErrors: true,
        deviceScaleFactor: isWindows ? 1 : 2,
        colorScheme: 'light' as const,
    };

    if (options?.proxy) {
        contextOptions.proxy = {
            server: options.proxy.server,
            username: options.proxy.username,
            password: options.proxy.password,
        };
    }

    let browser: Browser;
    let context: BrowserContext;

    if (options?.profilePath) {
        context = await stealthChromium.launchPersistentContext(options.profilePath, {
            headless: options?.headless ?? true,
            args,
            ...contextOptions,
        });
        browser = context.browser()!;
    } else {
        browser = await stealthChromium.launch({
            headless: options?.headless ?? true,
            args,
        });
        context = await browser.newContext(contextOptions);
    }

    // Full stealth injection for Playwright Chromium
    await context.addInitScript((params: any) => {
        const fp = params;

        // Navigator
        Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true });
        try { const p = Object.getPrototypeOf(navigator); if (p.hasOwnProperty('webdriver')) delete p.webdriver; } catch (e) { }
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => fp.hardwareConcurrency, configurable: true });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => fp.deviceMemory, configurable: true });
        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0, configurable: true });
        Object.defineProperty(navigator, 'platform', { get: () => fp.platform, configurable: true });
        Object.defineProperty(navigator, 'languages', { get: () => Object.freeze(['vi-VN', 'vi', 'en-US', 'en']), configurable: true });
        Object.defineProperty(navigator, 'pdfViewerEnabled', { get: () => true, configurable: true });

        // Plugins (proper PluginArray)
        const pluginData = [
            { name: 'PDF Viewer', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
            { name: 'Chrome PDF Viewer', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
            { name: 'Chromium PDF Viewer', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
            { name: 'Microsoft Edge PDF Viewer', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
            { name: 'WebKit built-in PDF', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
        ];
        const fakePlugins: any = { length: pluginData.length, item: (i: number) => fakePlugins[i] || null, namedItem: (n: string) => pluginData.find(p => p.name === n) || null, refresh: () => { }, [Symbol.iterator]: function* () { for (let i = 0; i < pluginData.length; i++) yield fakePlugins[i]; } };
        pluginData.forEach((p, i) => { fakePlugins[i] = { ...p, length: 1, item: () => null, namedItem: () => null, [Symbol.toStringTag]: 'Plugin' }; });
        Object.defineProperty(navigator, 'plugins', { get: () => fakePlugins, configurable: true });

        // Chrome runtime
        if (!(window as any).chrome) (window as any).chrome = {};
        const c = (window as any).chrome;
        c.runtime = { OnInstalledReason: {}, OnRestartRequiredReason: {}, PlatformArch: {}, PlatformNaclArch: {}, PlatformOs: {}, RequestUpdateCheckStatus: {}, connect: () => ({ onDisconnect: { addListener: () => { } }, onMessage: { addListener: () => { } }, postMessage: () => { }, disconnect: () => { } }), sendMessage: () => { }, id: undefined };
        c.loadTimes = () => ({ commitLoadTime: Date.now() / 1000 - 1, connectionInfo: 'h2', finishDocumentLoadTime: Date.now() / 1000, finishLoadTime: Date.now() / 1000, firstPaintTime: Date.now() / 1000 - 0.5, navigationType: 'Other', npnNegotiatedProtocol: 'h2', requestTime: Date.now() / 1000 - 2, startLoadTime: Date.now() / 1000 - 1.5, wasAlternateProtocolAvailable: false, wasFetchedViaSpdy: true, wasNpnNegotiated: true });
        c.csi = () => ({ onloadT: Date.now(), pageT: 500, startE: Date.now() - 3000, tran: 15 });
        c.app = { InstallState: {}, RunningState: {}, getDetails: () => null, getIsInstalled: () => false, installState: () => 'not_installed', isInstalled: false, runningState: () => 'cannot_run' };

        // CDP cleanup
        Object.getOwnPropertyNames(window).filter(p => /^(cdc_|__webdriver|__selenium|_Selenium|chromeDr|driver-evaluate|webdriver-evaluate)/.test(p)).forEach(p => { try { delete (window as any)[p]; } catch (e) { } });

        // Function.toString
        const nts = Function.prototype.toString;
        const ov = new Map<Function, string>();
        function mk(fn: Function, n: string) { ov.set(fn, `function ${n}() { [native code] }`); }
        Function.prototype.toString = function () { return ov.has(this) ? ov.get(this)! : nts.call(this); };
        mk(Function.prototype.toString, 'toString');

        // Permissions
        const oq = navigator.permissions.query;
        navigator.permissions.query = (p: any) => p.name === 'notifications' ? Promise.resolve({ state: Notification.permission } as PermissionStatus) : oq.call(navigator.permissions, p);
        mk(navigator.permissions.query, 'query');

        // WebGL
        const gp = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function (p: number) { if (p === 37445) return 'Google Inc. (Intel)'; if (p === 37446) return 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)'; return gp.call(this, p); };
        mk(WebGLRenderingContext.prototype.getParameter, 'getParameter');
        if (typeof WebGL2RenderingContext !== 'undefined') { const gp2 = WebGL2RenderingContext.prototype.getParameter; WebGL2RenderingContext.prototype.getParameter = function (p: number) { if (p === 37445) return 'Google Inc. (Intel)'; if (p === 37446) return 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)'; return gp2.call(this, p); }; mk(WebGL2RenderingContext.prototype.getParameter, 'getParameter'); }

        // IFrame protection
        try { const ed = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow'); if (ed) { Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', { get: function () { const f = ed.get?.call(this); if (f) { try { Object.defineProperty(f.navigator, 'webdriver', { get: () => false }); } catch (e) { } } return f; } }); } } catch (e) { }

        // isDevtoolOpen bypass - match outerWidth/outerHeight to innerWidth/innerHeight
        Object.defineProperty(window, 'outerWidth', { get: () => window.innerWidth, configurable: true });
        Object.defineProperty(window, 'outerHeight', { get: () => window.innerHeight, configurable: true });

    }, fp);

    return { browser, context };
}

/**
 * Create a new page with additional stealth configurations.
 * CRITICAL: Sets Debugger.setSkipAllPauses to prevent debugger; timing detection.
 */
export async function createStealthPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    // ── CRITICAL: Disable debugger pauses on this page ──
    // Playwright's internal CDP connection has Debugger domain enabled.
    // Detection scripts use: let t = performance.now(); debugger; if (performance.now() - t > 100) DETECTED!
    // The `debugger;` pauses only because CDP Debugger is active.
    // Fix: Enable Debugger domain on our own CDP session, then setSkipAllPauses(true)
    // so `debugger;` statements are completely ignored (no pause at all).
    try {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Debugger.enable');
        await cdp.send('Debugger.setSkipAllPauses', { skip: true });
        console.log('   ✅ Debugger.setSkipAllPauses(true) — bypasses debugger; timing detection');
    } catch (e) {
        console.log('   ⚠️ Could not set skipAllPauses:', (e as Error).message);
    }

    return page;
}
