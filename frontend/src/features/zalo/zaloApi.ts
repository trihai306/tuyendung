import api from '../../services/apiClient';

// Types
export interface ZaloAccount {
    id: string;
    ownId: string;
    displayName: string;
    phone: string;
    avatar?: string;
    status: string;
    companyId?: number;
    userId?: number;
    userName?: string;
}

export interface ZaloGroup {
    id: string;
    name: string;
    memberCount: number;
    avatar?: string;
}

export interface ZaloConversation {
    threadId: string;
    threadType: 'user' | 'group';
    lastMessage: string;
    lastMessageTime: string;
    senderName: string;
    senderAvatar?: string | null;
    unreadCount: number;
}

export interface ZaloMessage {
    id: string;
    threadId: string;
    threadType: 'user' | 'group';
    senderId?: string;
    senderName?: string;
    senderAvatar?: string | null;
    content: string;
    direction: 'inbound' | 'outbound';
    timestamp: string;
    isRead?: boolean;
}

// ===================
// Account APIs
// ===================

/**
 * Get all Zalo accounts
 * Route: GET /zalo
 */
export async function getZaloAccounts(): Promise<ZaloAccount[]> {
    const response = await api.get('/zalo');
    return response.data.data || [];
}

/**
 * Initiate QR login
 * Route: POST /zalo/login
 */
export async function initiateQRLogin(): Promise<{ sessionId: string; message: string }> {
    const response = await api.post('/zalo/login');
    return response.data;
}

/**
 * Get account details
 * Route: GET /zalo/{zaloAccount}
 */
export async function getAccountDetails(accountId: number): Promise<ZaloAccount> {
    const response = await api.get(`/zalo/${accountId}`);
    return response.data.data;
}

/**
 * Delete Zalo account
 * Route: DELETE /zalo/{zaloAccount}
 */
export async function deleteAccount(accountId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/zalo/${accountId}`);
    return response.data;
}

/**
 * Sync groups for account
 * Route: POST /zalo/{zaloAccount}/sync-groups
 */
export async function syncGroups(accountId: number): Promise<{ success: boolean; synced: number }> {
    const response = await api.post(`/zalo/${accountId}/sync-groups`);
    return response.data;
}

/**
 * Disconnect account
 * Route: POST /zalo/{zaloAccount}/disconnect
 */
export async function disconnectAccount(accountId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/zalo/${accountId}/disconnect`);
    return response.data;
}

/**
 * Assign user to account
 * Route: POST /zalo/{zaloAccount}/assign-user
 */
export async function assignUser(accountId: number, userId: number | null): Promise<{ success: boolean }> {
    const response = await api.post(`/zalo/${accountId}/assign-user`, { user_id: userId });
    return response.data;
}

// ===================
// Messaging APIs
// ===================

/**
 * Send message
 * Route: POST /zalo/{zaloAccount}/send-message
 */
export async function sendMessage(
    accountId: number,
    threadId: string,
    message: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/send-message`, {
        thread_id: threadId,
        message,
        type,
    });
    return response.data;
}

// ===================
// Inbox APIs (from DB)
// ===================

/**
 * Get conversations
 * Route: GET /zalo/inbox/conversations
 */
export async function getConversationsFromDB(): Promise<ZaloConversation[]> {
    const response = await api.get('/zalo/inbox/conversations');
    const data = response.data.data?.data || response.data.data || [];
    return data.map((conv: {
        thread_id: string;
        thread_type: string;
        participant_name: string;
        participant_avatar?: string;
        last_message: string;
        last_message_at: string;
        unread_count: number
    }) => ({
        threadId: conv.thread_id,
        threadType: conv.thread_type as 'user' | 'group',
        senderName: conv.participant_name,
        senderAvatar: conv.participant_avatar || null,
        lastMessage: conv.last_message,
        lastMessageTime: conv.last_message_at,
        unreadCount: conv.unread_count || 0,
    }));
}

/**
 * Get messages for thread
 * Route: GET /zalo/inbox/messages/{threadId}
 */
export async function getMessagesFromDB(threadId: string): Promise<ZaloMessage[]> {
    const response = await api.get(`/zalo/inbox/messages/${threadId}`);
    const data = response.data.data?.data || response.data.data || [];
    return data.map((msg: {
        id: number;
        thread_id: string;
        thread_type: string;
        sender_id: string;
        sender_name: string;
        sender_display_name?: string;
        sender_avatar?: string;
        content: string;
        direction: string;
        received_at: string;
        is_read: boolean;
    }) => ({
        id: msg.id.toString(),
        threadId: msg.thread_id,
        threadType: msg.thread_type as 'user' | 'group',
        senderId: msg.sender_id,
        senderName: msg.sender_display_name || msg.sender_name,
        senderAvatar: msg.sender_avatar || null,
        content: msg.content,
        direction: msg.direction as 'inbound' | 'outbound',
        timestamp: msg.received_at,
        isRead: msg.is_read,
    }));
}

// ===================
// Extended APIs (CLI via Laravel)
// All routes use {zaloAccount} parameter
// ===================

/**
 * Find user by phone
 * Route: POST /zalo/{zaloAccount}/find-user
 */
export async function findUser(accountId: number, phone: string): Promise<unknown> {
    const response = await api.post(`/zalo/${accountId}/find-user`, { phone });
    return response.data.data;
}

/**
 * Get friends list
 * Route: GET /zalo/{zaloAccount}/friends
 */
export async function getAccountFriends(accountId: number): Promise<unknown[]> {
    const response = await api.get(`/zalo/${accountId}/friends`);
    return response.data.data || [];
}

/**
 * Send friend request
 * Route: POST /zalo/{zaloAccount}/friends/add
 */
export async function sendFriendRequest(
    accountId: number,
    userId: string,
    message = 'Xin chào!'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/friends/add`, { userId, message });
    return response.data;
}

/**
 * Accept friend request
 * Route: POST /zalo/{zaloAccount}/friends/accept
 */
export async function acceptFriendRequest(
    accountId: number,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/friends/accept`, { userId });
    return response.data;
}

/**
 * Block user
 * Route: POST /zalo/{zaloAccount}/users/{userId}/block
 */
export async function blockUser(
    accountId: number,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/users/${userId}/block`);
    return response.data;
}

/**
 * Unblock user
 * Route: POST /zalo/{zaloAccount}/users/{userId}/unblock
 */
export async function unblockUser(
    accountId: number,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/users/${userId}/unblock`);
    return response.data;
}

/**
 * Create group
 * Route: POST /zalo/{zaloAccount}/groups/create
 */
export async function createGroup(
    accountId: number,
    name: string,
    members: string[] = []
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/create`, { name, members });
    return response.data;
}

/**
 * Get group info
 * Route: GET /zalo/{zaloAccount}/groups/{groupId}/info
 */
export async function getGroupInfo(
    accountId: number,
    groupId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.get(`/zalo/${accountId}/groups/${groupId}/info`);
    return response.data;
}

/**
 * Rename group
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/rename
 */
export async function renameGroup(
    accountId: number,
    groupId: string,
    name: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/rename`, { name });
    return response.data;
}

/**
 * Delete group
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/delete
 */
export async function deleteGroup(
    accountId: number,
    groupId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/delete`);
    return response.data;
}

/**
 * Add member to group
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/add
 */
export async function addMemberToGroup(
    accountId: number,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/add`, { userId });
    return response.data;
}

/**
 * Remove member from group
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/remove
 */
export async function removeMemberFromGroup(
    accountId: number,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/remove`, { userId });
    return response.data;
}

/**
 * React to message
 * Route: POST /zalo/{zaloAccount}/react
 */
export async function reactToMessage(
    accountId: number,
    threadId: string,
    msgId: string,
    icon: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/react`, { threadId, msgId, icon, type });
    return response.data;
}

/**
 * Delete message
 * Route: POST /zalo/{zaloAccount}/delete-message
 */
export async function deleteMessage(
    accountId: number,
    threadId: string,
    msgId: string,
    forAll = false,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/delete-message`, { threadId, msgId, forAll, type });
    return response.data;
}

/**
 * Send sticker
 * Route: POST /zalo/{zaloAccount}/send-sticker
 */
export async function sendSticker(
    accountId: number,
    threadId: string,
    stickerId: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/send-sticker`, { threadId, stickerId, type });
    return response.data;
}

/**
 * Send voice
 * Route: POST /zalo/{zaloAccount}/send-voice
 */
export async function sendVoice(
    accountId: number,
    threadId: string,
    filePath: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/send-voice`, { threadId, filePath, type });
    return response.data;
}

/**
 * Send contact card
 * Route: POST /zalo/{zaloAccount}/send-card
 */
export async function sendCard(
    accountId: number,
    threadId: string,
    userId: string,
    phone: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/send-card`, { threadId, userId, phone, type });
    return response.data;
}

/**
 * Get user info
 * Route: POST /zalo/{zaloAccount}/user-info
 */
export async function getUserInfo(
    accountId: number,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/user-info`, { userId });
    return response.data;
}

/**
 * Get account info (self)
 * Route: GET /zalo/{zaloAccount}/account-info
 */
export async function getAccountInfo(accountId: number): Promise<{ success: boolean; data: unknown }> {
    const response = await api.get(`/zalo/${accountId}/account-info`);
    return response.data;
}

/**
 * Get stickers
 * Route: GET /zalo/{zaloAccount}/stickers
 */
export async function getStickers(
    accountId: number,
    keyword = 'hello'
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.get(`/zalo/${accountId}/stickers`, { params: { keyword } });
    return response.data;
}

/**
 * Set alias for user
 * Route: POST /zalo/{zaloAccount}/users/{userId}/alias
 */
export async function setAlias(
    accountId: number,
    userId: string,
    alias: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/users/${userId}/alias`, { alias });
    return response.data;
}

/**
 * Pin conversation
 * Route: POST /zalo/{zaloAccount}/conversations/{threadId}/pin
 */
export async function pinConversation(
    accountId: number,
    threadId: string,
    pinned = true
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/conversations/${threadId}/pin`, { pinned });
    return response.data;
}

// ===================
// Group Advanced
// ===================

/**
 * Promote to admin
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/promote
 */
export async function promoteToAdmin(
    accountId: number,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/promote`, { userId });
    return response.data;
}

/**
 * Demote from admin
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/demote
 */
export async function demoteFromAdmin(
    accountId: number,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/demote`, { userId });
    return response.data;
}

/**
 * Transfer ownership
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/transfer
 */
export async function transferOwnership(
    accountId: number,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/transfer`, { userId });
    return response.data;
}

// ===================
// Polls & Notes
// ===================

/**
 * Create poll
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/poll
 */
export async function createPoll(
    accountId: number,
    groupId: string,
    question: string,
    options: string[],
    settings?: {
        expiredTime?: number;
        allowMultiChoices?: boolean;
        allowAddNewOption?: boolean;
        isAnonymous?: boolean;
        isHideVotePreview?: boolean;
    }
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/poll`, { question, options, ...settings });
    return response.data;
}

/**
 * Lock poll
 * Route: POST /zalo/{zaloAccount}/polls/{pollId}/lock
 */
export async function lockPoll(
    accountId: number,
    pollId: string
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/polls/${pollId}/lock`);
    return response.data;
}

/**
 * Create note
 * Route: POST /zalo/{zaloAccount}/groups/{groupId}/note
 */
export async function createNote(
    accountId: number,
    groupId: string,
    title: string,
    content: string,
    pinAct = 1
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.post(`/zalo/${accountId}/groups/${groupId}/note`, { title, content, pinAct });
    return response.data;
}

/**
 * Edit note
 * Route: PUT /zalo/{zaloAccount}/notes/{noteId}
 */
export async function editNote(
    accountId: number,
    noteId: string,
    title: string,
    content: string,
    pinAct?: number
): Promise<{ success: boolean; data: unknown }> {
    const response = await api.put(`/zalo/${accountId}/notes/${noteId}`, { title, content, pinAct });
    return response.data;
}
