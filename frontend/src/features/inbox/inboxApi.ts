import { api } from '../../services/api';

export const inboxApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (params) => ({
                url: '/zalo/inbox/conversations',
                params,
            }),
            providesTags: ['Conversation'],
        }),
        getConversation: builder.query({
            query: (id: number) => `/inbox/conversations/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Conversation', id }],
        }),
        getMessages: builder.query({
            query: (threadId: string) => `/zalo/inbox/messages/${threadId}`,
            providesTags: (_result, _error, id) => [{ type: 'Message', id }],
        }),
        sendMessage: builder.mutation({
            query: ({ conversationId, ...body }) => ({
                url: `/inbox/conversations/${conversationId}/messages`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { conversationId }) => [
                { type: 'Message', id: conversationId },
                'Conversation',
            ],
        }),
        updateConversation: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/inbox/conversations/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Conversation', id }],
        }),
        assignConversation: builder.mutation({
            query: ({ conversationId, userId }) => ({
                url: `/inbox/conversations/${conversationId}/assign`,
                method: 'POST',
                body: { user_id: userId },
            }),
            invalidatesTags: (_result, _error, { conversationId }) => [
                { type: 'Conversation', id: conversationId },
            ],
        }),
        createCandidateFromConversation: builder.mutation({
            query: ({ conversationId, ...body }) => ({
                url: `/inbox/conversations/${conversationId}/candidate`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Candidate', 'Conversation'],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useGetConversationQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useUpdateConversationMutation,
    useAssignConversationMutation,
    useCreateCandidateFromConversationMutation,
} = inboxApi;
