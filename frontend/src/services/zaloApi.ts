import apiClient from './apiClient';

// ==================== Types ====================

export interface ZaloGroup {
    id: string;
    name: string;
    member_count: number;
    avatar?: string;
    synced_at?: string;
}

export interface ZaloAccount {
    id: number;
    own_id: string;
    display_name: string;
    phone: string | null;
    avatar: string | null;
    status: 'connected' | 'disconnected' | 'connecting';
    company_id: number | null;
    user_id: number | null;
    user_name?: string;
    groups: ZaloGroup[];
    created_at: string;
    last_active_at: string | null;
}

export interface ZaloAccountListResponse {
    success: boolean;
    data: ZaloAccount[];
    total: number;
}

export interface ZaloAccountResponse {
    success: boolean;
    data: ZaloAccount;
}

export interface QrLoginResponse {
    success: boolean;
    qr_code: string;
    session_id: string;
}

export interface SyncGroupsResponse {
    success: boolean;
    message: string;
    synced_count: number;
    groups: ZaloGroup[];
}

export interface SendMessagePayload {
    thread_id: string;
    message: string;
    type?: 'user' | 'group';
}

export interface ZaloStatusResponse {
    connected: boolean;
    total_accounts: number;
    online_accounts: number;
}

// ==================== Zalo API Service ====================

const zaloApi = {
    /**
     * Get all Zalo accounts (company + unassigned)
     */
    getAccounts: async (): Promise<ZaloAccount[]> => {
        const response = await apiClient.get<ZaloAccountListResponse>('/zalo');
        return response.data.data;
    },

    /**
     * Get single account details with groups
     */
    getAccount: async (id: number): Promise<ZaloAccount> => {
        const response = await apiClient.get<ZaloAccountResponse>(`/zalo/${id}`);
        return response.data.data;
    },

    /**
     * Initiate QR code login
     */
    initiateLogin: async (proxyUrl?: string): Promise<QrLoginResponse> => {
        const response = await apiClient.post<QrLoginResponse>('/zalo/login', { proxy_url: proxyUrl });
        return response.data;
    },

    /**
     * Sync accounts from Zalo service to database
     */
    syncAccounts: async (): Promise<{ synced_count: number }> => {
        const response = await apiClient.post('/zalo/sync');
        return response.data;
    },

    /**
     * Sync groups for a specific account
     */
    syncGroups: async (accountId: number): Promise<SyncGroupsResponse> => {
        const response = await apiClient.post<SyncGroupsResponse>(`/zalo/${accountId}/sync-groups`);
        return response.data;
    },

    /**
     * Send message via Zalo account
     */
    sendMessage: async (accountId: number, payload: SendMessagePayload): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/send-message`, payload);
        return response.data;
    },

    /**
     * Configure webhook for account
     */
    configureWebhook: async (accountId: number, config: { message_url?: string; group_event_url?: string; reaction_url?: string }): Promise<{ success: boolean }> => {
        const response = await apiClient.post(`/zalo/${accountId}/webhook`, config);
        return response.data;
    },

    /**
     * Delete a Zalo account
     */
    deleteAccount: async (id: number): Promise<void> => {
        await apiClient.delete(`/zalo/${id}`);
    },

    /**
     * Disconnect (logout) a Zalo account
     */
    disconnectAccount: async (id: number): Promise<void> => {
        await apiClient.post(`/zalo/${id}/disconnect`);
    },

    /**
     * Get connection status
     */
    getStatus: async (): Promise<ZaloStatusResponse> => {
        const response = await apiClient.get<ZaloStatusResponse>('/zalo/status');
        return response.data;
    },

    /**
     * Assign a Zalo account to a user (employee)
     */
    assignUser: async (accountId: number, userId: number | null): Promise<{ success: boolean; data: { id: number; user_id: number | null; user_name: string | null } }> => {
        const response = await apiClient.post(`/zalo/${accountId}/assign-user`, { user_id: userId });
        return response.data;
    },

    /**
     * Get Zalo conversations (threads) for current user
     * Privacy: Only returns conversations from user's own accounts
     */
    getInboxConversations: async (perPage = 20): Promise<{ success: boolean; data: unknown[] }> => {
        const response = await apiClient.get('/zalo/inbox/conversations', { params: { per_page: perPage } });
        return response.data;
    },

    /**
     * Get messages for a specific thread
     * Privacy: Returns 403 if thread doesn't belong to current user
     */
    getInboxMessages: async (threadId: string, perPage = 50): Promise<{ success: boolean; data: unknown[] }> => {
        const response = await apiClient.get(`/zalo/inbox/messages/${threadId}`, { params: { per_page: perPage } });
        return response.data;
    },

    // ===================
    // Extended APIs (CLI Parity)
    // ===================

    /**
     * Find user by phone number
     */
    findUser: async (accountId: number, phone: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/find-user`, { phone });
        return response.data;
    },

    /**
     * Get friends list
     */
    getFriends: async (accountId: number): Promise<{ success: boolean; data: unknown[] }> => {
        const response = await apiClient.get(`/zalo/${accountId}/friends`);
        return response.data;
    },

    /**
     * Send friend request
     */
    sendFriendRequest: async (accountId: number, userId: string, message = 'Xin chào!'): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/friends/add`, { user_id: userId, message });
        return response.data;
    },

    /**
     * Accept friend request
     */
    acceptFriendRequest: async (accountId: number, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/friends/accept`, { user_id: userId });
        return response.data;
    },

    /**
     * Create group
     */
    createGroup: async (accountId: number, name: string, members: string[] = []): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/create`, { name, members });
        return response.data;
    },

    /**
     * Add member to group
     */
    addMemberToGroup: async (accountId: number, groupId: string, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/add`, { user_id: userId });
        return response.data;
    },

    /**
     * Remove member from group
     */
    removeMemberFromGroup: async (accountId: number, groupId: string, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/remove`, { user_id: userId });
        return response.data;
    },

    /**
     * Block user
     */
    blockUser: async (accountId: number, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/users/${userId}/block`);
        return response.data;
    },

    /**
     * Unblock user
     */
    unblockUser: async (accountId: number, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/users/${userId}/unblock`);
        return response.data;
    },

    /**
     * React to message
     */
    reactToMessage: async (
        accountId: number,
        threadId: string,
        msgId: string,
        icon: string,
        type: 'user' | 'group' = 'user'
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/react`, { thread_id: threadId, msg_id: msgId, icon, type });
        return response.data;
    },

    /**
     * Delete message
     */
    deleteMessage: async (
        accountId: number,
        threadId: string,
        msgId: string,
        forAll = false,
        type: 'user' | 'group' = 'user'
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/delete-message`, { thread_id: threadId, msg_id: msgId, for_all: forAll, type });
        return response.data;
    },

    /**
     * Send sticker
     */
    sendSticker: async (
        accountId: number,
        threadId: string,
        stickerId: string,
        type: 'user' | 'group' = 'user'
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/send-sticker`, { thread_id: threadId, sticker_id: stickerId, type });
        return response.data;
    },

    // ===========================================
    // ADDITIONAL FEATURES (Full CLI Parity)
    // ===========================================

    /**
     * Send voice message
     */
    sendVoice: async (
        accountId: number,
        threadId: string,
        filePath: string,
        type: 'user' | 'group' = 'user'
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/send-voice`, { thread_id: threadId, file_path: filePath, type });
        return response.data;
    },

    /**
     * Send contact card
     */
    sendCard: async (
        accountId: number,
        threadId: string,
        userId: string,
        phone: string,
        type: 'user' | 'group' = 'user'
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/send-card`, { thread_id: threadId, user_id: userId, phone, type });
        return response.data;
    },

    /**
     * Get user info
     */
    getUserInfo: async (accountId: number, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/user-info`, { user_id: userId });
        return response.data;
    },

    /**
     * Get account info
     */
    getAccountInfo: async (accountId: number): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.get(`/zalo/${accountId}/account-info`);
        return response.data;
    },

    /**
     * Get stickers
     */
    getStickers: async (accountId: number, keyword = 'hello'): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.get(`/zalo/${accountId}/stickers`, { params: { keyword } });
        return response.data;
    },

    /**
     * Get group info
     */
    getGroupInfo: async (accountId: number, groupId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.get(`/zalo/${accountId}/groups/${groupId}/info`);
        return response.data;
    },

    /**
     * Rename group
     */
    renameGroup: async (accountId: number, groupId: string, name: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/rename`, { name });
        return response.data;
    },

    /**
     * Delete group
     */
    deleteGroup: async (accountId: number, groupId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/delete`);
        return response.data;
    },

    /**
     * Promote to admin
     */
    promoteToAdmin: async (accountId: number, groupId: string, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/promote`, { user_id: userId });
        return response.data;
    },

    /**
     * Demote from admin
     */
    demoteFromAdmin: async (accountId: number, groupId: string, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/demote`, { user_id: userId });
        return response.data;
    },

    /**
     * Transfer ownership
     */
    transferOwnership: async (accountId: number, groupId: string, userId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/transfer`, { user_id: userId });
        return response.data;
    },

    /**
     * Create poll
     */
    createPoll: async (
        accountId: number,
        groupId: string,
        question: string,
        options: string[],
        settings?: Record<string, unknown>
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/poll`, { question, options, ...settings });
        return response.data;
    },

    /**
     * Lock poll
     */
    lockPoll: async (accountId: number, pollId: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/polls/${pollId}/lock`);
        return response.data;
    },

    /**
     * Create note
     */
    createNote: async (
        accountId: number,
        groupId: string,
        title: string,
        content: string,
        pinAct = 1
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/groups/${groupId}/note`, { title, content, pin_act: pinAct });
        return response.data;
    },

    /**
     * Edit note
     */
    editNote: async (
        accountId: number,
        noteId: string,
        title: string,
        content: string,
        pinAct?: number
    ): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.put(`/zalo/${accountId}/notes/${noteId}`, { title, content, pin_act: pinAct });
        return response.data;
    },

    /**
     * Set alias for user
     */
    setAlias: async (accountId: number, userId: string, alias: string): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/users/${userId}/alias`, { alias });
        return response.data;
    },

    /**
     * Pin/unpin conversation
     */
    pinConversation: async (accountId: number, threadId: string, pinned = true): Promise<{ success: boolean; data: unknown }> => {
        const response = await apiClient.post(`/zalo/${accountId}/conversations/${threadId}/pin`, { pinned });
        return response.data;
    },
};

export default zaloApi;
