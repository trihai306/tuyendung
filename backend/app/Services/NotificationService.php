<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    /**
     * Get paginated notifications for user
     */
    public function getNotifications(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Notification::forUser($userId)
            ->orderByDesc('created_at');

        if (!empty($filters['category'])) {
            $query->ofCategory($filters['category']);
        }

        if (isset($filters['is_read'])) {
            $query->where('is_read', $filters['is_read']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Get recent notifications for dropdown
     */
    public function getRecentNotifications(int $userId, int $limit = 5): Collection
    {
        return Notification::forUser($userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::forUser($userId)
            ->unread()
            ->count();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId, int $userId): Notification
    {
        $notification = Notification::forUser($userId)->findOrFail($notificationId);
        $notification->markAsRead();

        return $notification;
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(int $userId): int
    {
        return Notification::forUser($userId)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Delete notification
     */
    public function deleteNotification(int $notificationId, int $userId): bool
    {
        $notification = Notification::forUser($userId)->findOrFail($notificationId);

        return $notification->delete();
    }
}
