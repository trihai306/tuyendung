<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {
    }

    /**
     * Get paginated list of notifications for current user
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getNotifications(
            Auth::id(),
            $request->only(['category', 'is_read', 'per_page'])
        );

        return response()->json([
            'success' => true,
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    /**
     * Get recent notifications for dropdown (limit 5)
     */
    public function recent(): JsonResponse
    {
        $notifications = $this->notificationService->getRecentNotifications(Auth::id());

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount(Auth::id());

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(int $id): JsonResponse
    {
        $this->notificationService->markAsRead($id, Auth::id());

        return response()->json([
            'success' => true,
            'message' => 'Đã đánh dấu đã đọc',
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $this->notificationService->markAllAsRead(Auth::id());

        return response()->json([
            'success' => true,
            'message' => 'Đã đánh dấu tất cả là đã đọc',
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy(int $id): JsonResponse
    {
        $this->notificationService->deleteNotification($id, Auth::id());

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa thông báo',
        ]);
    }
}
