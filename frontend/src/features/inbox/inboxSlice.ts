import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Message {
    id: number;
    conversation_id: number;
    direction: 'inbound' | 'outbound';
    sender_type: 'customer' | 'agent' | 'bot';
    sender_name: string | null;
    content_type: string;
    content: string;
    attachments: any[] | null;
    created_at: string;
    status?: string;
}

interface Conversation {
    id: string; // thread_id for Zalo
    channel_id: number;
    participant_name: string | null;
    participant_avatar: string | null;
    status: 'open' | 'pending' | 'resolved' | 'spam';
    assigned_to: number | null;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    tags: string[];
    last_message_at: string;
    last_message_preview: string | null;
    unread_count: number;
    // Zalo specific fields
    thread_type?: 'user' | 'group';
    zalo_account_id?: number;
}

interface InboxState {
    conversations: Record<string, Conversation>;
    conversationIds: string[];
    messages: Record<string, Message[]>;
    activeConversationId: string | null;
    filters: {
        status: string | null;
        channelId: number | null;
        assignedTo: number | null;
        search: string;
    };
    isLoading: boolean;
}

const initialState: InboxState = {
    conversations: {},
    conversationIds: [],
    messages: {},
    activeConversationId: null,
    filters: {
        status: null,
        channelId: null,
        assignedTo: null,
        search: '',
    },
    isLoading: false,
};

const inboxSlice = createSlice({
    name: 'inbox',
    initialState,
    reducers: {
        setConversations: (state, action: PayloadAction<any[]>) => {
            // Handle both regular conversations (id) and Zalo conversations (thread_id)
            const conversations = action.payload.map((c) => ({
                id: c.thread_id || c.id?.toString(),
                channel_id: c.zalo_account_id || c.channel_id || 0,
                participant_name: c.participant_name,
                participant_avatar: c.participant_avatar,
                status: c.status || 'open',
                assigned_to: c.assigned_to || null,
                priority: c.priority || 'normal',
                tags: c.tags || [],
                last_message_at: c.last_message_at,
                last_message_preview: c.last_message || c.last_message_preview,
                unread_count: c.unread_count || 0,
                thread_type: c.thread_type,
                zalo_account_id: c.zalo_account_id,
            }));
            state.conversationIds = conversations.map((c: Conversation) => c.id);
            conversations.forEach((conv: Conversation) => {
                state.conversations[conv.id] = conv;
            });
        },
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },
        setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
            state.messages[action.payload.conversationId] = action.payload.messages;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            const conversationId = action.payload.conversation_id;
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            // Prevent duplicates
            if (!state.messages[conversationId].find((m) => m.id === action.payload.id)) {
                state.messages[conversationId].push(action.payload);
            }
        },
        updateConversation: (state, action: PayloadAction<Partial<Conversation> & { id: string }>) => {
            const { id, ...updates } = action.payload;
            if (state.conversations[id]) {
                state.conversations[id] = { ...state.conversations[id], ...updates };
            }
        },
        messageReceived: (state, action: PayloadAction<{ message: Message; conversation: Partial<Conversation> }>) => {
            const { message, conversation } = action.payload;

            // Add message
            if (!state.messages[message.conversation_id]) {
                state.messages[message.conversation_id] = [];
            }
            if (!state.messages[message.conversation_id].find((m) => m.id === message.id)) {
                state.messages[message.conversation_id].push(message);
            }

            // Update conversation
            if (state.conversations[message.conversation_id]) {
                state.conversations[message.conversation_id] = {
                    ...state.conversations[message.conversation_id],
                    ...conversation,
                };
            }
        },
        setFilters: (state, action: PayloadAction<Partial<InboxState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setConversations,
    setActiveConversation,
    setMessages,
    addMessage,
    updateConversation,
    messageReceived,
    setFilters,
    setLoading,
} = inboxSlice.actions;

export default inboxSlice.reducer;
