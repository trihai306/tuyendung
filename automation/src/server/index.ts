import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { Browser, BrowserContext, Page, CDPSession } from 'playwright';
import { launchStealthBrowser, createStealthPage, StealthLaunchOptions } from './stealth/browser-launcher.js';
import { HumanBehavior } from './stealth/human-behavior.js';
import { ProxyRotator, ProxyConfig } from './stealth/proxy-rotator.js';
import { profileManager, BrowserProfile, ProfileCreateInput } from './profile-manager.js';
import { randomUUID } from 'crypto';
import { AgentBridge } from './agent-bridge.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
    cors: {
        origin: 'http://localhost:5180',
        methods: ['GET', 'POST'],
    },
});

// Session type for multi-browser support
interface BrowserSessionData {
    id: string;
    profileId: string;
    profileName: string;
    browser: Browser;
    context: BrowserContext;
    page: Page | null;
    cdpSession: CDPSession | null;
    isScreencasting: boolean;
    humanBehavior: HumanBehavior | null;
}

// Multi-session storage
const browserSessions = new Map<string, BrowserSessionData>();

// Legacy single browser support (for backward compatibility)
let stealthBrowser: { browser: Browser; context: BrowserContext } | null = null;
let activePage: Page | null = null;
let humanBehavior: HumanBehavior | null = null;
let cdpSession: CDPSession | null = null;
let isScreencasting = false;
const proxyRotator = new ProxyRotator();

// Agent Bridge - connects to Soketi for receiving tasks from backend
const agentBridge = new AgentBridge({
    soketiHost: process.env.SOKETI_HOST || 'localhost',
    soketiPort: parseInt(process.env.SOKETI_PORT || '6002', 10),
    soketiKey: process.env.SOKETI_KEY || 'recruitment-key',
    agentId: process.env.AGENT_ID || `agent-${randomUUID().slice(0, 8)}`,
    backendUrl: process.env.BACKEND_URL || 'http://localhost:9000',
});

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

// ============ Auth Proxy (forwards to Viecly Backend) ============
const VIECLY_BACKEND = process.env.BACKEND_URL || 'http://localhost:9000';

app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await fetch(`${VIECLY_BACKEND}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(502).json({ success: false, message: 'Cannot connect to Viecly backend' });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        const response = await fetch(`${VIECLY_BACKEND}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': req.headers.authorization || '',
                'Accept': 'application/json',
            },
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(502).json({ success: false, message: 'Cannot connect to Viecly backend' });
    }
});

app.get('/api/auth/me', async (req, res) => {
    try {
        const response = await fetch(`${VIECLY_BACKEND}/api/auth/me`, {
            headers: {
                'Authorization': req.headers.authorization || '',
                'Accept': 'application/json',
            },
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(502).json({ success: false, message: 'Cannot connect to Viecly backend' });
    }
});

// Agent Bridge Status
app.get('/api/agent/status', (req, res) => {
    res.json({ success: true, data: agentBridge.getStatus() });
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
        // Stop screencast if running
        if (cdpSession && isScreencasting) {
            try {
                await cdpSession.send('Page.stopScreencast');
            } catch (e) { /* ignore */ }
            cdpSession = null;
            isScreencasting = false;
        }

        if (stealthBrowser) {
            await stealthBrowser.browser.close();
            stealthBrowser = null;
            activePage = null;
            humanBehavior = null;
            log('Browser closed', 'info');
            io.emit('screencast-stopped');
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

// ============ CDP Screencast ============

// Start screencast - streams browser frames via WebSocket
app.post('/api/browser/screencast/start', async (req, res) => {
    try {
        if (!activePage) {
            return res.json({ success: false, error: 'No active page' });
        }

        if (isScreencasting) {
            return res.json({ success: true, message: 'Screencast already running' });
        }

        // Create CDP session
        cdpSession = await activePage.context().newCDPSession(activePage);

        // Listen for screencast frames
        cdpSession.on('Page.screencastFrame', async (frame: any) => {
            // Emit frame to all connected clients
            io.emit('screencast-frame', {
                data: frame.data,
                metadata: frame.metadata,
            });

            // Acknowledge frame to continue receiving
            if (cdpSession) {
                try {
                    await cdpSession.send('Page.screencastFrameAck', {
                        sessionId: frame.sessionId,
                    });
                } catch (e) { /* session closed */ }
            }
        });

        // Start screencast
        const { quality = 80, maxWidth = 1280, maxHeight = 720 } = req.body;
        await cdpSession.send('Page.startScreencast', {
            format: 'jpeg',
            quality,
            maxWidth,
            maxHeight,
            everyNthFrame: 1,
        });

        isScreencasting = true;
        log('Screencast started', 'success');
        res.json({ success: true, message: 'Screencast started' });
    } catch (error) {
        log(`Screencast start failed: ${(error as Error).message}`, 'error');
        res.json({ success: false, error: (error as Error).message });
    }
});

// Stop screencast
app.post('/api/browser/screencast/stop', async (req, res) => {
    try {
        if (cdpSession && isScreencasting) {
            await cdpSession.send('Page.stopScreencast');
            isScreencasting = false;
            log('Screencast stopped', 'info');
            io.emit('screencast-stopped');
        }
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Forward mouse/keyboard events to browser
app.post('/api/browser/input/mouse', async (req, res) => {
    try {
        if (!cdpSession) {
            return res.json({ success: false, error: 'No CDP session' });
        }

        const { type, x, y, button = 'left', clickCount = 1 } = req.body;

        await cdpSession.send('Input.dispatchMouseEvent', {
            type, // 'mousePressed', 'mouseReleased', 'mouseMoved'
            x,
            y,
            button,
            clickCount,
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

app.post('/api/browser/input/keyboard', async (req, res) => {
    try {
        if (!cdpSession) {
            return res.json({ success: false, error: 'No CDP session' });
        }

        const { type, key, text } = req.body;

        if (type === 'char' && text) {
            await cdpSession.send('Input.insertText', { text });
        } else {
            await cdpSession.send('Input.dispatchKeyEvent', {
                type, // 'keyDown', 'keyUp'
                key,
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// ============ Profile Management ============

// Get all profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const profiles = await profileManager.getAll();
        res.json({ success: true, data: profiles });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Get profile by ID
app.get('/api/profiles/:id', async (req, res) => {
    try {
        const profile = await profileManager.getById(req.params.id);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        res.json({ success: true, data: profile });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Create profile
app.post('/api/profiles', async (req, res) => {
    try {
        const input: ProfileCreateInput = req.body;
        if (!input.name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        const profile = await profileManager.create(input);
        log(`Profile created: ${profile.name}`, 'success');
        res.json({ success: true, data: profile });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Update profile
app.put('/api/profiles/:id', async (req, res) => {
    try {
        const profile = await profileManager.update(req.params.id, req.body);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        log(`Profile updated: ${profile.name}`, 'success');
        res.json({ success: true, data: profile });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Delete profile
app.delete('/api/profiles/:id', async (req, res) => {
    try {
        const deleted = await profileManager.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        log('Profile deleted', 'info');
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Duplicate profile
app.post('/api/profiles/:id/duplicate', async (req, res) => {
    try {
        const { name } = req.body;
        const profile = await profileManager.duplicate(req.params.id, name);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        log(`Profile duplicated: ${profile.name}`, 'success');
        res.json({ success: true, data: profile });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Launch browser with specific profile
app.post('/api/profiles/:id/launch', async (req, res) => {
    try {
        if (stealthBrowser) {
            return res.json({ success: false, error: 'Browser already running. Close it first.' });
        }

        const profile = await profileManager.getById(req.params.id);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        log(`Launching browser with profile: ${profile.name}...`);

        const options: StealthLaunchOptions = {
            profilePath: profile.userDataDir,
            ...profileManager.getPlaywrightOptions(profile),
        };

        // Use profile proxy if set, otherwise get from rotator
        if (!options.proxy && proxyRotator.hasProxies) {
            const proxy = proxyRotator.getNext();
            if (proxy) {
                options.proxy = proxy;
                log(`Using proxy: ${proxy.server}`);
            }
        }

        const result = await launchStealthBrowser(options);
        stealthBrowser = result;

        log(`Browser launched with profile: ${profile.name}`, 'success');
        res.json({ success: true, message: 'Browser launched', profile: profile.name });
    } catch (error) {
        log(`Failed to launch: ${(error as Error).message}`, 'error');
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

// ============ Session-based Multi-Browser API ============

// Launch new session with profile
app.post('/api/sessions/launch', async (req, res) => {
    try {
        const { profileId } = req.body;

        const profile = await profileManager.getById(profileId);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        const sessionId = randomUUID();
        log(`Creating session ${sessionId} with profile: ${profile.name}...`);

        const options: StealthLaunchOptions = {
            profilePath: profile.userDataDir,
            ...profileManager.getPlaywrightOptions(profile),
        };

        // Use profile proxy if set, otherwise get from rotator
        if (!options.proxy && proxyRotator.hasProxies) {
            const proxy = proxyRotator.getNext();
            if (proxy) {
                options.proxy = proxy;
                log(`Using proxy: ${proxy.server}`);
            }
        }

        const result = await launchStealthBrowser(options);

        // Create page for the session and check bot detection
        const page = await createStealthPage(result.context);
        await page.goto('https://pixelscan.net/bot-check', { waitUntil: 'domcontentloaded' }).catch(() => { });

        const sessionData: BrowserSessionData = {
            id: sessionId,
            profileId: profileId,
            profileName: profile.name,
            browser: result.browser,
            context: result.context,
            page,
            cdpSession: null,
            isScreencasting: false,
            humanBehavior: new HumanBehavior(page),
        };

        browserSessions.set(sessionId, sessionData);

        log(`Session ${sessionId} created with profile: ${profile.name}`, 'success');
        res.json({
            success: true,
            sessionId,
            profileName: profile.name,
        });
    } catch (error) {
        log(`Failed to create session: ${(error as Error).message}`, 'error');
        res.json({ success: false, error: (error as Error).message });
    }
});

// Get all active sessions
app.get('/api/sessions', (req, res) => {
    const sessions = Array.from(browserSessions.values()).map(s => ({
        id: s.id,
        profileId: s.profileId,
        profileName: s.profileName,
        isScreencasting: s.isScreencasting,
    }));
    res.json({ success: true, data: sessions });
});

// Close a session
app.post('/api/sessions/:sessionId/close', async (req, res) => {
    try {
        const session = browserSessions.get(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Stop screencast if running
        if (session.cdpSession && session.isScreencasting) {
            try {
                await session.cdpSession.send('Page.stopScreencast');
            } catch (e) { /* ignore */ }
        }

        await session.browser.close();
        browserSessions.delete(req.params.sessionId);

        log(`Session ${req.params.sessionId} closed`, 'info');
        io.emit('session-closed', { sessionId: req.params.sessionId });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Start screencast for a session
app.post('/api/sessions/:sessionId/screencast/start', async (req, res) => {
    try {
        const session = browserSessions.get(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (!session.page) {
            return res.json({ success: false, error: 'No active page in session' });
        }

        if (session.isScreencasting) {
            return res.json({ success: true, message: 'Screencast already running' });
        }

        // Create CDP session for this page
        session.cdpSession = await session.context.newCDPSession(session.page);

        // Listen for screencast frames
        session.cdpSession.on('Page.screencastFrame', async (frame: any) => {
            // Emit frame to clients with session ID
            io.emit('screencast-frame', {
                sessionId: session.id,
                data: frame.data,
                metadata: frame.metadata,
            });

            // Acknowledge frame
            if (session.cdpSession) {
                try {
                    await session.cdpSession.send('Page.screencastFrameAck', {
                        sessionId: frame.sessionId,
                    });
                } catch (e) { /* session closed */ }
            }
        });

        // Start screencast with client-specified or default params
        const { quality = 80, maxWidth = 1280, maxHeight = 720 } = req.body;
        await session.cdpSession.send('Page.startScreencast', {
            format: 'jpeg',
            quality,
            maxWidth,
            maxHeight,
            everyNthFrame: 1,
        });

        // Get actual viewport size for coordinate mapping
        const viewportSize = session.page.viewportSize() || { width: maxWidth, height: maxHeight };

        session.isScreencasting = true;
        log(`Screencast started for session ${session.id} (${viewportSize.width}x${viewportSize.height} @ q${quality})`, 'success');
        res.json({ success: true, message: 'Screencast started', viewportSize });
    } catch (error) {
        log(`Screencast start failed: ${(error as Error).message}`, 'error');
        res.json({ success: false, error: (error as Error).message });
    }
});

// Stop screencast for a session
app.post('/api/sessions/:sessionId/screencast/stop', async (req, res) => {
    try {
        const session = browserSessions.get(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (session.cdpSession && session.isScreencasting) {
            await session.cdpSession.send('Page.stopScreencast');
            session.isScreencasting = false;
            log(`Screencast stopped for session ${session.id}`, 'info');
            io.emit('screencast-stopped', { sessionId: session.id });
        }
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Navigate session to URL
app.post('/api/sessions/:sessionId/navigate', async (req, res) => {
    try {
        const session = browserSessions.get(req.params.sessionId);
        if (!session || !session.page) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        const { url } = req.body;
        log(`Session ${session.id} navigating to: ${url}`);
        await session.page.goto(url, { waitUntil: 'domcontentloaded' });

        const title = await session.page.title();
        log(`Page loaded: ${title}`, 'success');
        res.json({ success: true, title });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Mouse input for a session
app.post('/api/sessions/:sessionId/input/mouse', async (req, res) => {
    try {
        const session = browserSessions.get(req.params.sessionId);
        if (!session || !session.cdpSession) {
            return res.status(404).json({ success: false, error: 'Session not found or no CDP session' });
        }

        const { type, x, y, button = 'left', clickCount = 1 } = req.body;
        await session.cdpSession.send('Input.dispatchMouseEvent', {
            type,
            x,
            y,
            button,
            clickCount,
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// Keyboard input for a session
app.post('/api/sessions/:sessionId/input/keyboard', async (req, res) => {
    try {
        const session = browserSessions.get(req.params.sessionId);
        if (!session || !session.cdpSession) {
            return res.status(404).json({ success: false, error: 'Session not found or no CDP session' });
        }

        const { type, key, text } = req.body;
        if (type === 'char' && text) {
            await session.cdpSession.send('Input.insertText', { text });
        } else {
            await session.cdpSession.send('Input.dispatchKeyEvent', {
                type,
                key,
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

// ============ WebSocket Events ============

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current agent bridge status on connect
    socket.emit('agent:connection', { connected: agentBridge.isConnected });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// ============ Start Server ============

const DEFAULT_PORT = parseInt(process.env.PORT || '3005', 10);

// Find available port
function findAvailablePort(startPort: number): Promise<number> {
    return new Promise((resolve) => {
        const testServer = createServer();
        testServer.listen(startPort, () => {
            testServer.close(() => resolve(startPort));
        });
        testServer.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// Start server with auto port detection
(async () => {
    const PORT = await findAvailablePort(DEFAULT_PORT);

    httpServer.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║        🕵️  STEALTH AUTOMATION SERVER                    ║
╠══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}              ║
║  Frontend:          Open via Vite output above           ║
╚══════════════════════════════════════════════════════════╝
    `);

        // Initialize Agent Bridge after server starts
        agentBridge.setSocketIO(io);
        agentBridge.connect();
        console.log('[AgentBridge] 📡 Bridge initialized, listening for tasks...');
    });
})();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    agentBridge.disconnect();
    if (stealthBrowser) {
        await stealthBrowser.browser.close();
    }
    // Close all browser sessions
    for (const [id, session] of browserSessions) {
        try { await session.browser.close(); } catch (e) { /* ignore */ }
    }
    process.exit(0);
});
