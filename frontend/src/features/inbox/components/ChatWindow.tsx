import { useState, useRef, useEffect } from 'react';
import { useConversation } from '../hooks/useInbox';
import { useTheme } from '../../../contexts/ThemeContext';

interface ChatWindowProps {
    conversationId: number;
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
            <div className={`p-3 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-end gap-2">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        rows={1}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500/30 focus:outline-none ${isDark
                                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            } border`}
                        style={{ minHeight: '40px', maxHeight: '100px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isSending}
                        className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
