import { useState, useMemo } from 'react';
import { ConversationList } from './components/ConversationList';
import { ChatWindow } from './components/ChatWindow';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setActiveConversation, setFilters } from './inboxSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useZaloMessages } from './useZaloMessages';

// Account type for tabs
interface AccountTab {
    id: number | null; // null = all accounts
    name: string;
    type: 'all' | 'zalo' | 'facebook' | 'other';
    unreadCount: number;
}

// Icons
const AllInboxIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
);

const ZaloIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.957l-1.867 5.478c-.31.91-1.14.91-1.45 0l-2.022-5.933-5.933-2.022c-.91-.31-.91-1.14 0-1.45l5.478-1.867c.538-.184 1.086.364.902.902l-1.867 5.478 5.478-1.867c.538-.184 1.086.364.902.902l-.621 1.379z" />
    </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

export function InboxPage() {
    const dispatch = useAppDispatch();
    const { activeConversationId, conversations, conversationIds, filters } = useAppSelector((state) => state.inbox);
    const [showSidebar] = useState(true);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // Subscribe to realtime Zalo messages
    useZaloMessages();

    // Calculate account tabs from conversations
    const accountTabs = useMemo<AccountTab[]>(() => {
        const convList = conversationIds.map(id => conversations[id]);
        const channelMap = new Map<number, { count: number; unread: number }>();
        let totalUnread = 0;

        convList.forEach(conv => {
            if (conv) {
                const existing = channelMap.get(conv.channel_id) || { count: 0, unread: 0 };
                channelMap.set(conv.channel_id, {
                    count: existing.count + 1,
                    unread: existing.unread + (conv.unread_count || 0)
                });
                totalUnread += conv.unread_count || 0;
            }
        });

        const tabs: AccountTab[] = [
            { id: null, name: 'Tất cả', type: 'all', unreadCount: totalUnread }
        ];

        // Add individual channel tabs
        let index = 0;
        channelMap.forEach((stats, channelId) => {
            tabs.push({
                id: channelId,
                name: `Tài khoản ${index + 1}`,
                type: 'zalo', // Default to zalo for now
                unreadCount: stats.unread
            });
            index++;
        });

        return tabs;
    }, [conversations, conversationIds]);

    const handleSelectConversation = (id: string) => {
        dispatch(setActiveConversation(id));
    };

    const handleTabChange = (channelId: number | null) => {
        dispatch(setFilters({ channelId }));
    };

    const getTabIcon = (type: AccountTab['type']) => {
        switch (type) {
            case 'all': return <AllInboxIcon className="w-4 h-4" />;
            case 'zalo': return <ZaloIcon className="w-4 h-4" />;
            case 'facebook': return <FacebookIcon className="w-4 h-4" />;
            default: return <AllInboxIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className={`flex flex-1 min-h-0 rounded-xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Sidebar - Conversation List */}
            <div className={`${showSidebar ? 'w-96' : 'w-0'} flex-shrink-0 transition-all overflow-hidden border-r ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="h-full flex flex-col">
                    {/* Header with Title */}
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hộp thư đến</h1>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                                {accountTabs[0]?.unreadCount || 0} chưa đọc
                            </span>
                        </div>
                    </div>

                    {/* Account Tabs Strip */}
                    <div className={`px-2 py-2 border-b overflow-x-auto flex gap-1 ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/50'}`}>
                        {accountTabs.map((tab) => {
                            const isActive = filters.channelId === tab.id;
                            return (
                                <button
                                    key={tab.id ?? 'all'}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                        ? isDark
                                            ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                                            : 'bg-emerald-100 text-emerald-700 shadow-sm'
                                        : isDark
                                            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                        }`}
                                >
                                    <span className={isActive ? '' : 'opacity-70'}>{getTabIcon(tab.type)}</span>
                                    <span>{tab.name}</span>
                                    {tab.unreadCount > 0 && (
                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${isActive
                                            ? isDark ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'
                                            : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {tab.unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-hidden">
                        <ConversationList onSelect={handleSelectConversation} />
                    </div>
                </div>
            </div>

            {/* Main - Chat Window */}
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {activeConversationId ? (
                    <ChatWindow conversationId={activeConversationId} />
                ) : (
                    <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="text-center">
                            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-10 w-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Chọn một cuộc hội thoại</p>
                            <p className="text-sm mt-1">để bắt đầu nhắn tin</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Candidate Info (optional) */}
            {activeConversationId && (
                <div className={`w-80 hidden xl:block border-l ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Thông tin ứng viên</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <button className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                            Tạo hồ sơ ứng viên
                        </button>
                        <button className={`w-full py-2.5 px-4 text-sm font-medium rounded-lg transition-colors border ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            Gán cho nhân viên
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
