<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get paginated list of notifications for current user
     */
    public function index(Request $request): JsonResponse
    {
        $query = Notification::forUser(Auth::id())
            ->orderByDesc('created_at');

        // Filter by category
        if ($request->filled('category')) {
            $query->ofCategory($request->input('category'));
        }

        // Filter by read status
        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        $notifications = $query->paginate($request->integer('per_page', 20));

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
        $notifications = Notification::forUser(Auth::id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

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
        $count = Notification::forUser(Auth::id())
            ->unread()
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $count,
            ],
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(int $id): JsonResponse
    {
        $notification = Notification::forUser(Auth::id())
            ->findOrFail($id);

        $notification->markAsRead();

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
        Notification::forUser(Auth::id())
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

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
        $notification = Notification::forUser(Auth::id())
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa thông báo',
        ]);
    }
}
