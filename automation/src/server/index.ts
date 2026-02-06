import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { Browser, BrowserContext, Page } from 'playwright';
import { launchStealthBrowser, createStealthPage, StealthLaunchOptions } from './stealth/browser-launcher.js';
import { HumanBehavior } from './stealth/human-behavior.js';
import { ProxyRotator, ProxyConfig } from './stealth/proxy-rotator.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// Global state
let stealthBrowser: { browser: Browser; context: BrowserContext } | null = null;
let activePage: Page | null = null;
let humanBehavior: HumanBehavior | null = null;
const proxyRotator = new ProxyRotator();

app.use(cors());
app.use(express.json());

// Logging helper
function log(message: string, type: 'info' | 'success' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    console.log(`[${timestamp}] ${message}`);
    io.emit('log', { message, type, time: timestamp });
}

// ============ REST API Endpoints ============

// Status
app.get('/api/status', (req, res) => {
    res.json({
        browserRunning: !!stealthBrowser,
        hasActivePage: !!activePage,
        proxyCount: proxyRotator.count,
    });
});

// Launch browser
app.post('/api/browser/launch', async (req, res) => {
    try {
        if (stealthBrowser) {
            return res.json({ success: false, error: 'Browser already running' });
        }

        const options: StealthLaunchOptions = req.body || {};

        // Get proxy if available
        if (proxyRotator.hasProxies && !options.proxy) {
            const proxy = proxyRotator.getNext();
            if (proxy) {
                options.proxy = proxy;
                log(`Using proxy: ${proxy.server}`);
            }
        }

        log('Launching stealth browser...');
        const result = await launchStealthBrowser(options);
        stealthBrowser = result;

        log('Browser launched successfully!', 'success');
        res.json({ success: true, message: 'Browser launched successfully' });
    } catch (error) {
        log(`Failed to launch browser: ${(error as Error).message}`, 'error');
        res.json({ success: false, error: (error as Error).message });
    }
});

// Close browser
app.post('/api/browser/close', async (req, res) => {
    try {
        if (stealthBrowser) {
            await stealthBrowser.browser.close();
            stealthBrowser = null;
            activePage = null;
            humanBehavior = null;
            log('Browser closed', 'info');
        }
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Navigate
app.post('/api/browser/navigate', async (req, res) => {
    try {
        const { url } = req.body;
        if (!stealthBrowser) {
            return res.json({ success: false, error: 'Browser not launched' });
        }

        // Create new page if needed
        if (!activePage) {
            activePage = await createStealthPage(stealthBrowser.context);
            humanBehavior = new HumanBehavior(activePage);
        }

        log(`Navigating to: ${url}`);
        await activePage.goto(url, { waitUntil: 'domcontentloaded' });

        // Random delay after navigation (human-like)
        if (humanBehavior) {
            await humanBehavior.randomDelay(1000, 2000);
        }

        const title = await activePage.title();
        log(`Page loaded: ${title}`, 'success');
        res.json({ success: true, title });
    } catch (error) {
        log(`Navigation failed: ${(error as Error).message}`, 'error');
        res.json({ success: false, error: (error as Error).message });
    }
});

// Screenshot
app.get('/api/browser/screenshot', async (req, res) => {
    try {
        if (!activePage) {
            return res.json({ success: false, error: 'No active page' });
        }

        const screenshot = await activePage.screenshot({ type: 'png' });
        res.json({ success: true, data: screenshot.toString('base64') });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Human click
app.post('/api/browser/click', async (req, res) => {
    try {
        const { selector } = req.body;
        if (!activePage || !humanBehavior) {
            return res.json({ success: false, error: 'No active page' });
        }

        log(`Clicking: ${selector}`);
        await humanBehavior.humanClick(selector);
        log('Click performed', 'success');
        res.json({ success: true });
    } catch (error) {
        log(`Click failed: ${(error as Error).message}`, 'error');
        res.json({ success: false, error: (error as Error).message });
    }
});

// Human type
app.post('/api/browser/type', async (req, res) => {
    try {
        const { selector, text } = req.body;
        if (!activePage || !humanBehavior) {
            return res.json({ success: false, error: 'No active page' });
        }

        log(`Typing into: ${selector}`);
        await humanBehavior.humanType(selector, text, { makeTypos: true });
        log('Typing completed', 'success');
        res.json({ success: true });
    } catch (error) {
        log(`Type failed: ${(error as Error).message}`, 'error');
        res.json({ success: false, error: (error as Error).message });
    }
});

// Human scroll
app.post('/api/browser/scroll', async (req, res) => {
    try {
        const { direction } = req.body;
        if (!activePage || !humanBehavior) {
            return res.json({ success: false, error: 'No active page' });
        }

        await humanBehavior.humanScroll(direction);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Simulate reading
app.post('/api/browser/simulate-reading', async (req, res) => {
    try {
        const { duration = 10000 } = req.body;
        if (!activePage || !humanBehavior) {
            return res.json({ success: false, error: 'No active page' });
        }

        log(`Simulating reading for ${duration / 1000}s...`);
        await humanBehavior.simulateReading(duration);
        log('Reading simulation completed', 'success');
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Get page content
app.get('/api/browser/content', async (req, res) => {
    try {
        if (!activePage) {
            return res.json({ success: false, error: 'No active page' });
        }

        const content = await activePage.content();
        res.json({ success: true, content });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// ============ Proxy Management ============

app.post('/api/proxy/load', async (req, res) => {
    try {
        const { filePath } = req.body;
        await proxyRotator.loadFromFile(filePath);
        log(`Loaded ${proxyRotator.count} proxies`, 'success');
        res.json({ success: true, count: proxyRotator.count });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

app.post('/api/proxy/add', async (req, res) => {
    try {
        const proxy: ProxyConfig = req.body;
        proxyRotator.addProxy(proxy);
        res.json({ success: true, count: proxyRotator.count });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

app.get('/api/proxy/count', (req, res) => {
    res.json({ success: true, count: proxyRotator.count });
});

// ============ WebSocket Events ============

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// ============ Start Server ============

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║        🕵️  STEALTH AUTOMATION SERVER                    ║
╠══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}              ║
║  Frontend:          http://localhost:5173               ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    if (stealthBrowser) {
        await stealthBrowser.browser.close();
    }
    process.exit(0);
});
