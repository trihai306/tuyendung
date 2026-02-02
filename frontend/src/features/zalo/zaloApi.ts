import api from '../../services/apiClient';

// Types
export interface ZaloAccount {
    ownId: string;
    displayName: string;
    phone: string;
    avatar?: string;
    isOnline: boolean;
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

// API Base URL for zalo-service
const ZALO_SERVICE_URL = import.meta.env.VITE_ZALO_SERVICE_URL || 'http://localhost:3001';

/**
 * Fetch directly from zalo-service (for accounts, real-time data)
 */
async function fetchFromZaloService<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${ZALO_SERVICE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Zalo service error: ${response.status}`);
    }

    return response.json();
}

// ===================
// Account APIs
// ===================

export async function getZaloAccounts(): Promise<ZaloAccount[]> {
    const response = await fetchFromZaloService<{ success: boolean; data: ZaloAccount[] }>('/api/accounts');
    return response.data || [];
}

export async function initiateQRLogin(): Promise<{ qrCode: string; message: string }> {
    const response = await fetchFromZaloService<{ success: boolean; qrCode: string; message: string }>(
        '/api/login',
        { method: 'POST' }
    );
    return { qrCode: response.qrCode, message: response.message };
}

export async function loginWithCookie(ownId: string): Promise<ZaloAccount> {
    const response = await fetchFromZaloService<{ success: boolean; data: ZaloAccount }>(
        '/api/login-cookie',
        { method: 'POST', body: JSON.stringify({ ownId }) }
    );
    return response.data;
}

export async function getAccountDetails(ownId: string): Promise<ZaloAccount> {
    const response = await fetchFromZaloService<{ success: boolean; data: ZaloAccount }>(
        `/api/accounts/${ownId}`
    );
    return response.data;
}

export async function getSavedAccounts(): Promise<{ ownId: string; isLoggedIn: boolean }[]> {
    const response = await fetchFromZaloService<{ success: boolean; data: { ownId: string; isLoggedIn: boolean }[] }>(
        '/api/saved-accounts'
    );
    return response.data || [];
}

// ===================
// Groups & Friends APIs
// ===================

export async function getAccountGroups(ownId: string): Promise<ZaloGroup[]> {
    const response = await fetchFromZaloService<{ success: boolean; data: ZaloGroup[]; total: number }>(
        `/api/accounts/${ownId}/groups`
    );
    return response.data || [];
}

export async function getAccountFriends(ownId: string): Promise<unknown[]> {
    const response = await fetchFromZaloService<{ success: boolean; data: unknown[] }>(
        `/api/accounts/${ownId}/friends`
    );
    return response.data || [];
}

// ===================
// Conversation & Message APIs
// ===================

export async function getConversations(ownId: string): Promise<ZaloConversation[]> {
    const response = await fetchFromZaloService<{ success: boolean; data: ZaloConversation[] }>(
        `/api/accounts/${ownId}/conversations`
    );
    return response.data || [];
}

export async function getMessages(ownId: string, threadId: string, limit = 50): Promise<ZaloMessage[]> {
    const response = await fetchFromZaloService<{ success: boolean; data: ZaloMessage[] }>(
        `/api/accounts/${ownId}/conversations/${threadId}/messages?limit=${limit}`
    );
    return response.data || [];
}

export async function sendMessage(
    ownId: string,
    threadId: string,
    message: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/send-message', {
        method: 'POST',
        body: JSON.stringify({ ownId, threadId, message, type }),
    });
}

export async function findUser(ownId: string, phone: string): Promise<unknown> {
    const response = await fetchFromZaloService<{ success: boolean; data: unknown }>(
        '/api/find-user',
        { method: 'POST', body: JSON.stringify({ ownId, phone }) }
    );
    return response.data;
}

// ===================
// Laravel API (for stored data)
// ===================

/**
 * Get conversations from Laravel database (stored messages)
 * These are messages received via webhook from zalo-service
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
 * Get messages from Laravel database for a specific thread
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

export async function getStoredMessages(accountId: string, threadId: string): Promise<ZaloMessage[]> {
    const response = await api.get(`/zalo/${accountId}/messages`, {
        params: { thread_id: threadId }
    });
    return response.data.data || [];
}

export async function syncAccountsToDatabase(): Promise<void> {
    await api.post('/zalo/sync');
}

// ===================
// Extended APIs (CLI Parity)
// ===================

export async function sendFriendRequest(
    ownId: string,
    userId: string,
    message = 'Xin chào!'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/friends/add', {
        method: 'POST',
        body: JSON.stringify({ ownId, userId, message }),
    });
}

export async function acceptFriendRequest(
    ownId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ ownId, userId }),
    });
}

export async function createGroup(
    ownId: string,
    name: string,
    members: string[] = []
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/groups/create', {
        method: 'POST',
        body: JSON.stringify({ ownId, name, members }),
    });
}

export async function addMemberToGroup(
    ownId: string,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/add`, {
        method: 'POST',
        body: JSON.stringify({ ownId, userId }),
    });
}

export async function removeMemberFromGroup(
    ownId: string,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/remove`, {
        method: 'POST',
        body: JSON.stringify({ ownId, userId }),
    });
}

export async function blockUser(
    ownId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/users/${userId}/block`, {
        method: 'POST',
        body: JSON.stringify({ ownId, block: true }),
    });
}

export async function unblockUser(
    ownId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/users/${userId}/block`, {
        method: 'POST',
        body: JSON.stringify({ ownId, block: false }),
    });
}

export async function reactToMessage(
    ownId: string,
    threadId: string,
    msgId: string,
    icon: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/react', {
        method: 'POST',
        body: JSON.stringify({ ownId, threadId, msgId, icon, type }),
    });
}

export async function deleteMessage(
    ownId: string,
    threadId: string,
    msgId: string,
    forAll = false,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/delete-message', {
        method: 'POST',
        body: JSON.stringify({ ownId, threadId, msgId, forAll, type }),
    });
}

export async function sendSticker(
    ownId: string,
    threadId: string,
    stickerId: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/send-sticker', {
        method: 'POST',
        body: JSON.stringify({ ownId, threadId, stickerId, type }),
    });
}

export async function disconnectAccount(
    ownId: string
): Promise<{ success: boolean; message: string }> {
    return fetchFromZaloService(`/api/accounts/${ownId}/disconnect`, {
        method: 'POST',
    });
}

// ===================
// Additional APIs (Full CLI Parity)
// ===================

export async function sendVoice(
    ownId: string,
    threadId: string,
    filePath: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/send-voice', {
        method: 'POST',
        body: JSON.stringify({ ownId, threadId, filePath, type }),
    });
}

export async function sendCard(
    ownId: string,
    threadId: string,
    userId: string,
    phone: string,
    type: 'user' | 'group' = 'user'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/send-card', {
        method: 'POST',
        body: JSON.stringify({ ownId, threadId, userId, phone, type }),
    });
}

export async function getUserInfo(
    ownId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService('/api/user-info', {
        method: 'POST',
        body: JSON.stringify({ ownId, userId }),
    });
}

export async function getGroupInfo(
    ownId: string,
    groupId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/info?ownId=${ownId}`);
}

export async function renameGroup(
    ownId: string,
    groupId: string,
    name: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/rename`, {
        method: 'POST',
        body: JSON.stringify({ ownId, name }),
    });
}

export async function deleteGroup(
    ownId: string,
    groupId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/delete`, {
        method: 'POST',
        body: JSON.stringify({ ownId }),
    });
}

export async function promoteToAdmin(
    ownId: string,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/promote`, {
        method: 'POST',
        body: JSON.stringify({ ownId, userId }),
    });
}

export async function demoteFromAdmin(
    ownId: string,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/demote`, {
        method: 'POST',
        body: JSON.stringify({ ownId, userId }),
    });
}

export async function transferOwnership(
    ownId: string,
    groupId: string,
    userId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ ownId, userId }),
    });
}

export async function createPoll(
    ownId: string,
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
    return fetchFromZaloService(`/api/groups/${groupId}/poll`, {
        method: 'POST',
        body: JSON.stringify({ ownId, question, options, ...settings }),
    });
}

export async function lockPoll(
    ownId: string,
    pollId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/polls/${pollId}/lock`, {
        method: 'POST',
        body: JSON.stringify({ ownId }),
    });
}

export async function createNote(
    ownId: string,
    groupId: string,
    title: string,
    content: string,
    pinAct = 1
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/groups/${groupId}/note`, {
        method: 'POST',
        body: JSON.stringify({ ownId, title, content, pinAct }),
    });
}

export async function editNote(
    ownId: string,
    noteId: string,
    title: string,
    content: string,
    pinAct?: number
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({ ownId, title, content, pinAct }),
    });
}

export async function getStickers(
    ownId: string,
    keyword = 'hello'
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/stickers?ownId=${ownId}&keyword=${encodeURIComponent(keyword)}`);
}

export async function getAccountInfo(
    ownId: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/accounts/${ownId}/info`);
}

export async function setAlias(
    ownId: string,
    userId: string,
    alias: string
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/users/${userId}/alias`, {
        method: 'POST',
        body: JSON.stringify({ ownId, alias }),
    });
}

export async function pinConversation(
    ownId: string,
    threadId: string,
    pinned = true
): Promise<{ success: boolean; data: unknown }> {
    return fetchFromZaloService(`/api/conversations/${threadId}/pin`, {
        method: 'POST',
        body: JSON.stringify({ ownId, pinned }),
    });
}
