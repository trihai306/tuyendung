<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ZaloAccount;
use App\Models\ZaloGroup;
use App\Services\ZaloService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ZaloController extends Controller
{
    protected ZaloService $zaloService;

    public function __construct(ZaloService $zaloService)
    {
        $this->zaloService = $zaloService;
    }

    /**
     * Get Zalo accounts based on user role:
     * - Owner/Admin: See all company accounts + unassigned accounts
     * - Member: Only see accounts assigned to them (user_id = current user)
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $company = $user->company;

        // Get accounts: either belonging to company OR unassigned (no company_id)
        $query = ZaloAccount::with(['groups', 'user'])
            ->orderBy('created_at', 'desc');

        if ($company) {
            // Check if user is owner or admin
            if ($user->isCompanyAdmin()) {
                // Owner/Admin: Get all company accounts + unassigned accounts
                $query->where(function ($q) use ($company) {
                    $q->where('company_id', $company->id)
                        ->orWhereNull('company_id');
                });
            } else {
                // Member: Only see accounts assigned to them
                $query->where('user_id', $user->id);
            }
        } else {
            // No company - only show unassigned accounts
            $query->whereNull('company_id');
        }

        $accounts = $query->get()->map(function ($account) {
            return [
                'id' => $account->id,
                'own_id' => $account->own_id,
                'display_name' => $account->display_name,
                'phone' => $account->phone,
                'avatar' => $account->avatar,
                'status' => $account->status,
                'company_id' => $account->company_id,
                'user_id' => $account->user_id,
                'user_name' => $account->user?->name,
                'groups' => $account->groups->map(function ($group) {
                    return [
                        'id' => $group->group_id,
                        'name' => $group->name,
                        'member_count' => $group->member_count,
                        'avatar' => $group->avatar,
                        'synced_at' => $group->synced_at?->toISOString(),
                    ];
                }),
                'created_at' => $account->created_at->toISOString(),
                'last_active_at' => $account->last_active_at?->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $accounts,
            'total' => $accounts->count(),
        ]);
    }

    /**
     * Initiate QR login for Zalo (CLI + Soketi based)
     * 
     * Frontend should listen to Soketi channel: zalo-login.{session_id}
     * Events: login.progress with stages: starting, qr_generated, login_success, login_failed
     */
    public function initiateLogin(Request $request): JsonResponse
    {
        $user = Auth::user();
        $sessionId = \Illuminate\Support\Str::uuid()->toString();

        // Store session info for account assignment
        \Illuminate\Support\Facades\Cache::put(
            "zalo_session:{$sessionId}",
            [
                'user_id' => $user->id,
                'company_id' => $user->company_id,
            ],
            now()->addMinutes(5)
        );

        // Dispatch job to handle CLI login with Soketi broadcast
        // Pass user_id so account is assigned to current user
        \App\Jobs\ZaloLoginJob::dispatch($sessionId, $user->company_id, $user->id);

        return response()->json([
            'success' => true,
            'session_id' => $sessionId,
            'channel' => "zalo-login.{$sessionId}",
            'message' => 'Đang khởi tạo mã QR. Vui lòng chờ...',
        ]);
    }

    /**
     * Sync accounts from multizlogin to database
     */
    public function syncAccounts(): JsonResponse
    {
        $company = Auth::user()->company;

        if (!$company) {
            return response()->json(['error' => 'No company found'], 404);
        }

        $synced = $this->zaloService->syncAccountsToDatabase($company->id);

        return response()->json([
            'success' => true,
            'message' => 'Accounts synced successfully',
            'synced_count' => count($synced),
        ]);
    }

    /**
     * Get account details with groups
     */
    public function show(ZaloAccount $zaloAccount): JsonResponse
    {
        $company = Auth::user()->company;

        // Allow access if: unassigned account OR belongs to user's company
        $canAccess = !$zaloAccount->company_id ||
            ($company && $zaloAccount->company_id === $company->id);

        if (!$canAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $zaloAccount->load('groups');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $zaloAccount->id,
                'own_id' => $zaloAccount->own_id,
                'name' => $zaloAccount->display_name,
                'phone' => $zaloAccount->phone,
                'avatar' => $zaloAccount->avatar,
                'status' => $zaloAccount->status,
                'proxy_url' => $zaloAccount->proxy_url,
                'webhook_config' => $zaloAccount->webhook_config,
                'groups' => $zaloAccount->groups,
                'created_at' => $zaloAccount->created_at,
                'last_active' => $zaloAccount->last_active_at,
            ],
        ]);
    }

    /**
     * Sync groups for an account
     */
    public function syncGroups(ZaloAccount $zaloAccount): JsonResponse
    {
        $company = Auth::user()->company;

        // Allow access if:
        // 1. Account has no company (unassigned) - anyone can access
        // 2. Account belongs to user's company
        $canAccess = !$zaloAccount->company_id ||
            ($company && $zaloAccount->company_id === $company->id);

        if (!$canAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $synced = $this->zaloService->syncGroupsForAccount($zaloAccount);

            return response()->json([
                'success' => true,
                'message' => 'Groups synced successfully',
                'synced_count' => count($synced),
                'groups' => $synced,
            ]);
        } catch (\Exception $e) {
            Log::error('Sync groups failed', [
                'account_id' => $zaloAccount->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to sync groups: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Leave a group
     */
    public function leaveGroup(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $company = Auth::user()->company;

        // Allow access if: unassigned account OR belongs to user's company
        $canAccess = !$zaloAccount->company_id ||
            ($company && $zaloAccount->company_id === $company->id);

        if (!$canAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'group_id' => 'required|string',
            'silent' => 'boolean',
        ]);

        try {
            $result = $this->zaloService->leaveGroup(
                $zaloAccount->own_id,
                $request->input('group_id'),
                $request->input('silent', false)
            );

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $result['error'] ?? 'Failed to leave group',
                ], 400);
            }

            // Remove group from database
            ZaloGroup::where('zalo_account_id', $zaloAccount->id)
                ->where('group_id', $request->input('group_id'))
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Left group successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Leave group failed', [
                'account_id' => $zaloAccount->id,
                'group_id' => $request->input('group_id'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to leave group: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**

     * Send message via Zalo account
     */
    public function sendMessage(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $company = Auth::user()->company;

        // Allow access if: unassigned account OR belongs to user's company
        $canAccess = !$zaloAccount->company_id ||
            ($company && $zaloAccount->company_id === $company->id);

        if (!$canAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'thread_id' => 'required|string',
            'message' => 'required|string',
            'type' => 'nullable|in:user,group',
        ]);

        $result = $this->zaloService->sendMessage(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->message,
            $request->type ?? 'user'
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $result['data'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'],
        ], 400);
    }

    /**
     * Configure webhook for an account
     */
    public function configureWebhook(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $company = Auth::user()->company;

        // Allow access if: unassigned account OR belongs to user's company
        $canAccess = !$zaloAccount->company_id ||
            ($company && $zaloAccount->company_id === $company->id);

        if (!$canAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'message_url' => 'nullable|url',
            'group_event_url' => 'nullable|url',
            'reaction_url' => 'nullable|url',
        ]);

        $config = [
            'message_url' => $request->message_url,
            'group_event_url' => $request->group_event_url,
            'reaction_url' => $request->reaction_url,
        ];

        // Note: setWebhook not implemented - webhook config stored locally only
        $zaloAccount->update(['webhook_config' => $config]);

        return response()->json([
            'success' => true,
            'message' => 'Webhook configuration saved',
        ]);
    }

    /**
     * Delete a Zalo account
     */
    public function destroy(ZaloAccount $zaloAccount): JsonResponse
    {
        $company = Auth::user()->company;

        // Allow access if: unassigned account OR belongs to user's company
        $canAccess = !$zaloAccount->company_id ||
            ($company && $zaloAccount->company_id === $company->id);

        if (!$canAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $zaloAccount->delete();

        return response()->json([
            'success' => true,
            'message' => 'Zalo account deleted successfully',
        ]);
    }

    /**
     * Disconnect (logout) a Zalo account without deleting it
     * Only the owner can disconnect their account
     */
    public function disconnect(ZaloAccount $zaloAccount): JsonResponse
    {
        $userId = Auth::id();

        // Only account owner can disconnect
        if ($zaloAccount->user_id !== $userId) {
            return response()->json([
                'success' => false,
                'error' => 'Bạn không có quyền đăng xuất tài khoản này',
            ], 403);
        }

        // Call Zalo service to disconnect
        try {
            $this->zaloService->disconnectAccount($zaloAccount->own_id);
        } catch (\Exception $e) {
            Log::warning('Failed to disconnect Zalo account from service', [
                'account_id' => $zaloAccount->id,
                'error' => $e->getMessage(),
            ]);
            // Continue anyway - we'll mark as disconnected locally
        }

        // Mark account as disconnected
        $zaloAccount->markAsDisconnected();

        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất tài khoản Zalo',
        ]);
    }

    /**
     * Assign a Zalo account to a user (employee)
     */
    public function assignUser(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Update the account with the new user
        $zaloAccount->update([
            'user_id' => $validated['user_id'] ?? null,
            'company_id' => $validated['user_id']
                ? Auth::user()->company_id
                : $zaloAccount->company_id,
        ]);

        $zaloAccount->load('user', 'company');

        return response()->json([
            'success' => true,
            'message' => $validated['user_id']
                ? 'Zalo account assigned to user successfully'
                : 'Zalo account unassigned successfully',
            'data' => [
                'id' => $zaloAccount->id,
                'display_name' => $zaloAccount->display_name,
                'user_id' => $zaloAccount->user_id,
                'user_name' => $zaloAccount->user?->name,
                'company_id' => $zaloAccount->company_id,
            ],
        ]);
    }

    /**
     * Get connection status
     */
    public function status(): JsonResponse
    {
        $status = $this->zaloService->checkStatus();

        return response()->json($status);
    }

    /**
     * Get Zalo conversations (threads) with RBAC:
     * - Owner/Admin: See all company's Zalo account conversations
     * - Member: Only see conversations from accounts assigned to them (user_id = current user)
     */
    public function getConversations(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userId = $user->id;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'error' => 'Not authenticated',
                ], 401);
            }

            // Get user's company and role
            $company = $user->company;
            $role = $user->company_role ?? 'member';
            $isManager = in_array($role, ['owner', 'admin']);

            // Build account query based on role
            if ($isManager && $company) {
                // Managers see all company's Zalo accounts
                $accountIds = \App\Models\ZaloAccount::where('company_id', $company->id)->pluck('id');
            } else {
                // Members only see their assigned accounts
                $accountIds = \App\Models\ZaloAccount::where('user_id', $userId)->pluck('id');
            }

            if ($accountIds->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }

            // Get all threads with last message using subquery + LEFT JOIN to zalo_users
            $threads = \Illuminate\Support\Facades\DB::table('zalo_messages as m')
                ->leftJoin('zalo_users', 'm.sender_id', '=', 'zalo_users.zalo_user_id')
                ->select([
                    'm.thread_id',
                    'm.thread_type',
                    'm.zalo_account_id',
                    'm.content as last_message',
                    'm.received_at as last_message_at',
                    'm.sender_id',
                    'm.sender_name',
                    // Cached profile data from zalo_users
                    'zalo_users.display_name as cached_display_name',
                    'zalo_users.zalo_name as cached_zalo_name',
                    'zalo_users.avatar as cached_avatar',
                ])
                ->whereIn('m.zalo_account_id', $accountIds)
                ->whereRaw('m.id = (
                    SELECT m2.id FROM zalo_messages m2
                    WHERE m2.thread_id = m.thread_id
                    ORDER BY m2.received_at DESC
                    LIMIT 1
                )')
                ->orderByDesc('m.received_at')
                ->paginate($request->integer('per_page', 20));

            // Add resolved names and unread count to each thread
            foreach ($threads as $thread) {
                // Add unread count
                $thread->unread_count = \App\Models\ZaloMessage::where('thread_id', $thread->thread_id)
                    ->where('is_read', false)
                    ->where('direction', 'inbound')
                    ->count();

                // Resolve participant name based on thread type
                if ($thread->thread_type === 'group') {
                    // For groups: lookup name from zalo_groups table
                    $group = \App\Models\ZaloGroup::where('group_id', $thread->thread_id)
                        ->where('zalo_account_id', $thread->zalo_account_id)
                        ->first();
                    $thread->participant_name = $group?->name ?: 'Nhóm chưa đặt tên';
                    $thread->participant_avatar = $group?->avatar;
                } else {
                    // For users: cached display_name > cached zalo_name > original sender_name
                    $thread->participant_name = $thread->cached_display_name
                        ?: $thread->cached_zalo_name
                        ?: $thread->sender_name
                        ?: 'Unknown';
                    $thread->participant_avatar = $thread->cached_avatar;
                }

                // Clean up joined fields
                unset($thread->cached_display_name, $thread->cached_zalo_name, $thread->cached_avatar, $thread->sender_name);
            }

            return response()->json([
                'success' => true,
                'data' => $threads,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('getConversations error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get messages for a specific thread
     * Privacy: Verifies the thread belongs to current user's account
     */
    public function getMessages(Request $request, string $threadId): JsonResponse
    {
        $userId = Auth::id();

        // Find a Zalo account that owns this thread and belongs to current user
        $canAccess = \App\Models\ZaloMessage::query()
            ->where('thread_id', $threadId)
            ->whereHas('zaloAccount', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->exists();

        if (!$canAccess) {
            return response()->json([
                'success' => false,
                'error' => 'Access denied - this conversation does not belong to your account',
            ], 403);
        }

        // Get messages with LEFT JOIN to zalo_users for cached profile data
        $messages = \App\Models\ZaloMessage::query()
            ->leftJoin('zalo_users', 'zalo_messages.sender_id', '=', 'zalo_users.zalo_user_id')
            ->where('zalo_messages.thread_id', $threadId)
            ->orderBy('zalo_messages.received_at', 'desc')
            ->select([
                'zalo_messages.*',
                'zalo_users.display_name as cached_display_name',
                'zalo_users.zalo_name as cached_zalo_name',
                'zalo_users.avatar as cached_avatar',
            ])
            ->paginate($request->integer('per_page', 50));

        // Transform messages to include resolved names
        $messages->getCollection()->transform(function ($message) {
            // Priority: cached display_name > cached zalo_name > original sender_name
            $message->sender_display_name = $message->cached_display_name
                ?: $message->cached_zalo_name
                ?: $message->sender_name
                ?: 'Unknown';
            $message->sender_avatar = $message->cached_avatar;

            // Clean up joined fields
            unset($message->cached_display_name, $message->cached_zalo_name, $message->cached_avatar);

            return $message;
        });

        // Mark messages as read
        \App\Models\ZaloMessage::where('thread_id', $threadId)
            ->where('direction', 'inbound')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * ==========================================
     * EXTENDED FEATURES (CLI Parity)
     * ==========================================
     */

    /**
     * Find user by phone number
     */
    public function findUser(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate(['phone' => 'required|string']);

        $result = $this->zaloService->findUser($zaloAccount->own_id, $request->phone);

        return response()->json($result);
    }

    /**
     * Get friends list
     */
    public function getFriends(ZaloAccount $zaloAccount): JsonResponse
    {
        $result = $this->zaloService->getFriends($zaloAccount->own_id);

        return response()->json($result);
    }

    /**
     * Send friend request
     */
    public function sendFriendRequest(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|string',
            'message' => 'string',
        ]);

        $result = $this->zaloService->sendFriendRequest(
            $zaloAccount->own_id,
            $request->user_id,
            $request->input('message', 'Xin chào!')
        );

        return response()->json($result);
    }

    /**
     * Accept friend request
     */
    public function acceptFriendRequest(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $result = $this->zaloService->acceptFriendRequest($zaloAccount->own_id, $request->user_id);

        return response()->json($result);
    }

    /**
     * Create group
     */
    public function createGroup(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'members' => 'array',
        ]);

        $result = $this->zaloService->createGroup(
            $zaloAccount->own_id,
            $request->name,
            $request->input('members', [])
        );

        return response()->json($result);
    }

    /**
     * Add member to group
     */
    public function addMemberToGroup(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $result = $this->zaloService->addMemberToGroup($zaloAccount->own_id, $groupId, $request->user_id);

        return response()->json($result);
    }

    /**
     * Remove member from group
     */
    public function removeMemberFromGroup(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $result = $this->zaloService->removeMemberFromGroup($zaloAccount->own_id, $groupId, $request->user_id);

        return response()->json($result);
    }

    /**
     * Block user
     */
    public function blockUser(ZaloAccount $zaloAccount, string $userId): JsonResponse
    {
        $result = $this->zaloService->blockUser($zaloAccount->own_id, $userId);

        return response()->json($result);
    }

    /**
     * Unblock user
     */
    public function unblockUser(ZaloAccount $zaloAccount, string $userId): JsonResponse
    {
        $result = $this->zaloService->unblockUser($zaloAccount->own_id, $userId);

        return response()->json($result);
    }

    /**
     * React to message
     */
    public function reactToMessage(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'thread_id' => 'required|string',
            'msg_id' => 'required|string',
            'icon' => 'required|string',
            'type' => 'in:user,group',
        ]);

        $result = $this->zaloService->reactToMessage(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->msg_id,
            $request->icon,
            $request->input('type', 'user')
        );

        return response()->json($result);
    }

    /**
     * Delete message
     */
    public function deleteMessage(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'thread_id' => 'required|string',
            'msg_id' => 'required|string',
            'for_all' => 'boolean',
            'type' => 'in:user,group',
        ]);

        $result = $this->zaloService->deleteMessage(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->msg_id,
            $request->boolean('for_all', false),
            $request->input('type', 'user')
        );

        return response()->json($result);
    }

    /**
     * Send sticker
     */
    public function sendSticker(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'thread_id' => 'required|string',
            'sticker_id' => 'required|string',
            'type' => 'in:user,group',
        ]);

        $result = $this->zaloService->sendSticker(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->sticker_id,
            $request->input('type', 'user')
        );

        return response()->json($result);
    }

    // ===========================================
    // ADDITIONAL FEATURES (Full CLI Parity)
    // ===========================================

    /**
     * Send voice message
     */
    public function sendVoice(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'thread_id' => 'required|string',
            'file_path' => 'required|string',
            'type' => 'in:user,group',
        ]);

        $result = $this->zaloService->sendVoice(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->file_path,
            $request->input('type', 'user')
        );

        return response()->json($result);
    }

    /**
     * Send contact card
     */
    public function sendCard(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'thread_id' => 'required|string',
            'user_id' => 'required|string',
            'phone' => 'required|string',
            'type' => 'in:user,group',
        ]);

        $result = $this->zaloService->sendCard(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->user_id,
            $request->phone,
            $request->input('type', 'user')
        );

        return response()->json($result);
    }

    /**
     * Get user info
     */
    public function getUserInfo(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $result = $this->zaloService->getUserInfo($zaloAccount->own_id, $request->user_id);

        return response()->json($result);
    }

    /**
     * Get group info
     */
    public function getGroupInfo(ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $result = $this->zaloService->getGroupInfo($zaloAccount->own_id, $groupId);

        return response()->json($result);
    }

    /**
     * Rename group
     */
    public function renameGroup(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate(['name' => 'required|string']);

        $result = $this->zaloService->renameGroup($zaloAccount->own_id, $groupId, $request->name);

        return response()->json($result);
    }

    /**
     * Delete group
     */
    public function deleteGroup(ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $result = $this->zaloService->deleteGroup($zaloAccount->own_id, $groupId);

        return response()->json($result);
    }

    /**
     * Promote to admin
     */
    public function promoteToAdmin(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $result = $this->zaloService->promoteToAdmin($zaloAccount->own_id, $groupId, $request->user_id);

        return response()->json($result);
    }

    /**
     * Demote from admin
     */
    public function demoteFromAdmin(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $result = $this->zaloService->demoteFromAdmin($zaloAccount->own_id, $groupId, $request->user_id);

        return response()->json($result);
    }

    /**
     * Transfer ownership
     */
    public function transferOwnership(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $result = $this->zaloService->transferOwnership($zaloAccount->own_id, $groupId, $request->user_id);

        return response()->json($result);
    }

    /**
     * Create poll
     */
    public function createPoll(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate([
            'question' => 'required|string',
            'options' => 'required|array|min:2',
        ]);

        $result = $this->zaloService->createPoll(
            $zaloAccount->own_id,
            $groupId,
            $request->question,
            $request->options,
            $request->only(['expiredTime', 'allowMultiChoices', 'allowAddNewOption', 'isAnonymous', 'isHideVotePreview'])
        );

        return response()->json($result);
    }

    /**
     * Lock poll
     */
    public function lockPoll(Request $request, ZaloAccount $zaloAccount, string $pollId): JsonResponse
    {
        $result = $this->zaloService->lockPoll($zaloAccount->own_id, $pollId);

        return response()->json($result);
    }

    /**
     * Create note
     */
    public function createNote(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
        ]);

        $result = $this->zaloService->createNote(
            $zaloAccount->own_id,
            $groupId,
            $request->title,
            $request->content,
            $request->integer('pin_act', 1)
        );

        return response()->json($result);
    }

    /**
     * Edit note
     */
    public function editNote(Request $request, ZaloAccount $zaloAccount, string $noteId): JsonResponse
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
        ]);

        $result = $this->zaloService->editNote(
            $zaloAccount->own_id,
            $noteId,
            $request->title,
            $request->content,
            $request->integer('pin_act') ?: null
        );

        return response()->json($result);
    }

    /**
     * Get stickers
     */
    public function getStickers(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $result = $this->zaloService->getStickers(
            $zaloAccount->own_id,
            $request->input('keyword', 'hello')
        );

        return response()->json($result);
    }

    /**
     * Get account info
     */
    public function getAccountInfo(ZaloAccount $zaloAccount): JsonResponse
    {
        $result = $this->zaloService->getAccountInfo($zaloAccount->own_id);

        return response()->json($result);
    }

    /**
     * Set alias for user
     */
    public function setAlias(Request $request, ZaloAccount $zaloAccount, string $userId): JsonResponse
    {
        $request->validate(['alias' => 'required|string']);

        $result = $this->zaloService->setAlias($zaloAccount->own_id, $userId, $request->alias);

        return response()->json($result);
    }

    /**
     * Pin/unpin conversation
     */
    public function pinConversation(Request $request, ZaloAccount $zaloAccount, string $threadId): JsonResponse
    {
        $result = $this->zaloService->pinConversation(
            $zaloAccount->own_id,
            $threadId,
            $request->boolean('pinned', true)
        );

        return response()->json($result);
    }

    /**
     * Change group avatar
     */
    public function changeGroupAvatar(Request $request, ZaloAccount $zaloAccount, string $groupId): JsonResponse
    {
        $request->validate(['avatar' => 'required|file|image']);

        $avatarPath = $request->file('avatar')->store('temp/avatars', 'local');
        $fullPath = storage_path('app/' . $avatarPath);

        $result = $this->zaloService->changeGroupAvatar($zaloAccount->own_id, $groupId, $fullPath);

        // Cleanup temp file
        @unlink($fullPath);

        return response()->json($result);
    }

    /**
     * Get sticker pack details
     */
    public function getStickersDetail(ZaloAccount $zaloAccount, string $stickerType): JsonResponse
    {
        $result = $this->zaloService->getStickersDetail($zaloAccount->own_id, $stickerType);

        return response()->json($result);
    }

    /**
     * Send report
     */
    public function sendReport(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'thread_id' => 'required|string',
            'reason' => 'string',
            'type' => 'in:user,group',
        ]);

        $result = $this->zaloService->sendReport(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->input('reason', 'spam'),
            $request->input('type', 'user')
        );

        return response()->json($result);
    }

    /**
     * Undo/recall message
     */
    public function undoMessage(Request $request, ZaloAccount $zaloAccount): JsonResponse
    {
        $request->validate([
            'thread_id' => 'required|string',
            'msg_id' => 'required|string',
            'type' => 'in:user,group',
        ]);

        $result = $this->zaloService->undoMessage(
            $zaloAccount->own_id,
            $request->thread_id,
            $request->msg_id,
            $request->input('type', 'user')
        );

        return response()->json($result);
    }
}


