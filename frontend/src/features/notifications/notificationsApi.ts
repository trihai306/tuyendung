import { api } from '../../services/api';

export interface AppNotification {
    id: number;
    user_id: number;
    company_id: number | null;
    type: 'info' | 'warning' | 'success' | 'error';
    category: 'system' | 'zalo' | 'recruiting' | 'company';
    title: string;
    message: string;
    link: string | null;
    data: Record<string, unknown> | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationsResponse {
    success: boolean;
    data: AppNotification[];
    meta?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        count: number;
    };
}

export const notificationsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationsResponse, { page?: number; per_page?: number; category?: string; is_read?: boolean } | void>({
            query: (params) => ({
                url: '/notifications',
                method: 'GET',
                params: params || {},
            }),
            providesTags: ['Notification'],
        }),

        getRecentNotifications: builder.query<NotificationsResponse, void>({
            query: () => ({
                url: '/notifications/recent',
                method: 'GET',
            }),
            providesTags: ['Notification'],
        }),

        getUnreadCount: builder.query<UnreadCountResponse, void>({
            query: () => ({
                url: '/notifications/unread-count',
                method: 'GET',
            }),
            providesTags: ['Notification'],
        }),

        markAsRead: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'POST',
            }),
            invalidatesTags: ['Notification'],
        }),

        markAllAsRead: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'POST',
            }),
            invalidatesTags: ['Notification'],
        }),

        deleteNotification: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetRecentNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} = notificationsApi;
