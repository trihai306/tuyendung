import axios from 'axios';
import { router } from '@inertiajs/react';
import type { AppNotification } from '@/types';

interface NotificationApiResponse {
    notifications: AppNotification[];
    unread_count: number;
}

interface MarkReadResponse {
    message: string;
    unread_count: number;
}

const NotificationService = {
    async getRecent(): Promise<NotificationApiResponse> {
        const { data } = await axios.get<NotificationApiResponse>(
            route('notifications.api'),
        );
        return data;
    },

    async markAsRead(notificationId: string): Promise<MarkReadResponse> {
        const { data } = await axios.patch<MarkReadResponse>(
            route('notifications.read', notificationId),
        );
        return data;
    },

    async markAllAsRead(): Promise<MarkReadResponse> {
        const { data } = await axios.post<MarkReadResponse>(
            route('notifications.mark-all-read'),
        );
        return data;
    },

    async deleteNotification(notificationId: string): Promise<MarkReadResponse> {
        const { data } = await axios.delete<MarkReadResponse>(
            route('notifications.destroy', notificationId),
        );
        return data;
    },

    goToNotifications(): void {
        router.visit(route('notifications.index'));
    },
};

export type { NotificationApiResponse, MarkReadResponse };
export default NotificationService;
