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
    id: number;
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
}

interface InboxState {
    conversations: Record<number, Conversation>;
    conversationIds: number[];
    messages: Record<number, Message[]>;
    activeConversationId: number | null;
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
        setConversations: (state, action: PayloadAction<Conversation[]>) => {
            state.conversationIds = action.payload.map((c) => c.id);
            action.payload.forEach((conv) => {
                state.conversations[conv.id] = conv;
            });
        },
        setActiveConversation: (state, action: PayloadAction<number | null>) => {
            state.activeConversationId = action.payload;
        },
        setMessages: (state, action: PayloadAction<{ conversationId: number; messages: Message[] }>) => {
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
        updateConversation: (state, action: PayloadAction<Partial<Conversation> & { id: number }>) => {
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
