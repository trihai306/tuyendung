import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3005';

interface BrowserViewProps {
    socket: Socket | null;
    isActive: boolean;
}

export function BrowserView({ socket, isActive }: BrowserViewProps) {
    const [frame, setFrame] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Scale factors for mouse position
    const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });

    // Handle screencast frames
    useEffect(() => {
        if (!socket) return;

        const handleFrame = (data: { data: string; metadata: any }) => {
            setFrame(`data:image/jpeg;base64,${data.data}`);

            // Update scale factor based on metadata
            if (data.metadata && imgRef.current) {
                const deviceWidth = data.metadata.deviceWidth || 1280;
                const deviceHeight = data.metadata.deviceHeight || 720;
                const displayWidth = imgRef.current.clientWidth;
                const displayHeight = imgRef.current.clientHeight;

                setScaleFactor({
                    x: deviceWidth / displayWidth,
                    y: deviceHeight / displayHeight,
                });
            }
        };

        const handleStopped = () => {
            setIsStreaming(false);
            setFrame(null);
        };

        socket.on('screencast-frame', handleFrame);
        socket.on('screencast-stopped', handleStopped);

        return () => {
            socket.off('screencast-frame', handleFrame);
            socket.off('screencast-stopped', handleStopped);
        };
    }, [socket]);

    // Start screencast
    const startScreencast = async () => {
        try {
            setError(null);
            const res = await fetch(`${API_URL}/api/browser/screencast/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quality: 80, maxWidth: 1280, maxHeight: 720 }),
            });
            const data = await res.json();
            if (data.success) {
                setIsStreaming(true);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError((err as Error).message);
        }
    };

    // Stop screencast
    const stopScreencast = async () => {
        try {
            await fetch(`${API_URL}/api/browser/screencast/stop`, { method: 'POST' });
            setIsStreaming(false);
            setFrame(null);
        } catch (err) {
            console.error('Stop screencast failed:', err);
        }
    };

    // Send mouse event
    const sendMouseEvent = useCallback(async (type: string, e: React.MouseEvent) => {
        if (!imgRef.current || !isStreaming) return;

        const rect = imgRef.current.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) * scaleFactor.x);
        const y = Math.round((e.clientY - rect.top) * scaleFactor.y);

        try {
            await fetch(`${API_URL}/api/browser/input/mouse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, x, y, button: 'left', clickCount: 1 }),
            });
        } catch (err) {
            console.error('Mouse event failed:', err);
        }
    }, [scaleFactor, isStreaming]);

    // Handle click
    const handleClick = useCallback(async (e: React.MouseEvent) => {
        await sendMouseEvent('mousePressed', e);
        await sendMouseEvent('mouseReleased', e);
    }, [sendMouseEvent]);

    // Handle keyboard
    const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
        if (!isStreaming) return;
        e.preventDefault();

        try {
            // For printable characters, use insertText
            if (e.key.length === 1) {
                await fetch(`${API_URL}/api/browser/input/keyboard`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'char', text: e.key }),
                });
            } else {
                // Special keys
                await fetch(`${API_URL}/api/browser/input/keyboard`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'keyDown', key: e.key }),
                });
            }
        } catch (err) {
            console.error('Keyboard event failed:', err);
        }
    }, [isStreaming]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Live Browser View
                    {isStreaming && (
                        <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            LIVE
                        </span>
                    )}
                </h2>
                <div className="flex gap-2">
                    {!isStreaming ? (
                        <button
                            onClick={startScreencast}
                            disabled={!isActive}
                            className="btn btn-primary text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Start Stream
                        </button>
                    ) : (
                        <button
                            onClick={stopScreencast}
                            className="btn btn-danger text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            Stop Stream
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-5 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-red-600 text-sm">{error}</span>
                </div>
            )}

            {/* Browser Container */}
            <div
                ref={containerRef}
                className="m-5 bg-slate-100 rounded-xl overflow-hidden relative"
                style={{ aspectRatio: '16/9' }}
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                {frame ? (
                    <img
                        ref={imgRef}
                        src={frame}
                        alt="Browser View"
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={handleClick}
                        draggable={false}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        {isActive ? (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Click "Start Stream" to view browser</span>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Launch a profile to start streaming</span>
                            </>
                        )}
                    </div>
                )}

                {/* Overlay for interaction hint */}
                {frame && (
                    <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                        Click to interact • Tab to focus
                    </div>
                )}
            </div>
        </div>
    );
}
