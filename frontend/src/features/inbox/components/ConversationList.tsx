import { useConversationList } from '../hooks';
import { useTheme } from '../../../contexts/ThemeContext';

interface ConversationListProps {
    onSelect: (id: string) => void;
}

// Account type icons
const ZaloIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.957l-1.867 5.478c-.31.91-1.14.91-1.45 0l-2.022-5.933-5.933-2.022c-.91-.31-.91-1.14 0-1.45l5.478-1.867c.538-.184 1.086.364.902.902l-1.867 5.478 5.478-1.867c.538-.184 1.086.364.902.902l-.621 1.379z" />
    </svg>
);

export function ConversationList({ onSelect }: ConversationListProps) {
    const { conversations, activeConversationId, isLoading, setFilter, filters } = useConversationList();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex flex-col h-full">
                {/* Search skeleton */}
                <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className={`h-10 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <div className="flex gap-1.5 mt-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-7 w-12 rounded-full animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                </div>
                {/* Items skeleton */}
                <div className="flex-1 p-3 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                            <div className="flex-1 space-y-2">
                                <div className={`h-4 w-24 rounded animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                                <div className={`h-3 w-full rounded animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search & Filters */}
            <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="relative">
                    <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tin nhắn..."
                        value={filters.search}
                        onChange={(e) => setFilter('search', e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none ${isDark
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            } border`}
                    />
                </div>
                <div className="flex gap-1.5 mt-2">
                    {['all', 'open', 'pending', 'resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter('status', status === 'all' ? null : status)}
                            className={`px-3 py-1.5 text-xs rounded-full transition-colors font-medium ${(status === 'all' && !filters.status) || filters.status === status
                                ? 'bg-emerald-500 text-white'
                                : isDark
                                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status === 'all' ? 'Tất cả' : status === 'open' ? 'Mở' : status === 'pending' ? 'Chờ' : 'Xong'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <svg className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chưa có tin nhắn</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tin nhắn mới sẽ xuất hiện ở đây</p>
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        const isUnread = conversation.unread_count > 0;
                        const isActive = activeConversationId === conversation.id;

                        return (
                            <div
                                key={conversation.id}
                                onClick={() => onSelect(conversation.id)}
                                className={`relative p-3 border-b cursor-pointer transition-all ${isDark ? 'border-slate-800/50' : 'border-slate-50'} 
                                    ${isActive
                                        ? isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                        : isUnread
                                            ? isDark ? 'bg-slate-800/30 hover:bg-slate-800/50' : 'bg-blue-50/50 hover:bg-blue-50'
                                            : isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                                    }`}
                            >
                                {/* Unread indicator bar */}
                                {isUnread && !isActive && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                                )}

                                <div className="flex items-start gap-3">
                                    {/* Avatar with account badge */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-medium text-sm ${isUnread
                                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-emerald-500/30'
                                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                            }`}>
                                            {conversation.participant_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        {/* Account type badge */}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'} ring-2 ${isDark ? 'ring-slate-800' : 'ring-slate-100'}`}>
                                            <ZaloIcon className={`w-3 h-3 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`truncate ${isUnread ? 'font-bold' : 'font-medium'} text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {conversation.participant_name || 'Khách'}
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {new Date(conversation.last_message_at).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                {isUnread && (
                                                    <span className="min-w-[20px] h-5 px-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${isUnread ? (isDark ? 'text-slate-300' : 'text-slate-700') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                                            {conversation.last_message_preview}
                                        </p>
                                        {/* Status indicator */}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span
                                                className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${conversation.status === 'open'
                                                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                                    : conversation.status === 'pending'
                                                        ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                                                        : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${conversation.status === 'open'
                                                    ? 'bg-emerald-500'
                                                    : conversation.status === 'pending'
                                                        ? 'bg-amber-500'
                                                        : 'bg-slate-400'
                                                    }`} />
                                                {conversation.status === 'open' ? 'Mở' : conversation.status === 'pending' ? 'Chờ' : 'Xong'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
