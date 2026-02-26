<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {
    }

    /**
     * Display notification listing page.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $filter = $request->input('filter');
        $notifications = $this->notificationService->getForUser($user, 15, $filter);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filter' => $filter ?? 'all',
            'unreadCount' => $this->notificationService->getUnreadCount($user),
        ]);
    }

    /**
     * API endpoint for header dropdown -- returns recent notifications.
     */
    public function apiIndex(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $recent = $this->notificationService->getRecent($user, 10);
        $unreadCount = $this->notificationService->getUnreadCount($user);

        return response()->json([
            'notifications' => $recent,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $success = $this->notificationService->markAsRead($user, $notification);

        if (!$success) {
            return response()->json(['message' => 'Khong tim thay thong bao'], 404);
        }

        return response()->json([
            'message' => 'Da danh dau da doc',
            'unread_count' => $this->notificationService->getUnreadCount($user),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $count = $this->notificationService->markAllAsRead($user);

        return response()->json([
            'message' => "Da danh dau {$count} thong bao da doc",
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $notification): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $success = $this->notificationService->destroy($user, $notification);

        if (!$success) {
            return response()->json(['message' => 'Khong tim thay thong bao'], 404);
        }

        return response()->json([
            'message' => 'Da xoa thong bao',
            'unread_count' => $this->notificationService->getUnreadCount($user),
        ]);
    }
}
