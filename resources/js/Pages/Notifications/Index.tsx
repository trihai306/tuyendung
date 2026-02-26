import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Bell, BellOff, Check, CheckCheck, Trash2,
    Users, FileText, CalendarCheck, Briefcase,
    Filter, ChevronLeft, ChevronRight,
} from 'lucide-react';
import NotificationService from '@/services/NotificationService';
import type { PageProps, AppNotification, PaginatedData } from '@/types';

const NOTIFICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    new_application: Users,
    task_assigned: FileText,
    application_status: Briefcase,
    interview_scheduled: CalendarCheck,
};

const NOTIFICATION_COLORS: Record<string, string> = {
    new_application: 'text-blue-400 bg-blue-500/10',
    task_assigned: 'text-amber-400 bg-amber-500/10',
    application_status: 'text-emerald-400 bg-emerald-500/10',
    interview_scheduled: 'text-purple-400 bg-purple-500/10',
};

const NOTIFICATION_LABELS: Record<string, string> = {
    new_application: 'Ung vien moi',
    task_assigned: 'Nhiem vu',
    application_status: 'Don ung tuyen',
    interview_scheduled: 'Phong van',
};

const FILTER_OPTIONS = [
    { value: 'all', label: 'Tat ca' },
    { value: 'unread', label: 'Chua doc' },
    { value: 'read', label: 'Da doc' },
];

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Vua xong';
    if (diffMinutes < 60) return `${diffMinutes} phut truoc`;
    if (diffHours < 24) return `${diffHours} gio truoc`;
    if (diffDays < 7) return `${diffDays} ngay truoc`;

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getNotificationUrl(notification: AppNotification): string {
    const { data } = notification;
    switch (data.type) {
        case 'new_application':
            return data.application_id ? `/employer/applications/${data.application_id}` : '/employer/applications';
        case 'task_assigned':
            return data.task_id ? `/employer/tasks/${data.task_id}` : '/employer/tasks';
        case 'application_status':
            return data.application_id ? `/candidate/applications/${data.application_id}` : '/candidate/applications';
        case 'interview_scheduled':
            return '/candidate/applications';
        default:
            return '/notifications';
    }
}

interface NotificationPageProps extends PageProps {
    notifications: PaginatedData<AppNotification>;
    filter: string;
    unreadCount: number;
}

export default function NotificationsIndex() {
    const { notifications, filter: currentFilter, unreadCount } = usePage<NotificationPageProps>().props;
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    const handleFilterChange = (filter: string) => {
        router.get(route('notifications.index'), { filter: filter === 'all' ? undefined : filter }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
            router.reload({ only: ['notifications', 'unreadCount', 'sidebarBadges'] });
        } catch {
            // Error handled silently
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            router.reload({ only: ['notifications', 'unreadCount', 'sidebarBadges'] });
        } catch {
            // Error handled silently
        }
    };

    const handleDelete = async (notificationId: string) => {
        setDeletingIds(prev => new Set(prev).add(notificationId));
        try {
            await NotificationService.deleteNotification(notificationId);
            router.reload({ only: ['notifications', 'unreadCount', 'sidebarBadges'] });
        } catch {
            // Error handled silently
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(notificationId);
                return next;
            });
        }
    };

    const handleNotificationClick = async (notification: AppNotification) => {
        if (!notification.read_at) {
            try {
                await NotificationService.markAsRead(notification.id);
            } catch {
                // Error handled silently
            }
        }
        router.visit(getNotificationUrl(notification));
    };

    return (
        <AuthenticatedLayout title="Thong bao" header="Thong bao">
            <Head title="Thong bao" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-card border border-border/50 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-purple-500/[0.02]" />
                    <div className="relative px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 ring-1 ring-blue-500/20">
                                    <Bell className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-foreground">Thong bao</h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {unreadCount > 0
                                            ? `Ban co ${unreadCount} thong bao chua doc`
                                            : 'Tat ca thong bao da duoc doc'
                                        }
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Doc tat ca
                                </button>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 mt-5">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground/40" />
                            {FILTER_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterChange(option.value)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${currentFilter === option.value
                                            ? 'bg-foreground/10 text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    {option.label}
                                    {option.value === 'unread' && unreadCount > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notification List */}
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                    {notifications.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30 mb-4">
                                <BellOff className="h-7 w-7 text-muted-foreground/20" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground/60">Khong co thong bao</p>
                            <p className="text-xs text-muted-foreground/40 mt-1">
                                {currentFilter === 'unread'
                                    ? 'Ban da doc tat ca thong bao'
                                    : 'Cac hoat dong se duoc hien thi o day'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {notifications.data.map((notification) => {
                                const IconComponent = NOTIFICATION_ICONS[notification.data.type] ?? Bell;
                                const colorClass = NOTIFICATION_COLORS[notification.data.type] ?? 'text-muted-foreground bg-muted/50';
                                const label = NOTIFICATION_LABELS[notification.data.type] ?? 'Thong bao';
                                const isUnread = !notification.read_at;
                                const isDeleting = deletingIds.has(notification.id);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`group relative flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer hover:bg-muted/30 ${isUnread ? 'bg-blue-500/[0.02]' : ''
                                            } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        {/* Unread indicator bar */}
                                        {isUnread && (
                                            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-blue-500" />
                                        )}

                                        {/* Icon */}
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass} transition-transform group-hover:scale-[1.05]`}>
                                            <IconComponent className="h-4.5 w-4.5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${colorClass.split(' ')[0]}`}>
                                                    {label}
                                                </span>
                                                {isUnread && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <p className={`text-[13px] leading-relaxed ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                {notification.data.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                                            {isUnread && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                    title="Danh dau da doc"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Xoa thong bao"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {notifications.last_page > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/[0.03]">
                            <p className="text-[11px] text-muted-foreground/50">
                                Trang {notifications.current_page}/{notifications.last_page} -- {notifications.total} thong bao
                            </p>
                            <div className="flex items-center gap-1">
                                {notifications.prev_page_url && (
                                    <Link
                                        href={notifications.prev_page_url}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        preserveState
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                )}
                                {notifications.next_page_url && (
                                    <Link
                                        href={notifications.next_page_url}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        preserveState
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
