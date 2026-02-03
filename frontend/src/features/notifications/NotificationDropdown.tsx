import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useGetRecentNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from './notificationsApi';
import type { AppNotification } from './notificationsApi';

// Icons for notification types
const typeIcons: Record<string, string> = {
    info: '💬',
    warning: '⚠️',
    success: '✅',
    error: '❌',
};

const categoryIcons: Record<string, string> = {
    system: '⚙️',
    zalo: '💬',
    recruiting: '👤',
    company: '🏢',
};

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
}

interface NotificationDropdownProps {
    className?: string;
}

export function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: recentData, isLoading } = useGetRecentNotificationsQuery();
    const { data: countData } = useGetUnreadCountQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    const notifications = recentData?.data || [];
    const unreadCount = countData?.data?.count || 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: AppNotification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg transition-colors
                    ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ${isDark ? 'border border-slate-900' : 'border border-white'}`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-50 border
                    ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b
                        ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Thông báo
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-emerald-500 hover:text-emerald-600 font-medium"
                                >
                                    Đọc tất cả
                                </button>
                            )}
                            <Link
                                to="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-emerald-500 hover:text-emerald-600 font-medium"
                            >
                                Xem tất cả →
                            </Link>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[360px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center">
                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-sm">Không có thông báo mới</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex gap-3 p-3 cursor-pointer transition-colors border-b last:border-b-0
                                        ${!notification.is_read ? (isDark ? 'bg-slate-700/50' : 'bg-emerald-50/50') : ''}
                                        ${isDark ? 'border-slate-700/50 hover:bg-slate-700' : 'border-slate-100 hover:bg-slate-50'}`}
                                >
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg
                                        ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                        {categoryIcons[notification.category] || typeIcons[notification.type]}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {notification.title}
                                        </p>
                                        <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {notification.message}
                                        </p>
                                        <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {formatRelativeTime(notification.created_at)}
                                        </p>
                                    </div>
                                    {/* Unread indicator */}
                                    {!notification.is_read && (
                                        <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationDropdown;
