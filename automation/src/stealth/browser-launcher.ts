import { chromium, Browser, BrowserContext, Page, LaunchOptions } from 'playwright';
// Note: Using require for CommonJS compatibility with stealth plugin
const { chromium: playwrightExtra } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin
playwrightExtra.use(StealthPlugin());

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

// User Agent pool - Updated for 2026
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
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

/**
 * Launch a stealth browser instance with anti-detection configurations
 */
export async function launchStealthBrowser(options?: StealthLaunchOptions): Promise<StealthBrowserInstance> {
    const resolution = getRandomResolution();
    const userAgent = getRandomUserAgent();

    const launchOptions: LaunchOptions = {
        headless: options?.headless ?? false, // Headful by default for better stealth
        args: [
            // Disable automation flags
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',

            // Realistic browser settings
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',

            // Window size
            `--window-size=${resolution.width},${resolution.height}`,

            // Disable some fingerprinting vectors
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',

            // User data persistence (important for session management)
            ...(options?.profilePath ? [`--user-data-dir=${options.profilePath}`] : []),
        ],
    };

    // Add proxy if provided
    if (options?.proxy) {
        launchOptions.proxy = {
            server: options.proxy.server,
            username: options.proxy.username,
            password: options.proxy.password,
        };
    }

    // Launch browser with stealth plugin
    const browser = await playwrightExtra.launch(launchOptions);

    // Create context with realistic settings
    const context = await browser.newContext({
        viewport: resolution,

        // Timezone & Locale (Vietnam)
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh',

        // Permissions
        permissions: ['geolocation', 'notifications'],

        // Geolocation (Hanoi coordinates)
        geolocation: { latitude: 21.0285, longitude: 105.8542 },

        // User Agent
        userAgent: userAgent,

        // Extra HTTP headers
        extraHTTPHeaders: {
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="121", "Google Chrome";v="121"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        },

        // Ignore HTTPS errors (useful for some proxies)
        ignoreHTTPSErrors: true,

        // Device scale factor
        deviceScaleFactor: 1,

        // Color scheme
        colorScheme: 'light',
    });

    // Inject anti-detection scripts for each new page
    await context.addInitScript(() => {
        // Override webdriver property
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        // Delete webdriver from prototype
        if (navigator.webdriver) {
            delete (navigator as any).__proto__.webdriver;
        }

        // Override plugins (fake having plugins)
        Object.defineProperty(navigator, 'plugins', {
            get: () => {
                const plugins = [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' },
                ];
                return plugins;
            },
        });

        // Override languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['vi-VN', 'vi', 'en-US', 'en'],
        });

        // Override hardware concurrency (random realistic value)
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => Math.floor(Math.random() * 8) + 4, // 4-12 cores
        });

        // Override device memory
        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => [4, 8, 16][Math.floor(Math.random() * 3)], // 4, 8, or 16 GB
        });

        // Override chrome runtime (make it look like real Chrome)
        (window as any).chrome = {
            runtime: {
                connect: () => { },
                sendMessage: () => { },
            },
            loadTimes: () => { },
            csi: () => { },
            app: {},
        };

        // Override permissions query
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) => {
            if (parameters.name === 'notifications') {
                return Promise.resolve({ state: Notification.permission } as PermissionStatus);
            }
            return originalQuery.call(window.navigator.permissions, parameters);
        };

        // Canvas fingerprint noise
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function (type?: string, quality?: any) {
            if (type === 'image/png' && this.width > 0 && this.height > 0) {
                const context = this.getContext('2d');
                if (context) {
                    const imageData = context.getImageData(0, 0, this.width, this.height);
                    // Add subtle noise to canvas fingerprint
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        imageData.data[i] = imageData.data[i] ^ (Math.random() > 0.99 ? 1 : 0);
                    }
                    context.putImageData(imageData, 0, 0);
                }
            }
            return originalToDataURL.apply(this, [type, quality]);
        };

        // WebGL fingerprint masking
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function (parameter: number) {
            // UNMASKED_VENDOR_WEBGL
            if (parameter === 37445) {
                return 'Intel Inc.';
            }
            // UNMASKED_RENDERER_WEBGL
            if (parameter === 37446) {
                return 'Intel Iris OpenGL Engine';
            }
            return getParameter.call(this, parameter);
        };

        // WebGL2 fingerprint masking
        if (typeof WebGL2RenderingContext !== 'undefined') {
            const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
            WebGL2RenderingContext.prototype.getParameter = function (parameter: number) {
                if (parameter === 37445) {
                    return 'Intel Inc.';
                }
                if (parameter === 37446) {
                    return 'Intel Iris OpenGL Engine';
                }
                return getParameter2.call(this, parameter);
            };
        }
    });

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
