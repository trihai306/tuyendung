import { useConversationList } from '../hooks';
import { useTheme } from '../../../contexts/ThemeContext';

interface ConversationListProps {
    onSelect: (id: number) => void;
}

export function ConversationList({ onSelect }: ConversationListProps) {
    const { conversations, activeConversationId, isLoading, setFilter, filters } = useConversationList();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search & Filters */}
            <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none ${isDark
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                        } border`}
                />
                <div className="flex gap-1.5 mt-2">
                    {['all', 'open', 'pending', 'resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter('status', status === 'all' ? null : status)}
                            className={`px-2.5 py-1 text-xs rounded-full transition-colors font-medium ${(status === 'all' && !filters.status) || filters.status === status
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
                    <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Không có hội thoại nào
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => onSelect(conversation.id)}
                            className={`p-3 border-b cursor-pointer transition-colors ${isDark ? 'border-slate-800' : 'border-slate-50'
                                } ${activeConversationId === conversation.id
                                    ? isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                    : isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                    {conversation.participant_name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {conversation.participant_name || 'Khách'}
                                        </span>
                                        {conversation.unread_count > 0 && (
                                            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                                {conversation.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {conversation.last_message_preview}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`inline-block w-1.5 h-1.5 rounded-full ${conversation.status === 'open'
                                                    ? 'bg-emerald-500'
                                                    : conversation.status === 'pending'
                                                        ? 'bg-amber-500'
                                                        : 'bg-slate-400'
                                                }`}
                                        />
                                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {new Date(conversation.last_message_at).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
