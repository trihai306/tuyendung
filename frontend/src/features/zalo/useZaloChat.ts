import { useState, useEffect, useCallback } from 'react';
import { getEcho } from '../../services/echo';
import * as zaloApi from './zaloApi';
import type { ZaloAccount, ZaloConversation, ZaloMessage } from './zaloApi';

// ===================
// useZaloAccounts - Manage accounts list
// ===================

export function useZaloAccounts() {
    const [accounts, setAccounts] = useState<ZaloAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await zaloApi.getZaloAccounts();
            setAccounts(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    return { accounts, loading, error, refetch: fetchAccounts };
}

// ===================
// useZaloQRLogin - Handle QR login flow via Soketi
// ===================

export function useZaloQRLogin() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'waiting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    // Subscribe to Soketi channel when sessionId is available
    useEffect(() => {
        if (!sessionId) return;

        const echo = getEcho();
        const channelName = `zalo-login.${sessionId}`;
        const channel = echo.channel(channelName);

        console.log('[useZaloQRLogin] Subscribing to channel:', channelName);

        channel.listen('.login.progress', (event: {
            stage: string;
            qr_code?: string;
            message?: string;
            error?: string;
        }) => {
            console.log('[useZaloQRLogin] Received event:', event);

            switch (event.stage) {
                case 'starting':
                    setStatus('loading');
                    break;

                case 'qr_generated':
                    if (event.qr_code) {
                        setQrCode(event.qr_code);
                        setStatus('waiting');
                    }
                    break;

                case 'login_success':
                    setStatus('success');
                    break;

                case 'login_failed':
                    setError(event.error || event.message || 'Login failed');
                    setStatus('error');
                    break;
            }
        });

        return () => {
            console.log('[useZaloQRLogin] Leaving channel:', channelName);
            echo.leaveChannel(channelName);
        };
    }, [sessionId]);

    const initiateLogin = useCallback(async () => {
        try {
            setStatus('loading');
            setError(null);
            setQrCode(null);

            // Call API to start login process - returns sessionId
            const result = await zaloApi.initiateQRLogin();
            console.log('[useZaloQRLogin] Initiated login, sessionId:', result.sessionId);

            // Set sessionId to trigger Soketi subscription
            setSessionId(result.sessionId);
        } catch (err) {
            console.error('[useZaloQRLogin] Failed to initiate login:', err);
            setError(err instanceof Error ? err.message : 'Failed to initiate login');
            setStatus('error');
        }
    }, []);

    const reset = useCallback(() => {
        setQrCode(null);
        setSessionId(null);
        setStatus('idle');
        setError(null);
    }, []);

    return { qrCode, status, error, initiateLogin, reset, sessionId };
}

// ===================
// useZaloConversations - Manage conversations for an account
// Fetches from both: 1) Laravel DB (stored messages) 2) Zalo service (real-time/cache)
// ===================

export function useZaloConversations(accountId: string | null) {
    const [conversations, setConversations] = useState<ZaloConversation[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchConversations = useCallback(async () => {
        if (!accountId) return;

        try {
            setLoading(true);

            // Try to get from Laravel DB first (stored messages)
            try {
                const dbConversations = await zaloApi.getConversationsFromDB();
                if (dbConversations.length > 0) {
                    setConversations(dbConversations);
                    return;
                }
            } catch (dbError) {
                console.warn('DB conversations not available, trying zalo service:', dbError);
            }

            // Fallback to zalo-service directly
            const data = await zaloApi.getConversations(accountId);
            setConversations(data);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // 🔌 Real-time: Listen for new messages to update conversation list
    useEffect(() => {
        if (!accountId) return;

        const echo = getEcho();
        const channel = echo.channel(`zalo.messages.${accountId}`);

        channel.listen('.message.received', (data: { threadId: string; senderName: string; content: string }) => {
            console.log('📬 New message received, refreshing conversations:', data);
            // Refetch conversation list to update last message & order
            fetchConversations();
        });

        return () => {
            echo.leaveChannel(`zalo.messages.${accountId}`);
        };
    }, [accountId, fetchConversations]);

    return { conversations, loading, refetch: fetchConversations };
}

// ===================
// useZaloChat - Chat with Soketi real-time updates
// ===================

export function useZaloChat(accountId: string | null, threadId: string | null) {
    const [messages, setMessages] = useState<ZaloMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Fetch messages from Laravel API
    const fetchMessages = useCallback(async () => {
        if (!accountId || !threadId) {
            setMessages([]);
            return;
        }

        try {
            setLoading(true);
            const dbMessages = await zaloApi.getMessagesFromDB(threadId);
            // API returns desc order, reverse for display (oldest first)
            setMessages(dbMessages.reverse());
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    }, [accountId, threadId]);

    // Initial fetch when conversation changes
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Listen to Soketi for real-time updates from Laravel
    useEffect(() => {
        if (!accountId) return;

        const echo = getEcho();
        const channel = echo.channel(`zalo.messages.${accountId}`);

        channel.listen('.message.received', (data: ZaloMessage) => {
            console.log('📩 Soketi message:', data);
            if (data.threadId === threadId) {
                // Prevent duplicates
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
            }
        });

        return () => {
            echo.leaveChannel(`zalo.messages.${accountId}`);
        };
    }, [accountId, threadId]);

    // Send message with optimistic update
    const sendMessage = useCallback(async (content: string, type: 'user' | 'group' = 'user') => {
        if (!accountId || !threadId || !content.trim()) return;

        // Optimistic update - add message immediately
        const optimisticMsg: ZaloMessage = {
            id: `temp-${Date.now()}`,
            threadId,
            threadType: type,
            senderId: accountId,
            senderName: 'Bạn',
            content: content.trim(),
            direction: 'outbound',
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            setSending(true);
            await zaloApi.sendMessage(accountId, threadId, content, type);
        } catch (err) {
            console.error('Failed to send message:', err);
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            throw err;
        } finally {
            setSending(false);
        }
    }, [accountId, threadId]);

    return { messages, loading, sending, sendMessage, refetch: fetchMessages };
}


// ===================
// useZaloAccountStatus - Listen to account status changes
// ===================

export function useZaloAccountStatus(onStatusChange?: (accountId: string, status: string) => void) {
    useEffect(() => {
        const echo = getEcho();
        const channel = echo.channel('zalo.accounts');

        channel.listen('.account.status', (data: { accountId: string; status: string }) => {
            console.log('📢 Account status change:', data);
            onStatusChange?.(data.accountId, data.status);
        });

        return () => {
            echo.leaveChannel('zalo.accounts');
        };
    }, [onStatusChange]);
}
