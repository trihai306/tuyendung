import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    useZaloAccounts,
    useZaloQRLogin,
    useZaloConversations,
    useZaloChat,
    useZaloAccountStatus,
} from './useZaloChat';
import type { ZaloAccount, ZaloConversation, ZaloMessage, ZaloFoundUser } from './zaloApi';
import { findUserByPhone, sendFriendRequest } from './zaloApi';

// ===================
// Message Bubble Component
// ===================
function MessageBubble({ message, isDark }: { message: ZaloMessage; isDark: boolean }) {
    const isOutbound = message.direction === 'outbound';

    return (
        <div className={`flex gap-2 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar for inbound messages */}
            {!isOutbound && (
                <div className="flex-shrink-0 w-8 h-8 mt-1">
                    {message.senderAvatar ? (
                        <img
                            src={message.senderAvatar}
                            alt={message.senderName || 'Avatar'}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                            }`}>
                            {(message.senderName || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}
            <div
                className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm ${isOutbound
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : isDark
                        ? 'bg-slate-800 text-white rounded-bl-md'
                        : 'bg-white text-slate-900 shadow-sm border border-slate-100 rounded-bl-md'
                    }`}
            >
                {!isOutbound && message.senderName && (
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {message.senderName}
                    </p>
                )}
                <p className="whitespace-pre-wrap break-words">{typeof message.content === 'string' ? message.content : '[Attachment]'}</p>
                <div
                    className={`text-[10px] mt-1 flex items-center gap-1 ${isOutbound ? 'text-blue-200 justify-end' : isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                >
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    {isOutbound && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===================
// Chat Input Component
// ===================
function ChatInput({
    onSend,
    sending,
    isDark,
}: {
    onSend: (message: string) => void;
    sending: boolean;
    isDark: boolean;
}) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (!text.trim() || sending) return;
        onSend(text);
        setText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
            <div className="flex items-end gap-2">
                {/* Attachment button */}
                <button
                    className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                        />
                    </svg>
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Aa"
                        rows={1}
                        className={`w-full px-4 py-2.5 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-blue-500/30 focus:outline-none ${isDark
                            ? 'bg-slate-800 text-white placeholder:text-slate-500 border-slate-700'
                            : 'bg-slate-100 text-slate-900 placeholder:text-slate-400 border-transparent'
                            } border`}
                        style={{ minHeight: '42px', maxHeight: '120px' }}
                    />
                </div>

                {/* Send button */}
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim() || sending}
                    className={`p-2.5 rounded-xl transition-all ${text.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : isDark
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-slate-100 text-slate-400'
                        } disabled:opacity-50`}
                >
                    {sending ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

// ===================
// Account List Sidebar
// ===================
function AccountList({
    accounts,
    selectedId,
    onSelect,
    onAddAccount,
    isDark,
}: {
    accounts: ZaloAccount[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAddAccount: () => void;
    isDark: boolean;
}) {
    return (
        <div className={`w-20 flex-shrink-0 border-r ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
            <div className="h-full flex flex-col items-center py-4 gap-3">
                {accounts.map((account, index) => (
                    <button
                        key={`account-${account.ownId}-${index}`}
                        onClick={() => onSelect(account.ownId)}
                        className={`relative group w-12 h-12 rounded-xl transition-all ${selectedId === account.ownId
                            ? 'ring-2 ring-blue-500 ring-offset-2 ' + (isDark ? 'ring-offset-slate-900' : 'ring-offset-white')
                            : 'hover:scale-105'
                            }`}
                        title={account.displayName}
                    >
                        {account.avatar ? (
                            <img src={account.avatar} alt={account.displayName} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                                {account.displayName?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        {/* Online indicator */}
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'
                                } ${account.isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                    </button>
                ))}

                {/* Add account button */}
                <button
                    onClick={onAddAccount}
                    className={`w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${isDark
                        ? 'border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400'
                        : 'border-slate-200 text-slate-400 hover:border-blue-500 hover:text-blue-500'
                        }`}
                    title="Thêm tài khoản"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ===================
// Conversation List
// ===================
function ConversationListPanel({
    conversations,
    selectedId,
    onSelect,
    onSearchPhone,
    loading,
    isDark,
}: {
    conversations: ZaloConversation[];
    selectedId: string | null;
    onSelect: (id: string, type: 'user' | 'group') => void;
    onSearchPhone: () => void;
    loading: boolean;
    isDark: boolean;
}) {
    return (
        <div className={`w-80 flex-shrink-0 border-r ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="relative">
                    <svg
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${isDark ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-100 text-slate-900 placeholder:text-slate-400'
                            }`}
                    />
                </div>
                {/* Phone Search Button */}
                <button
                    onClick={onSearchPhone}
                    className={`mt-2 w-full py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${isDark
                        ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Tìm theo SĐT
                </button>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto h-[calc(100%-65px)]">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className={`p-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">Chưa có tin nhắn</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.threadId}
                            onClick={() => onSelect(conv.threadId, conv.threadType)}
                            className={`w-full p-3 flex items-center gap-3 transition-colors ${selectedId === conv.threadId
                                ? isDark
                                    ? 'bg-blue-500/10'
                                    : 'bg-blue-50'
                                : isDark
                                    ? 'hover:bg-slate-800/50'
                                    : 'hover:bg-slate-50'
                                }`}
                        >
                            {/* Avatar with type badge */}
                            <div className="relative">
                                {conv.senderAvatar ? (
                                    <img
                                        src={conv.senderAvatar}
                                        alt={conv.senderName || 'User'}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${conv.threadType === 'group'
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                                            }`}
                                    >
                                        {conv.threadType === 'group' ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                            </svg>
                                        ) : (
                                            conv.senderName?.[0]?.toUpperCase() || '?'
                                        )}
                                    </div>
                                )}
                                {/* Type badge */}
                                <span
                                    className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${isDark ? 'border-slate-900' : 'border-white'
                                        } ${conv.threadType === 'group'
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-blue-500 text-white'
                                        }`}
                                >
                                    {conv.threadType === 'group' ? 'G' : 'U'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {conv.senderName || 'Unknown'}
                                        </p>
                                        {conv.threadType === 'group' && (
                                            <span className={`flex-shrink-0 px-1.5 py-0.5 text-[9px] font-medium rounded ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                                                Nhóm
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {new Date(conv.lastMessageTime).toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>

                            {/* Unread badge */}
                            {conv.unreadCount > 0 && (
                                <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                </span>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

// ===================
// User Search Modal
// ===================
function UserSearchModal({
    isOpen,
    onClose,
    accountId,
    onStartChat,
    isDark,
}: {
    isOpen: boolean;
    onClose: () => void;
    accountId: number;
    onStartChat: (userId: string, userName: string) => void;
    isDark: boolean;
}) {
    const [phone, setPhone] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundUser, setFoundUser] = useState<ZaloFoundUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [addingFriend, setAddingFriend] = useState(false);
    const [friendRequestSent, setFriendRequestSent] = useState(false);

    const handleSearch = async () => {
        if (!phone.trim() || searching) return;

        setSearching(true);
        setError(null);
        setFoundUser(null);

        const result = await findUserByPhone(accountId, phone.trim());

        if (result.success && result.data) {
            setFoundUser(result.data);
        } else {
            setError(result.error || 'Không tìm thấy người dùng');
        }

        setSearching(false);
        setFriendRequestSent(false);
    };

    const handleAddFriend = async () => {
        if (!foundUser || addingFriend) return;
        setAddingFriend(true);
        const result = await sendFriendRequest(accountId, foundUser.uid);
        if (result.success) {
            setFriendRequestSent(true);
        } else {
            setError('Gửi lời mời kết bạn thất bại');
        }
        setAddingFriend(false);
    };

    const handleStartChat = () => {
        if (foundUser) {
            onStartChat(foundUser.uid, foundUser.displayName || foundUser.zaloName);
            onClose();
            setPhone('');
            setFoundUser(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={`w-full max-w-md mx-4 rounded-2xl shadow-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Tìm kiếm người dùng
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4">
                    <div className="flex gap-2">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Nhập số điện thoại..."
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-100 text-slate-900 placeholder:text-slate-400'
                                }`}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={!phone.trim() || searching}
                            className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {searching ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Tìm'
                            )}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Found User */}
                    {foundUser && (
                        <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                {foundUser.avatar ? (
                                    <img src={foundUser.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        {(foundUser.displayName || foundUser.zaloName)?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {foundUser.displayName || foundUser.zaloName}
                                    </p>
                                    {foundUser.zaloName && foundUser.displayName !== foundUser.zaloName && (
                                        <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            @{foundUser.zaloName}
                                        </p>
                                    )}
                                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        ID: {foundUser.uid}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                {/* Add Friend Button */}
                                <button
                                    onClick={handleAddFriend}
                                    disabled={addingFriend || friendRequestSent}
                                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 ${friendRequestSent
                                        ? 'bg-green-500/20 text-green-500 cursor-default'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50'
                                        }`}
                                >
                                    {addingFriend ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : friendRequestSent ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Đã gửi
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            Kết bạn
                                        </>
                                    )}
                                </button>

                                {/* Message Button */}
                                <button
                                    onClick={handleStartChat}
                                    className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Nhắn tin
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===================
// Chat Window
// ===================
function ChatWindowPanel({
    accountId,
    threadId,
    threadType,
    conversationName,
    isDark,
}: {
    accountId: string | null;
    threadId: string | null;
    threadType: 'user' | 'group';
    conversationName: string;
    isDark: boolean;
}) {
    const { messages, loading, sending, sendMessage } = useZaloChat(accountId, threadId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(
        async (content: string) => {
            try {
                await sendMessage(content, threadType);
            } catch (err) {
                console.error('Send failed:', err);
            }
        },
        [sendMessage, threadType]
    );

    if (!accountId || !threadId) {
        return (
            <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <div className="text-center">
                    <div
                        className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                            }`}
                    >
                        <svg className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Chọn một cuộc trò chuyện</p>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>để bắt đầu nhắn tin</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <div className={`p-3 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${threadType === 'group' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                                }`}
                        >
                            {threadType === 'group' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                </svg>
                            ) : (
                                conversationName?.[0]?.toUpperCase() || '👤'
                            )}
                        </div>
                        {/* Type badge */}
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[7px] font-bold ${isDark ? 'border-slate-900' : 'border-white'
                                } ${threadType === 'group'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-blue-500 text-white'
                                }`}
                        >
                            {threadType === 'group' ? 'G' : 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {conversationName || 'Unknown'}
                            </h3>
                            {threadType === 'group' && (
                                <span className={`flex-shrink-0 px-1.5 py-0.5 text-[9px] font-medium rounded ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                                    Nhóm
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-emerald-500">Đang hoạt động</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                    </div>
                ) : (
                    messages.map((msg) => <MessageBubble key={msg.id} message={msg} isDark={isDark} />)
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSend={handleSend} sending={sending} isDark={isDark} />
        </div>
    );
}

// ===================
// QR Login Modal
// ===================
function QRLoginModal({ isOpen, onClose, isDark }: { isOpen: boolean; onClose: () => void; isDark: boolean }) {
    const { qrCode, status, error, initiateLogin, reset } = useZaloQRLogin();

    useEffect(() => {
        if (isOpen && status === 'idle') {
            initiateLogin();
        }
    }, [isOpen, status, initiateLogin]);

    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                <div className={`p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Đăng nhập Zalo</h2>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className={`w-56 h-56 mx-auto rounded-2xl flex items-center justify-center ${isDark ? 'bg-white' : 'bg-slate-50'}`}>
                        {status === 'loading' ? (
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : status === 'waiting' && qrCode ? (
                            <img src={qrCode} alt="QR Code" className="w-full h-full object-contain p-2" />
                        ) : status === 'error' ? (
                            <div className="text-center text-red-500 p-4">
                                <p className="text-sm">{error}</p>
                                <button onClick={initiateLogin} className="mt-2 text-blue-500 text-sm hover:underline">
                                    Thử lại
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className={`mt-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <p>Quét mã QR bằng ứng dụng Zalo</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===================
// Main Page Component
// ===================
export function ZaloChatPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const { accounts, refetch: refetchAccounts } = useZaloAccounts();
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [selectedThreadType, setSelectedThreadType] = useState<'user' | 'group'>('user');
    const [showQRModal, setShowQRModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    const { conversations, loading: loadingConversations, refetch: refetchConversations } = useZaloConversations(selectedAccountId);

    // Auto-select first account
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].ownId);
        }
    }, [accounts, selectedAccountId]);

    // Listen for account status changes
    useZaloAccountStatus(
        useCallback(() => {
            refetchAccounts();
        }, [refetchAccounts])
    );

    const handleSelectAccount = (accountId: string) => {
        setSelectedAccountId(accountId);
        setSelectedThreadId(null);
    };

    const handleSelectConversation = (threadId: string, type: 'user' | 'group') => {
        setSelectedThreadId(threadId);
        setSelectedThreadType(type);
    };

    const handleAddAccount = () => {
        setShowQRModal(true);
    };

    const handleCloseQRModal = () => {
        setShowQRModal(false);
        refetchAccounts();
        if (selectedAccountId) {
            refetchConversations();
        }
    };

    // Get selected account ID for search
    const selectedAccount = accounts.find(a => a.ownId === selectedAccountId);
    const selectedAccountNumericId = selectedAccount?.id ? parseInt(selectedAccount.id, 10) : 0;

    const handleStartChatFromSearch = (userId: string, _userName: string) => {
        // Set the thread to start chatting
        setSelectedThreadId(userId);
        setSelectedThreadType('user');
        setShowSearchModal(false);
    };

    return (
        <div className={`flex h-[calc(100vh-3.5rem)] rounded-xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Account sidebar */}
            <AccountList
                accounts={accounts}
                selectedId={selectedAccountId}
                onSelect={handleSelectAccount}
                onAddAccount={handleAddAccount}
                isDark={isDark}
            />

            {/* Conversation list */}
            <ConversationListPanel
                conversations={conversations}
                selectedId={selectedThreadId}
                onSelect={handleSelectConversation}
                onSearchPhone={() => setShowSearchModal(true)}
                loading={loadingConversations}
                isDark={isDark}
            />

            {/* Chat window */}
            <ChatWindowPanel
                accountId={selectedAccountId}
                threadId={selectedThreadId}
                threadType={selectedThreadType}
                conversationName={conversations.find(c => c.threadId === selectedThreadId)?.senderName || ''}
                isDark={isDark}
            />

            {/* QR Login Modal */}
            <QRLoginModal isOpen={showQRModal} onClose={handleCloseQRModal} isDark={isDark} />

            {/* User Search Modal */}
            <UserSearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                accountId={selectedAccountNumericId}
                onStartChat={handleStartChatFromSearch}
                isDark={isDark}
            />
        </div>
    );
}
