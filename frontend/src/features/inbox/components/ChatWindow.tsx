import { useState, useRef, useEffect } from 'react';
import { useConversation } from '../hooks/useInbox';
import { useTheme } from '../../../contexts/ThemeContext';

interface ChatWindowProps {
    conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const { conversation, messages, sendMessage, isSending } = useConversation(conversationId);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isSending) return;

        const text = inputText;
        setInputText('');
        await sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversation) {
        return (
            <div className={`flex items-center justify-center h-full ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Chọn một hội thoại để bắt đầu
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={`p-3 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {conversation.participant_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {conversation.participant_name || 'Khách'}
                        </h3>
                        <span className={`text-xs ${conversation.status === 'open' ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {conversation.status === 'open' ? 'Đang mở' : 'Đang chờ'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${message.direction === 'outbound'
                                ? 'bg-emerald-500 text-white rounded-br-sm'
                                : isDark
                                    ? 'bg-slate-800 text-white rounded-bl-sm'
                                    : 'bg-white text-slate-900 shadow-sm rounded-bl-sm'
                                }`}
                        >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <div className={`text-[10px] mt-1 ${message.direction === 'outbound'
                                ? 'text-emerald-200'
                                : isDark ? 'text-slate-500' : 'text-slate-400'
                                }`}>
                                {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                                {message.sender_type === 'bot' && ' • AI'}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className={`px-3 py-2 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {/* Action Icons Row */}
                <div className="flex items-center gap-1 mb-2">
                    <button
                        title="Đính kèm tệp"
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                        </svg>
                    </button>
                    <button
                        title="Gửi hình ảnh"
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </button>
                    <button
                        title="Sticker"
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                        </svg>
                    </button>
                    <button
                        title="GIF"
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75h3M3.75 12h.008v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                </div>
                {/* Input Row */}
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Aa"
                            rows={1}
                            className={`w-full px-3 py-2 pr-10 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-emerald-500/30 focus:outline-none ${isDark
                                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                : 'bg-slate-100 border-transparent text-slate-800 placeholder:text-slate-400'
                                } border`}
                            style={{ minHeight: '36px', maxHeight: '80px' }}
                        />
                        {/* Emoji button inside input */}
                        <button
                            title="Emoji"
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-yellow-400' : 'hover:bg-slate-200 text-slate-400 hover:text-yellow-500'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                            </svg>
                        </button>
                    </div>
                    {inputText.trim() ? (
                        <button
                            onClick={handleSend}
                            disabled={isSending}
                            className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSending ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            )}
                        </button>
                    ) : (
                        <button
                            title="Gửi like"
                            className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
