import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} from './notificationsApi';
import type { AppNotification } from './notificationsApi';

const categoryLabels: Record<string, string> = {
    all: 'Tất cả',
    system: 'Hệ thống',
    zalo: 'Zalo',
    recruiting: 'Tuyển dụng',
    company: 'Doanh nghiệp',
};

const categoryIcons: Record<string, string> = {
    system: '⚙️',
    zalo: '💬',
    recruiting: '👤',
    company: '🏢',
};

const typeColors: Record<string, { bg: string; text: string }> = {
    info: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    warning: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    success: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
};

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function NotificationsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [category, setCategory] = useState<string>('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching } = useGetNotificationsQuery({
        page,
        per_page: 20,
        category: category !== 'all' ? category : undefined,
        is_read: showUnreadOnly ? false : undefined,
    });

    const { data: countData } = useGetUnreadCountQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const notifications = data?.data || [];
    const meta = data?.meta;
    const unreadCount = countData?.data?.count || 0;

    const handleMarkAsRead = async (notification: AppNotification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
    };

    const handleDelete = async (id: number) => {
        await deleteNotification(id);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Thông báo
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className={`flex flex-wrap items-center gap-4 p-4 rounded-xl mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => { setCategory(key); setPage(1); }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                                ${category === key
                                    ? 'bg-emerald-500 text-white'
                                    : isDark
                                        ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Unread Toggle */}
                <label className="flex items-center gap-2 cursor-pointer ml-auto">
                    <input
                        type="checkbox"
                        checked={showUnreadOnly}
                        onChange={(e) => { setShowUnreadOnly(e.target.checked); setPage(1); }}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Chỉ hiển thị chưa đọc
                    </span>
                </label>
            </div>

            {/* Notifications List */}
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang tải...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className={`p-12 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="text-lg font-medium mb-1">Không có thông báo</h3>
                        <p className="text-sm">Bạn chưa có thông báo nào trong danh mục này</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex gap-4 p-4 transition-colors cursor-pointer
                                    ${!notification.is_read ? (isDark ? 'bg-slate-700/30' : 'bg-emerald-50/50') : ''}
                                    ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
                                onClick={() => handleMarkAsRead(notification)}
                            >
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl
                                    ${typeColors[notification.type]?.bg || 'bg-slate-100 dark:bg-slate-700'}`}>
                                    {categoryIcons[notification.category] || '📢'}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'} ${!notification.is_read ? 'font-semibold' : ''}`}>
                                                {notification.title}
                                            </h4>
                                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {formatDate(notification.created_at)}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[notification.type]?.bg} ${typeColors[notification.type]?.text}`}>
                                                    {categoryLabels[notification.category]}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all`}
                                                title="Xóa"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Hiển thị {notifications.length} / {meta.total} thông báo
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1 || isFetching}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50
                                    ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                ← Trước
                            </button>
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {page} / {meta.last_page}
                            </span>
                            <button
                                disabled={page === meta.last_page || isFetching}
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50
                                    ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                Sau →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;
