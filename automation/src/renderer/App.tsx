import React, { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ProfileManager } from './components/ProfileManager';
import { BrowserView } from './components/BrowserView';
import { MultiBrowserView } from './components/MultiBrowserView';

const API_URL = 'http://localhost:3005';

interface LogEntry {
    id: number;
    time: string;
    message: string;
    type: 'info' | 'success' | 'error';
}

// API helper
async function api(endpoint: string, options?: RequestInit) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    return res.json();
}

function App() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isBrowserRunning, setIsBrowserRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [url, setUrl] = useState('https://bot.sannysoft.com/');
    const [selector, setSelector] = useState('');
    const [textToType, setTextToType] = useState('');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [proxyCount, setProxyCount] = useState(0);
    const [serverOnline, setServerOnline] = useState(false);

    // Multi-browser sessions
    const [browserSessions, setBrowserSessions] = useState<Array<{
        id: string;
        profileId: string;
        profileName: string;
        isStreaming: boolean;
        frame: string | null;
        status: 'launching' | 'running' | 'stopped';
    }>>([]);

    // Add log entry
    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', time?: string) => {
        const newLog: LogEntry = {
            id: Date.now(),
            time: time || new Date().toLocaleTimeString('vi-VN'),
            message,
            type,
        };
        setLogs(prev => [...prev.slice(-50), newLog]);
    }, []);

    // Check server status
    const checkStatus = useCallback(async () => {
        try {
            const res = await api('/api/status');
            setServerOnline(true);
            setIsBrowserRunning(res.browserRunning);
            setProxyCount(res.proxyCount);
        } catch {
            setServerOnline(false);
        }
    }, []);

    // Connect to Socket.IO
    useEffect(() => {
        const newSocket = io(API_URL);

        newSocket.on('connect', () => {
            addLog('Connected to server', 'success');
            checkStatus();
        });

        newSocket.on('disconnect', () => {
            addLog('Disconnected from server', 'error');
            setServerOnline(false);
        });

        newSocket.on('log', (data: { message: string; type: LogEntry['type']; time: string }) => {
            addLog(data.message, data.type, data.time);
        });

        setSocket(newSocket);

        // Check status periodically
        const interval = setInterval(checkStatus, 5000);

        return () => {
            newSocket.close();
            clearInterval(interval);
        };
    }, [addLog, checkStatus]);

    // Launch browser
    const handleLaunchBrowser = async () => {
        setIsLoading(true);
        try {
            const result = await api('/api/browser/launch', { method: 'POST' });
            if (result.success) {
                setIsBrowserRunning(true);
            } else {
                addLog(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Launch browser with profile - adds to multi-browser grid
    const handleLaunchWithProfile = async (profileId: string, profileName?: string) => {
        setIsLoading(true);
        try {
            const result = await api(`/api/profiles/${profileId}/launch`, { method: 'POST' });
            if (result.success) {
                // Add new session to the grid
                const newSession = {
                    id: `session-${Date.now()}`,
                    profileId,
                    profileName: result.profile || profileName || 'Profile',
                    isStreaming: false,
                    frame: null,
                    status: 'running' as const,
                };
                setBrowserSessions(prev => [...prev, newSession]);
                setIsBrowserRunning(true);
                addLog(`Launched with profile: ${result.profile}`, 'success');
            } else {
                addLog(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Close specific browser session
    const handleCloseSession = async (sessionId: string) => {
        setBrowserSessions(prev => prev.filter(s => s.id !== sessionId));
        if (browserSessions.length <= 1) {
            setIsBrowserRunning(false);
        }
        addLog(`Closed browser session`, 'info');
    };

    // Close browser
    const handleCloseBrowser = async () => {
        setIsLoading(true);
        try {
            const result = await api('/api/browser/close', { method: 'POST' });
            if (result.success) {
                setIsBrowserRunning(false);
                setScreenshot(null);
            }
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Navigate
    const handleNavigate = async () => {
        if (!url) return;
        setIsLoading(true);
        try {
            const result = await api('/api/browser/navigate', {
                method: 'POST',
                body: JSON.stringify({ url }),
            });
            if (!result.success) {
                addLog(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Screenshot
    const handleScreenshot = async () => {
        setIsLoading(true);
        try {
            const result = await api('/api/browser/screenshot');
            if (result.success && result.data) {
                setScreenshot(`data:image/png;base64,${result.data}`);
                addLog('Screenshot captured', 'success');
            } else {
                addLog(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Click
    const handleClick = async () => {
        if (!selector) return;
        setIsLoading(true);
        try {
            const result = await api('/api/browser/click', {
                method: 'POST',
                body: JSON.stringify({ selector }),
            });
            if (!result.success) {
                addLog(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Type
    const handleType = async () => {
        if (!selector || !textToType) return;
        setIsLoading(true);
        try {
            const result = await api('/api/browser/type', {
                method: 'POST',
                body: JSON.stringify({ selector, text: textToType }),
            });
            if (!result.success) {
                addLog(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Scroll
    const handleScroll = async (direction: 'up' | 'down') => {
        try {
            await api('/api/browser/scroll', {
                method: 'POST',
                body: JSON.stringify({ direction }),
            });
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
    };

    // Simulate reading
    const handleSimulateReading = async () => {
        setIsLoading(true);
        try {
            await api('/api/browser/simulate-reading', {
                method: 'POST',
                body: JSON.stringify({ duration: 10000 }),
            });
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }
        setIsLoading(false);
    };

    // Test stealth
    const handleTestStealth = async () => {
        setIsLoading(true);
        addLog('Starting stealth test...', 'info');

        try {
            await api('/api/browser/navigate', {
                method: 'POST',
                body: JSON.stringify({ url: 'https://bot.sannysoft.com/' }),
            });

            await new Promise(resolve => setTimeout(resolve, 3000));

            const screenshotResult = await api('/api/browser/screenshot');
            if (screenshotResult.success && screenshotResult.data) {
                setScreenshot(`data:image/png;base64,${screenshotResult.data}`);
            }

            addLog('Stealth test completed - check screenshot', 'success');
        } catch (error) {
            addLog(`Error: ${(error as Error).message}`, 'error');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-4 bg-dark-secondary border-b border-dark-border">
                <h1 className="text-2xl font-bold gradient-text">🕵️ Stealth Automation</h1>
                <div className="flex items-center gap-4">
                    {/* Server Status */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${serverOnline
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-gray-500/15 text-gray-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-blue-400 animate-pulse-dot' : 'bg-gray-400'
                            }`}></div>
                        Server {serverOnline ? 'Online' : 'Offline'}
                    </div>
                    {/* Browser Status */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isBrowserRunning
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-red-500/15 text-red-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse-dot ${isBrowserRunning ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                        {isBrowserRunning ? 'Browser Running' : 'Browser Offline'}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-72 bg-dark-secondary border-r border-dark-border p-6 flex flex-col gap-6">
                    {/* Browser Control */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            Browser Control
                        </h3>
                        <div className="flex flex-col gap-3">
                            {!isBrowserRunning ? (
                                <button
                                    className="btn btn-success btn-block"
                                    onClick={handleLaunchBrowser}
                                    disabled={isLoading || !serverOnline}
                                >
                                    {isLoading ? <div className="spinner"></div> : '🚀'} Launch Stealth
                                </button>
                            ) : (
                                <button
                                    className="btn btn-danger btn-block"
                                    onClick={handleCloseBrowser}
                                    disabled={isLoading}
                                >
                                    Close Browser
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            Quick Actions
                        </h3>
                        <div className="flex flex-col gap-3">
                            <button
                                className="btn btn-primary btn-block"
                                onClick={handleTestStealth}
                                disabled={!isBrowserRunning || isLoading}
                            >
                                🧪 Test Stealth
                            </button>
                            <button
                                className="btn btn-secondary btn-block"
                                onClick={handleScreenshot}
                                disabled={!isBrowserRunning || isLoading}
                            >
                                📸 Screenshot
                            </button>
                            <button
                                className="btn btn-secondary btn-block"
                                onClick={handleSimulateReading}
                                disabled={!isBrowserRunning || isLoading}
                            >
                                👀 Simulate Reading
                            </button>
                        </div>
                    </div>

                    {/* Proxies */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            Proxies
                        </h3>
                        <div className="bg-[var(--color-dark-tertiary)] rounded-lg px-4 py-3 text-sm">
                            Active: <span className="text-[var(--color-primary-400)] font-medium">{proxyCount}</span>
                        </div>
                    </div>
                </aside>

                {/* Control Panel */}
                <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">
                    {/* Profile Manager */}
                    <ProfileManager
                        onLaunchProfile={handleLaunchWithProfile}
                        browserRunning={isBrowserRunning}
                    />
                    {/* Navigation Card */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">🌐 Navigation</h2>
                        <div className="mb-4">
                            <label className="form-label">URL</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleNavigate}
                            disabled={!isBrowserRunning || isLoading || !url}
                        >
                            Go
                        </button>
                    </div>

                    {/* Interaction Card */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">🖱️ Human Interactions</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="form-label">Selector</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="#login-btn, .submit-button"
                                    value={selector}
                                    onChange={(e) => setSelector(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-label">Text to Type</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="hello@example.com"
                                    value={textToType}
                                    onChange={(e) => setTextToType(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <button
                                className="btn btn-secondary"
                                onClick={handleClick}
                                disabled={!isBrowserRunning || isLoading || !selector}
                            >
                                🖱️ Click
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleType}
                                disabled={!isBrowserRunning || isLoading || !selector || !textToType}
                            >
                                ⌨️ Type
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleScroll('up')}
                                disabled={!isBrowserRunning || isLoading}
                            >
                                ⬆️ Scroll Up
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleScroll('down')}
                                disabled={!isBrowserRunning || isLoading}
                            >
                                ⬇️ Scroll Down
                            </button>
                        </div>
                    </div>

                    {/* Multi-Browser Grid View */}
                    <MultiBrowserView
                        socket={socket}
                        sessions={browserSessions}
                        onSessionClose={handleCloseSession}
                    />

                    {/* Single Browser View (Legacy - for when no sessions) */}
                    {browserSessions.length === 0 && (
                        <BrowserView
                            socket={socket}
                            isActive={isBrowserRunning}
                        />
                    )}

                    {/* Logs */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4">📋 Logs</h2>
                        <div className="bg-dark-tertiary rounded-lg p-4 max-h-48 overflow-auto font-mono text-xs leading-relaxed">
                            {logs.length === 0 ? (
                                <div className="text-gray-500">No logs yet...</div>
                            ) : (
                                logs.map(log => (
                                    <div
                                        key={log.id}
                                        className={`py-1 border-b border-dark-border last:border-0 ${log.type === 'success' ? 'text-green-400' :
                                            log.type === 'error' ? 'text-red-400' :
                                                'text-primary-400'
                                            }`}
                                    >
                                        <span className="text-gray-500 mr-2">[{log.time}]</span>
                                        {log.message}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
