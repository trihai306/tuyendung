import { useState, useEffect, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Bell, BellOff, Check, CheckCheck, ExternalLink, Users, FileText, CalendarCheck, Briefcase } from 'lucide-react';
import NotificationService from '@/services/NotificationService';
import type { PageProps, AppNotification } from '@/types';

const NOTIFICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    new_application: Users,
    task_assigned: FileText,
    application_status: Briefcase,
    interview_scheduled: CalendarCheck,
};

const NOTIFICATION_COLORS: Record<string, string> = {
    new_application: 'text-blue-400 bg-blue-500/15',
    task_assigned: 'text-amber-400 bg-amber-500/15',
    application_status: 'text-emerald-400 bg-emerald-500/15',
    interview_scheduled: 'text-purple-400 bg-purple-500/15',
};

function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Vua xong';
    if (diffMinutes < 60) return `${diffMinutes} phut truoc`;
    if (diffHours < 24) return `${diffHours} gio truoc`;
    if (diffDays < 7) return `${diffDays} ngay truoc`;

    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
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

export default function NotificationDropdown() {
    const { sidebarBadges } = usePage<PageProps>().props;
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(sidebarBadges?.notifications ?? 0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUnreadCount(sidebarBadges?.notifications ?? 0);
    }, [sidebarBadges?.notifications]);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const result = await NotificationService.getRecent();
            setNotifications(result.notifications);
            setUnreadCount(result.unread_count);
        } catch {
            // Silently handle errors
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const result = await NotificationService.markAsRead(notificationId);
            setUnreadCount(result.unread_count);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
            router.reload({ only: ['sidebarBadges'] });
        } catch {
            // Silently handle errors
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const result = await NotificationService.markAllAsRead();
            setUnreadCount(result.unread_count);
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
            );
            router.reload({ only: ['sidebarBadges'] });
        } catch {
            // Silently handle errors
        }
    };

    const handleNotificationClick = async (notification: AppNotification) => {
        if (!notification.read_at) {
            try {
                await NotificationService.markAsRead(notification.id);
                router.reload({ only: ['sidebarBadges'] });
            } catch {
                // Silently handle
            }
        }
        setIsOpen(false);
        router.visit(getNotificationUrl(notification));
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex items-center justify-center rounded-full h-4 min-w-4 px-1 bg-blue-500 text-[9px] font-bold text-white leading-none">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-96 rounded-xl p-0 shadow-xl border border-border/50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Thong bao</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                                {unreadCount} moi
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <CheckCheck className="h-3 w-3" />
                            Doc tat ca
                        </button>
                    )}
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-5 w-5 border-2 border-muted-foreground/20 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                                <BellOff className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground">Chua co thong bao moi</p>
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => {
                                const IconComponent = NOTIFICATION_ICONS[notification.data.type] ?? Bell;
                                const colorClass = NOTIFICATION_COLORS[notification.data.type] ?? 'text-muted-foreground bg-muted/50';
                                const isUnread = !notification.read_at;

                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${isUnread ? 'bg-blue-500/[0.03]' : ''
                                            }`}
                                    >
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                                            <IconComponent className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[12px] leading-relaxed ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                {notification.data.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                                                {formatTimeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                            {isUnread && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/40 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                    title="Danh dau da doc"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                            {isUnread && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border/50 px-4 py-2.5">
                    <Link
                        href="/notifications"
                        className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Xem tat ca thong bao
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
