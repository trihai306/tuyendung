import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3005';

interface BrowserSession {
    id: string;
    profileId: string;
    profileName: string;
    isStreaming: boolean;
    frame: string | null;
    status: 'launching' | 'running' | 'stopped';
}

interface MultiBrowserViewProps {
    socket: Socket | null;
    sessions: BrowserSession[];
    onSessionClose: (sessionId: string) => void;
}

interface SingleBrowserCardProps {
    session: BrowserSession;
    socket: Socket | null;
    onClose: () => void;
    viewMode: 'grid' | 'fullscreen';
    onExpand: () => void;
}

// ─── Icons ───
const Icons = {
    Monitor: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12" />
        </svg>
    ),
    Play: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
        </svg>
    ),
    Stop: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
        </svg>
    ),
    Expand: () => (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
        </svg>
    ),
    Collapse: () => (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
        </svg>
    ),
    Grid2: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
    ),
    Grid3: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0.5" y="1" width="4" height="6" rx="0.5" />
            <rect x="6" y="1" width="4" height="6" rx="0.5" />
            <rect x="11.5" y="1" width="4" height="6" rx="0.5" />
            <rect x="0.5" y="9" width="4" height="6" rx="0.5" />
            <rect x="6" y="9" width="4" height="6" rx="0.5" />
            <rect x="11.5" y="9" width="4" height="6" rx="0.5" />
        </svg>
    ),
    Signal: () => (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
};

function SingleBrowserCard({ session, socket, onClose, viewMode, onExpand }: SingleBrowserCardProps) {
    const [currentUrl, setCurrentUrl] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [frame, setFrame] = useState<string | null>(null);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;
        const handleFrame = (data: { sessionId: string; data: string }) => {
            if (data.sessionId === session.id) {
                setFrame(data.data);
            }
        };
        socket.on('screencast-frame', handleFrame);
        return () => { socket.off('screencast-frame', handleFrame); };
    }, [socket, session.id]);

    const [viewportSize, setViewportSize] = useState({ width: 1280, height: 720 });

    const toggleStream = async () => {
        if (!socket) return;
        if (isStreaming) {
            await fetch(`${API_URL}/api/sessions/${session.id}/screencast/stop`, { method: 'POST' });
            setIsStreaming(false);
            setFrame(null);
        } else {
            const res = await fetch(`${API_URL}/api/sessions/${session.id}/screencast/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quality: 80, maxWidth: 1280, maxHeight: 720 }),
            });
            const data = await res.json();
            if (data.success && data.viewportSize) {
                setViewportSize(data.viewportSize);
            }
            setIsStreaming(true);
        }
    };

    const handleNavigate = async () => {
        if (!currentUrl.trim()) return;
        let url = currentUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        try {
            await fetch(`${API_URL}/api/sessions/${session.id}/navigate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
        } catch (error) {
            console.error('Navigate failed:', error);
        }
    };

    const handleMouseEvent = async (e: React.MouseEvent) => {
        if (!imgRef.current || !isStreaming || !frame) return;
        const rect = imgRef.current.getBoundingClientRect();
        // Map click coordinates to viewport size
        const x = ((e.clientX - rect.left) / rect.width) * viewportSize.width;
        const y = ((e.clientY - rect.top) / rect.height) * viewportSize.height;
        try {
            await fetch(`${API_URL}/api/sessions/${session.id}/input/mouse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'mousePressed', x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 }),
            });
            await fetch(`${API_URL}/api/sessions/${session.id}/input/mouse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'mouseReleased', x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 }),
            });
        } catch (error) {
            console.error('Click failed:', error);
        }
    };

    const isFullscreen = viewMode === 'fullscreen';

    return (
        <div className={`group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--border-default)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] flex flex-col ${isFullscreen ? 'h-full' : ''}`}>
            {/* ── Chrome-style Title Bar ── */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] select-none">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onClose}
                        className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                        title="Close session"
                    />
                    <button
                        onClick={toggleStream}
                        className={`w-3 h-3 rounded-full transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${isStreaming ? 'bg-[#28c840] hover:bg-[#1db534]' : 'bg-[#febc2e] hover:bg-[#f5a623]'}`}
                        title={isStreaming ? 'Stop Screencast' : 'Start Screencast'}
                    />
                    <button
                        onClick={onExpand}
                        className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1db534] transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    />
                </div>

                {/* Profile Badge */}
                <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-md bg-[var(--bg-surface)]">
                    <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[var(--accent-success)] animate-pulse' : session.status === 'running' ? 'bg-[var(--accent-primary)]' : 'bg-[var(--text-ghost)]'}`} />
                    <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate max-w-[140px]">
                        {session.profileName}
                    </span>
                </div>

                <div className="flex-1" />

                {/* Status badges */}
                {isStreaming && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.2)]">
                        <span className="w-1 h-1 rounded-full bg-[var(--accent-success)] animate-pulse" />
                        <span className="text-[9px] font-bold text-[var(--accent-success)] tracking-wider">LIVE</span>
                    </span>
                )}

                {/* Expand/Collapse */}
                <button
                    onClick={onExpand}
                    className="p-1 rounded-md text-[var(--text-ghost)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all opacity-0 group-hover:opacity-100"
                    title={isFullscreen ? 'Back to Grid' : 'Expand'}
                >
                    {isFullscreen ? <Icons.Collapse /> : <Icons.Expand />}
                </button>
            </div>

            {/* ── URL Bar ── */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
                {/* Back/Forward/Reload cluster */}
                <div className="flex items-center">
                    <button className="p-1 rounded-md text-[var(--text-ghost)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="p-1 rounded-md text-[var(--text-ghost)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button className="p-1 rounded-md text-[var(--text-ghost)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                        </svg>
                    </button>
                </div>

                {/* URL Input */}
                <form onSubmit={(e) => { e.preventDefault(); handleNavigate(); }} className="flex-1">
                    <div className="relative">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                            <svg className="w-3 h-3 text-[var(--text-ghost)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={currentUrl}
                            onChange={(e) => setCurrentUrl(e.target.value)}
                            placeholder="Enter URL to navigate..."
                            className="w-full pl-8 pr-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[11px] text-[var(--text-primary)] placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/20 transition-all"
                        />
                    </div>
                </form>
            </div>

            {/* ── Browser Viewport ── */}
            <div
                ref={imgRef}
                className="flex-1 relative overflow-hidden"
                onClick={handleMouseEvent}
                style={{
                    minHeight: isFullscreen ? '500px' : '280px',
                    cursor: isStreaming ? 'crosshair' : 'default',
                    background: 'linear-gradient(135deg, #0d0d1a 0%, #111122 50%, #0a0a15 100%)',
                }}
            >
                {frame ? (
                    <>
                        {/* Inset frame border for depth */}
                        <div className="absolute inset-0 z-10 pointer-events-none rounded-[1px]" style={{
                            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 2px 8px rgba(0,0,0,0.5)',
                        }} />

                        {/* Actual stream image */}
                        <img
                            src={`data:image/jpeg;base64,${frame}`}
                            alt="Browser view"
                            className="w-full h-full object-contain"
                            draggable={false}
                            style={{ imageRendering: 'auto' }}
                        />

                        {/* Corner indicators */}
                        <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[rgba(16,185,129,0.3)] rounded-tl-sm pointer-events-none z-10" />
                        <div className="absolute top-2 right-12 w-3 h-3 border-r-2 border-t-2 border-[rgba(16,185,129,0.3)] rounded-tr-sm pointer-events-none z-10" />
                        <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[rgba(16,185,129,0.3)] rounded-bl-sm pointer-events-none z-10" />
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[rgba(16,185,129,0.3)] rounded-br-sm pointer-events-none z-10" />

                        {/* Subtle vignette for screen depth */}
                        <div className="absolute inset-0 pointer-events-none z-10" style={{
                            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)',
                        }} />
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        {/* Subtle background pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                        }} />

                        {session.status === 'launching' ? (
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                                    <div className="spinner" />
                                </div>
                                <span className="text-xs text-[var(--text-ghost)] font-medium">Launching browser...</span>
                            </div>
                        ) : !isStreaming ? (
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <button
                                    onClick={toggleStream}
                                    className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-ghost)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] hover:bg-[rgba(16,185,129,0.08)] transition-all duration-300 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.2)] group/play"
                                >
                                    <svg className="w-6 h-6 ml-0.5 transition-transform group-hover/play:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                    </svg>
                                </button>
                                <div className="text-center">
                                    <p className="text-xs font-medium text-[var(--text-muted)]">Start Screencast</p>
                                    <p className="text-[10px] text-[var(--text-ghost)] mt-0.5">Click to stream browser view</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                                    <div className="spinner" />
                                </div>
                                <span className="text-xs text-[var(--text-ghost)] font-medium">Connecting stream...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Streaming overlay indicator */}
                {isStreaming && frame && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-white/80 tracking-wide">REC</span>
                    </div>
                )}
            </div>

            {/* ── Bottom Status Bar ── */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${isStreaming ? 'text-[var(--accent-success)]' : 'text-[var(--text-ghost)]'}`}>
                        <Icons.Signal />
                        {isStreaming ? 'Streaming' : 'Idle'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={toggleStream}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${isStreaming
                            ? 'bg-[rgba(239,68,68,0.1)] text-[var(--accent-danger)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.15)]'
                            : 'bg-[rgba(16,185,129,0.1)] text-[var(--accent-success)] hover:bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.15)]'
                            }`}
                    >
                        {isStreaming ? <><Icons.Stop /> Stop</> : <><Icons.Play /> Stream</>}
                    </button>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(239,68,68,0.08)] text-[var(--accent-danger)] hover:bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.1)] transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export function MultiBrowserView({ socket, sessions, onSessionClose }: MultiBrowserViewProps) {
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [gridColumns, setGridColumns] = useState(2);

    // ── Fullscreen View ──
    if (expandedSessionId) {
        const expandedSession = sessions.find(s => s.id === expandedSessionId);
        if (expandedSession) {
            return (
                <div className="h-[calc(100vh-140px)] animate-fade-in-up">
                    {/* Back toolbar */}
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={() => setExpandedSessionId(null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Grid View
                        </button>
                        <div className="h-4 w-px bg-[var(--border-subtle)]" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-success)] animate-pulse" />
                            <span className="text-sm font-medium text-[var(--text-primary)]">{expandedSession.profileName}</span>
                        </div>
                    </div>
                    <SingleBrowserCard
                        session={expandedSession}
                        socket={socket}
                        onClose={() => onSessionClose(expandedSession.id)}
                        viewMode="fullscreen"
                        onExpand={() => setExpandedSessionId(null)}
                    />
                </div>
            );
        }
    }

    // ── Grid View ──
    return (
        <div className="space-y-4">
            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Session count */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                        <Icons.Monitor />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
                        </span>
                    </div>
                </div>

                {/* Grid layout controls */}
                <div className="flex items-center gap-1.5 px-1 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    {[
                        { cols: 1, label: 'Single', icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="12" height="12" rx="1.5" /></svg> },
                        { cols: 2, label: '2×2', icon: <Icons.Grid2 /> },
                        { cols: 3, label: '3×3', icon: <Icons.Grid3 /> },
                    ].map(({ cols, label, icon }) => (
                        <button
                            key={cols}
                            onClick={() => setGridColumns(cols)}
                            className={`p-1.5 rounded-md transition-all ${gridColumns === cols
                                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                                : 'text-[var(--text-ghost)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                }`}
                            title={label}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            {sessions.length === 0 ? (
                /* Empty State */
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                    {/* Subtle gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/[0.03] via-transparent to-[var(--accent-primary)]/[0.02]" />

                    <div className="relative flex flex-col items-center justify-center py-20 px-8">
                        {/* Animated icon */}
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                                <svg className="w-9 h-9 text-[var(--text-ghost)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12" />
                                </svg>
                            </div>
                            {/* Pulse ring */}
                            <div className="absolute inset-0 rounded-2xl border border-[var(--accent-primary)]/20 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
                        </div>

                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Active Browsers</h3>
                        <p className="text-sm text-[var(--text-muted)] max-w-sm text-center leading-relaxed">
                            Launch a browser profile from the <strong className="text-[var(--text-secondary)]">Profiles</strong> tab to start a session. Multiple browsers can run simultaneously in a grid layout.
                        </p>

                        {/* Hint chips */}
                        <div className="flex items-center gap-2 mt-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-medium text-[var(--text-ghost)]">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                                Profiles → Launch
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-medium text-[var(--text-ghost)]">
                                <Icons.Signal />
                                CDP Screencast
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-medium text-[var(--text-ghost)]">
                                <Icons.Expand />
                                Multi-Grid View
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Browser Grid */
                <div
                    className="grid gap-4 animate-fade-in-up"
                    style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
                >
                    {sessions.map((session, i) => (
                        <div key={session.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                            <SingleBrowserCard
                                session={session}
                                socket={socket}
                                onClose={() => onSessionClose(session.id)}
                                viewMode="grid"
                                onExpand={() => setExpandedSessionId(session.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
