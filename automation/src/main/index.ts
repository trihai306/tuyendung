import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { Browser, BrowserContext, Page } from 'playwright';
import { launchStealthBrowser, createStealthPage, StealthLaunchOptions } from '../stealth/browser-launcher';
import { HumanBehavior } from '../stealth/human-behavior';
import { ProxyRotator, ProxyConfig } from '../stealth/proxy-rotator';

// Global state
let mainWindow: BrowserWindow | null = null;
let stealthBrowser: { browser: Browser; context: BrowserContext } | null = null;
let activePage: Page | null = null;
let humanBehavior: HumanBehavior | null = null;
const proxyRotator = new ProxyRotator();

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Stealth Automation',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: join(__dirname, '../preload/index.js'),
        },
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function setupIpcHandlers() {
    // Launch stealth browser
    ipcMain.handle('browser:launch', async (_, options: StealthLaunchOptions = {}) => {
        try {
            // Get proxy if available
            if (proxyRotator.hasProxies && !options.proxy) {
                const proxy = proxyRotator.getNext();
                if (proxy) {
                    options.proxy = proxy;
                }
            }

            const result = await launchStealthBrowser(options);
            stealthBrowser = result;

            return { success: true, message: 'Browser launched successfully' };
        } catch (error) {
            console.error('Failed to launch browser:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // Close browser
    ipcMain.handle('browser:close', async () => {
        try {
            if (stealthBrowser) {
                await stealthBrowser.browser.close();
                stealthBrowser = null;
                activePage = null;
                humanBehavior = null;
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Navigate to URL
    ipcMain.handle('browser:navigate', async (_, url: string) => {
        try {
            if (!stealthBrowser) {
                return { success: false, error: 'Browser not launched' };
            }

            // Create new page if needed
            if (!activePage) {
                activePage = await createStealthPage(stealthBrowser.context);
                humanBehavior = new HumanBehavior(activePage);
            }

            await activePage.goto(url, { waitUntil: 'domcontentloaded' });

            // Random delay after navigation (human-like)
            if (humanBehavior) {
                await humanBehavior.randomDelay(1000, 2000);
            }

            const title = await activePage.title();
            return { success: true, title };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Take screenshot
    ipcMain.handle('browser:screenshot', async () => {
        try {
            if (!activePage) {
                return { success: false, error: 'No active page' };
            }

            const screenshot = await activePage.screenshot({ type: 'png' });
            return { success: true, data: screenshot.toString('base64') };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Human click
    ipcMain.handle('browser:click', async (_, selector: string) => {
        try {
            if (!activePage || !humanBehavior) {
                return { success: false, error: 'No active page' };
            }

            await humanBehavior.humanClick(selector);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Human type
    ipcMain.handle('browser:type', async (_, { selector, text }: { selector: string; text: string }) => {
        try {
            if (!activePage || !humanBehavior) {
                return { success: false, error: 'No active page' };
            }

            await humanBehavior.humanType(selector, text, { makeTypos: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Human scroll
    ipcMain.handle('browser:scroll', async (_, direction: 'up' | 'down') => {
        try {
            if (!activePage || !humanBehavior) {
                return { success: false, error: 'No active page' };
            }

            await humanBehavior.humanScroll(direction);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Wait and click
    ipcMain.handle('browser:waitAndClick', async (_, { selector, timeout }: { selector: string; timeout?: number }) => {
        try {
            if (!activePage || !humanBehavior) {
                return { success: false, error: 'No active page' };
            }

            await humanBehavior.waitAndClick(selector, timeout);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Simulate reading
    ipcMain.handle('browser:simulateReading', async (_, duration: number) => {
        try {
            if (!activePage || !humanBehavior) {
                return { success: false, error: 'No active page' };
            }

            await humanBehavior.simulateReading(duration);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Get page content
    ipcMain.handle('browser:getContent', async () => {
        try {
            if (!activePage) {
                return { success: false, error: 'No active page' };
            }

            const content = await activePage.content();
            return { success: true, content };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Evaluate JavaScript
    ipcMain.handle('browser:evaluate', async (_, script: string) => {
        try {
            if (!activePage) {
                return { success: false, error: 'No active page' };
            }

            const result = await activePage.evaluate(script);
            return { success: true, result };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Proxy management
    ipcMain.handle('proxy:load', async (_, filePath: string) => {
        try {
            await proxyRotator.loadFromFile(filePath);
            return { success: true, count: proxyRotator.count };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('proxy:add', async (_, proxy: ProxyConfig) => {
        try {
            proxyRotator.addProxy(proxy);
            return { success: true, count: proxyRotator.count };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('proxy:count', async () => {
        return { success: true, count: proxyRotator.count };
    });
}

// ============ App Lifecycle ============

app.whenReady().then(() => {
    setupIpcHandlers();
    createWindow();
});

app.on('window-all-closed', async () => {
    // Close browser before quitting
    if (stealthBrowser) {
        await stealthBrowser.browser.close();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
