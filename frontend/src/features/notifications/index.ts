// Notifications Feature Module
export { NotificationsPage } from './NotificationsPage';
export { NotificationDropdown } from './NotificationDropdown';
export {
    notificationsApi,
    useGetNotificationsQuery,
    useGetRecentNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} from './notificationsApi';
export type { AppNotification } from './notificationsApi';
