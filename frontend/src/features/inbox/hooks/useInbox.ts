import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
    setConversations,
    setActiveConversation,
    setFilters,
    messageReceived,
    updateConversation,
} from '../inboxSlice';
import { useGetConversationsQuery, useSendMessageMutation } from '../inboxApi';
import { getEcho } from '../../../services/echo';

export function useInbox() {
    const dispatch = useAppDispatch();
    const { conversations, conversationIds, filters, isLoading, activeConversationId } = useAppSelector(
        (state) => state.inbox
    );

    const { data, isFetching, refetch } = useGetConversationsQuery(filters);

    useEffect(() => {
        if (data?.data) {
            dispatch(setConversations(data.data));
        }
    }, [data, dispatch]);

    const setFilter = useCallback(
        (key: keyof typeof filters, value: any) => {
            dispatch(setFilters({ [key]: value }));
        },
        [dispatch]
    );

    const selectConversation = useCallback(
        (id: number | null) => {
            dispatch(setActiveConversation(id));
        },
        [dispatch]
    );

    return {
        conversations: conversationIds.map((id) => conversations[id]),
        activeConversationId,
        filters,
        isLoading: isLoading || isFetching,
        setFilter,
        selectConversation,
        refetch,
    };
}

export function useConversation(conversationId: number) {
    const conversation = useAppSelector((state) => state.inbox.conversations[conversationId]);
    const messages = useAppSelector((state) => state.inbox.messages[conversationId] || []);

    const [sendMessageMutation, { isLoading: isSending }] = useSendMessageMutation();

    const sendMessage = useCallback(
        async (content: string, attachments?: any[]) => {
            await sendMessageMutation({
                conversationId,
                content,
                content_type: 'text',
                attachments,
            });
        },
        [conversationId, sendMessageMutation]
    );

    return {
        conversation,
        messages,
        sendMessage,
        isSending,
    };
}

export function useRealtime(channelIds: number[]) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const echo = getEcho();
        if (!echo) return;

        const subscriptions = channelIds.map((channelId) => {
            const channel = echo.private(`inbox.${channelId}`);

            channel.listen('.message.received', (e: any) => {
                dispatch(messageReceived(e));
            });

            channel.listen('.conversation.updated', (e: any) => {
                dispatch(updateConversation(e.conversation));
            });

            return channel;
        });

        return () => {
            subscriptions.forEach((channel) => {
                channel.stopListening('.message.received');
                channel.stopListening('.conversation.updated');
            });
        };
    }, [channelIds, dispatch]);
}
