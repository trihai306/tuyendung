import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { messageReceived } from './inboxSlice';
import echo from '../../services/echo';
import zaloApi from '../../services/zaloApi';
import { useToast } from '../../components/ui';

interface ZaloMessageEvent {
    accountId: string;
    threadId: string;
    senderId: string;
    senderName: string;
    content: string;
    direction: 'inbound' | 'outbound';
    timestamp: string;
}

/**
 * Hook to subscribe to realtime Zalo messages for all user's accounts
 * 
 * Flow:
 * 1. Fetch user's Zalo accounts
 * 2. Subscribe to channel `zalo.messages.{ownId}` for each account
 * 3. Listen for `message.received` event
 * 4. Dispatch to Redux store when new message arrives
 */
export function useZaloMessages() {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const channelsRef = useRef<ReturnType<typeof echo.channel>[]>([]);
    const accountsRef = useRef<string[]>([]);

    // Subscribe to message channels for given account IDs
    const subscribeToAccounts = useCallback((ownIds: string[]) => {
        // Unsubscribe from old channels first
        channelsRef.current.forEach((_, index) => {
            const oldOwnId = accountsRef.current[index];
            if (oldOwnId) {
                echo.leaveChannel(`zalo.messages.${oldOwnId}`);
            }
        });
        channelsRef.current = [];
        accountsRef.current = ownIds;

        // Subscribe to new channels
        ownIds.forEach((ownId) => {
            const channel = echo.channel(`zalo.messages.${ownId}`);

            channel.listen('.message.received', (data: ZaloMessageEvent) => {
                console.log('[ZaloMessages] New message received:', data);

                // Create message object for Redux
                const message = {
                    id: Date.now(), // Temporary ID, will be replaced when syncing
                    conversation_id: parseInt(data.threadId) || 0,
                    direction: data.direction,
                    sender_type: (data.direction === 'inbound' ? 'customer' : 'agent') as 'customer' | 'agent' | 'bot',
                    sender_name: data.senderName,
                    content_type: 'text',
                    content: data.content,
                    attachments: null,
                    created_at: data.timestamp,
                };

                // Create conversation update
                const conversationUpdate = {
                    last_message_at: data.timestamp,
                    last_message_preview: data.content.substring(0, 100),
                    unread_count: data.direction === 'inbound' ? 1 : 0,
                };

                // Dispatch to Redux
                dispatch(messageReceived({
                    message,
                    conversation: conversationUpdate,
                }));

                // Show toast notification for inbound messages
                if (data.direction === 'inbound') {
                    toast.info(
                        `Tin nhắn từ ${data.senderName}`,
                        data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '')
                    );
                }
            });

            channelsRef.current.push(channel);
        });

        console.log('[ZaloMessages] Subscribed to', ownIds.length, 'account channels');
    }, [dispatch, toast]);

    // Fetch accounts and subscribe on mount
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const accounts = await zaloApi.getAccounts();

                if (!mounted) return;

                // Get ownIds of connected accounts
                const ownIds = accounts
                    .filter((acc) => acc.status === 'connected')
                    .map((acc) => acc.own_id);

                if (ownIds.length > 0) {
                    subscribeToAccounts(ownIds);
                }
            } catch (err) {
                console.error('[ZaloMessages] Failed to fetch accounts:', err);
            }
        };

        init();

        // Cleanup on unmount
        return () => {
            mounted = false;
            accountsRef.current.forEach((ownId) => {
                echo.leaveChannel(`zalo.messages.${ownId}`);
            });
            channelsRef.current = [];
            accountsRef.current = [];
        };
    }, [subscribeToAccounts]);

    // Re-subscribe when accounts change (optional - call from parent)
    const refreshSubscriptions = useCallback(async () => {
        try {
            const accounts = await zaloApi.getAccounts();
            const ownIds = accounts
                .filter((acc) => acc.status === 'connected')
                .map((acc) => acc.own_id);
            subscribeToAccounts(ownIds);
        } catch (err) {
            console.error('[ZaloMessages] Failed to refresh subscriptions:', err);
        }
    }, [subscribeToAccounts]);

    return { refreshSubscriptions };
}

export default useZaloMessages;
