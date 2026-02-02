import { useState } from 'react';
import { ConversationList } from './components/ConversationList';
import { ChatWindow } from './components/ChatWindow';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setActiveConversation } from './inboxSlice';
import { useTheme } from '../../contexts/ThemeContext';

export function InboxPage() {
    const dispatch = useAppDispatch();
    const { activeConversationId } = useAppSelector((state) => state.inbox);
    const [showSidebar] = useState(true);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const handleSelectConversation = (id: number) => {
        dispatch(setActiveConversation(id));
    };

    return (
        <div className={`flex h-[calc(100vh-3.5rem)] rounded-xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            {/* Sidebar - Conversation List */}
            <div className={`${showSidebar ? 'w-80' : 'w-0'} flex-shrink-0 transition-all overflow-hidden border-r ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hộp thư đến</h1>
                    </div>

                    {/* List */}
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}
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
                            <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Chọn một hội thoại</p>
                            <p className="text-sm">để bắt đầu nhắn tin</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Candidate Info (optional) */}
            {activeConversationId && (
                <div className={`w-80 hidden xl:block border-l ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                    <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Thông tin ứng viên</h3>
                    </div>
                    <div className="p-4">
                        <button className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                            Tạo hồ sơ ứng viên
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
