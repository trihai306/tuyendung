import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface BroadcastMessage {
    message: string;
    timestamp: string;
}

export function WebSocketTest() {
    const [messages, setMessages] = useState<BroadcastMessage[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

    // Subscribe to test channel
    useEffect(() => {
        // Import echo directly to ensure proper initialization
        import('../../services/echo').then(({ getEcho }) => {
            const echoInstance = getEcho();

            const channel = echoInstance.channel('test-channel');

            // Listen for the event (with dot prefix for broadcastAs)
            channel.listen('.TestEvent', (data: BroadcastMessage) => {
                setMessages((prev) => [...prev, data]);
                setStatus('connected');
            });

            // Mark as connected when socket is ready
            if (echoInstance.socketId()) {
                setStatus('connected');
            }

            return () => {
                echoInstance.leaveChannel('test-channel');
            };
        });
    }, []);

    // Check connection status
    useEffect(() => {
        const timer = setTimeout(() => {
            if (messages.length === 0) {
                setStatus('connecting');
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [messages]);

    const triggerBroadcast = async () => {
        try {
            await apiClient.post('/test-broadcast');
        } catch (error) {
            console.error('Broadcast error:', error);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto mt-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                WebSocket Test
            </h2>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${status === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : status === 'connecting'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                    }`} />
                <span className="text-sm text-slate-600 capitalize">{status}</span>
            </div>

            {/* Trigger button */}
            <button
                onClick={triggerBroadcast}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors mb-4"
            >
                Gửi Test Event
            </button>

            {/* Messages */}
            <div className="border border-slate-200 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto bg-slate-50">
                {messages.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center">
                        Chờ nhận messages...
                    </p>
                ) : (
                    <div className="space-y-2">
                        {messages.map((msg, i) => (
                            <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <p className="text-sm text-slate-800">{msg.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{msg.timestamp}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-400 mt-3 text-center">
                Channel: test-channel | Event: TestEvent
            </p>
        </div>
    );
}
