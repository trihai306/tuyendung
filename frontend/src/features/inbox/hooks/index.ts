import { useInbox, useConversation, useRealtime } from './useInbox';

export function useConversationList() {
    const inbox = useInbox();
    const channelIds = [...new Set(inbox.conversations.map((c) => c.channel_id))];

    useRealtime(channelIds);

    return inbox;
}

export function useActiveConversation() {
    const { activeConversationId } = useInbox();

    if (!activeConversationId) {
        return {
            conversation: null,
            messages: [],
            sendMessage: async () => { },
            isSending: false,
        };
    }

    return useConversation(activeConversationId);
}
