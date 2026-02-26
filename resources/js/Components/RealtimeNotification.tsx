import { useEffect, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import type { PageProps } from '@/types';

interface TaskAssignedPayload {
    taskId: number;
    taskTitle: string;
    assignerName: string;
    priority: string;
    timestamp: string;
}

interface BroadcastNotificationPayload {
    type: string;
    message?: string;
    task_id?: number;
    task_title?: string;
    assigner_name?: string;
    priority?: string;
}

const PRIORITY_LABELS: Record<string, string> = {
    low: 'Thap',
    normal: 'Binh thuong',
    medium: 'Trung binh',
    high: 'Cao',
    urgent: 'Khan cap',
};

/**
 * Listen for realtime broadcast events on the authenticated user's private channel.
 * Handles both custom events and Laravel DatabaseNotification broadcasts.
 */
export default function RealtimeNotification() {
    const { auth } = usePage<PageProps>().props;
    const userId = auth.user?.id;

    const reloadBadges = useCallback(() => {
        router.reload({ only: ['sidebarBadges'] });
    }, []);

    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channel = window.Echo.private(`user.${userId}`);

        // Custom TaskAssignedEvent (from broadcasting)
        channel.listen('.task.assigned', (data: TaskAssignedPayload) => {
            const priorityLabel = PRIORITY_LABELS[data.priority] ?? data.priority;

            toast.info(`Nhiem vu moi: ${data.taskTitle}`, {
                description: `Giao boi ${data.assignerName} -- Do uu tien: ${priorityLabel}`,
                duration: 8000,
                action: {
                    label: 'Xem',
                    onClick: () => router.visit('/employer/tasks'),
                },
            });

            reloadBadges();
        });

        // Laravel DatabaseNotification broadcast (BroadcastNotificationCreated)
        channel.notification((notification: BroadcastNotificationPayload) => {
            if (notification.type === 'App\\Notifications\\TaskAssignedNotification') {
                toast.info(notification.message ?? 'Ban co nhiem vu moi', {
                    duration: 6000,
                    action: {
                        label: 'Xem',
                        onClick: () => router.visit(
                            notification.task_id
                                ? `/employer/tasks/${notification.task_id}`
                                : '/employer/tasks'
                        ),
                    },
                });
            } else {
                toast.info(notification.message ?? 'Ban co thong bao moi', {
                    duration: 5000,
                });
            }

            reloadBadges();
        });

        return () => {
            channel.stopListening('.task.assigned');
        };
    }, [userId, reloadBadges]);

    return null;
}
