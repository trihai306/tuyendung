<?php

namespace App\Services;

use App\Models\AgentTask;
use App\Models\ZaloAccount;
use App\Models\ZaloGroup;
use App\Models\ZaloUser;
use App\Events\AgentTaskDispatched;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * ZaloService - Agent Bridge Dispatcher
 * 
 * All Zalo operations are dispatched to the client-side Automation app 
 * via Soketi (Pusher protocol). The automation app executes using zca-js
 * and returns results via HTTP callback.
 * 
 * Flow: Backend → AgentTask → Soketi → Automation App → zca-js → Result callback
 */
class ZaloService
{
    /**
     * Default timeout waiting for agent response (seconds)
     */
    protected int $timeout = 30;

    /**
     * Dispatch a Zalo command to the automation agent and wait for result
     * 
     * @param string $action Zalo action (send_message, get_groups, etc.)
     * @param array $params Action parameters
     * @param int|null $companyId Company context (optional)
     * @return array{success: bool, data?: mixed, error?: string}
     */
    public function dispatchCommand(string $action, array $params = [], ?int $companyId = null): array
    {
        try {
            $taskId = (string) Str::uuid();

            $task = AgentTask::create([
                'type' => 'zalo_command',
                'payload' => array_merge(['action' => $action], $params),
                'status' => 'pending',
                'company_id' => $companyId,
                'callback_url' => url('/api/agent/task-result'),
            ]);

            // Broadcast to automation app via Soketi
            event(new AgentTaskDispatched($task));
            $task->markAsDispatched();

            // Wait for result (polling cache key set by callback)
            $cacheKey = "agent_task_result:{$task->id}";
            $maxWait = $this->timeout;
            $waited = 0;
            $pollInterval = 500000; // 0.5 second in microseconds

            while ($waited < $maxWait) {
                usleep($pollInterval);
                $waited += 0.5;

                $result = Cache::get($cacheKey);
                if ($result !== null) {
                    Cache::forget($cacheKey);
                    return $result;
                }

                // Check if task completed in DB
                $task->refresh();
                if (in_array($task->status, ['completed', 'failed'])) {
                    $taskResult = $task->result ?? [];
                    return [
                        'success' => $task->status === 'completed',
                        'data' => $taskResult['data'] ?? null,
                        'error' => $taskResult['error'] ?? null,
                    ];
                }
            }

            // Timeout - agent may not be connected
            Log::warning("ZaloService: Task timeout", ['task_id' => $task->id, 'action' => $action]);
            return [
                'success' => false,
                'error' => 'Agent timeout - automation app may not be running',
            ];
        } catch (\Exception $e) {
            Log::error("ZaloService dispatch error", ['action' => $action, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Execute command with credentials from DB
     */
    protected function executeWithCredentials(string $action, string $ownId, array $params = []): array
    {
        $account = ZaloAccount::where('own_id', $ownId)->first();

        if (!$account || empty($account->credentials)) {
            return ['success' => false, 'error' => "No credentials for account {$ownId}"];
        }

        $params['ownId'] = $ownId;
        $params['credentials'] = $account->credentials;

        return $this->dispatchCommand($action, $params, $account->company_id);
    }

    // ===========================================
    // MESSAGING
    // ===========================================

    public function sendMessage(string $ownId, string $threadId, string $message, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send_message', $ownId, [
            'threadId' => $threadId,
            'message' => $message,
            'type' => $type,
        ]);
    }

    public function sendSticker(string $ownId, string $threadId, string $stickerId, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send_sticker', $ownId, [
            'threadId' => $threadId,
            'stickerId' => $stickerId,
            'type' => $type,
        ]);
    }

    public function sendVoice(string $ownId, string $threadId, string $filePath, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send_voice', $ownId, [
            'threadId' => $threadId,
            'filePath' => $filePath,
            'type' => $type,
        ]);
    }

    public function sendFile(string $ownId, string $threadId, string $filePath, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send_file', $ownId, [
            'threadId' => $threadId,
            'filePath' => $filePath,
            'type' => $type,
        ]);
    }

    public function sendCard(string $ownId, string $threadId, string $userId, string $phone, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send_card', $ownId, [
            'threadId' => $threadId,
            'userId' => $userId,
            'phone' => $phone,
            'type' => $type,
        ]);
    }

    public function reactToMessage(string $ownId, string $threadId, string $msgId, string $icon, string $type = 'user'): array
    {
        return $this->executeWithCredentials('react', $ownId, [
            'threadId' => $threadId,
            'msgId' => $msgId,
            'icon' => $icon,
            'type' => $type,
        ]);
    }

    public function deleteMessage(string $ownId, string $threadId, string $msgId, bool $forAll = false, string $type = 'user'): array
    {
        return $this->executeWithCredentials('delete_message', $ownId, [
            'threadId' => $threadId,
            'msgId' => $msgId,
            'forAll' => $forAll,
            'type' => $type,
        ]);
    }

    // ===========================================
    // ACCOUNT & USER
    // ===========================================

    public function getAccountInfo(string $ownId): array
    {
        return $this->executeWithCredentials('account_info', $ownId);
    }

    public function getUserInfo(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('user_info', $ownId, [
            'userId' => $userId,
        ]);
    }

    public function findUser(string $ownId, string $phone): array
    {
        return $this->executeWithCredentials('find_user', $ownId, [
            'phone' => $phone,
        ]);
    }

    public function setAlias(string $ownId, string $userId, string $alias): array
    {
        return $this->executeWithCredentials('set_alias', $ownId, [
            'userId' => $userId,
            'alias' => $alias,
        ]);
    }

    public function pinConversation(string $ownId, string $threadId, bool $pinned = true): array
    {
        return $this->executeWithCredentials('pin', $ownId, [
            'threadId' => $threadId,
            'pin' => $pinned,
        ]);
    }

    // ===========================================
    // FRIENDS
    // ===========================================

    public function getFriends(string $ownId): array
    {
        return $this->executeWithCredentials('get_friends', $ownId);
    }

    public function sendFriendRequest(string $ownId, string $userId, string $message = 'Xin chào!'): array
    {
        return $this->executeWithCredentials('add_friend', $ownId, [
            'userId' => $userId,
            'message' => $message,
        ]);
    }

    public function acceptFriendRequest(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('accept_friend', $ownId, [
            'userId' => $userId,
        ]);
    }

    public function blockUser(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('block', $ownId, [
            'userId' => $userId,
        ]);
    }

    public function unblockUser(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('unblock', $ownId, [
            'userId' => $userId,
        ]);
    }

    // ===========================================
    // GROUPS
    // ===========================================

    public function getGroups(string $ownId): array
    {
        $result = $this->executeWithCredentials('get_groups', $ownId);
        if ($result['success'] && isset($result['data']['groups'])) {
            return $result['data']['groups'];
        }
        return $result['success'] ? ($result['data'] ?? []) : [];
    }

    public function getGroupInfo(string $ownId, string $groupId): array
    {
        return $this->executeWithCredentials('group_info', $ownId, [
            'groupId' => $groupId,
        ]);
    }

    public function createGroup(string $ownId, string $name, array $members = []): array
    {
        return $this->executeWithCredentials('create_group', $ownId, [
            'name' => $name,
            'members' => $members,
        ]);
    }

    public function renameGroup(string $ownId, string $groupId, string $name): array
    {
        return $this->executeWithCredentials('rename_group', $ownId, [
            'groupId' => $groupId,
            'name' => $name,
        ]);
    }

    public function deleteGroup(string $ownId, string $groupId): array
    {
        return $this->executeWithCredentials('delete_group', $ownId, [
            'groupId' => $groupId,
        ]);
    }

    public function addMemberToGroup(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('add_to_group', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    public function leaveGroup(string $ownId, string $groupId, bool $silent = false): array
    {
        return $this->executeWithCredentials('leave_group', $ownId, [
            'groupId' => $groupId,
            'silent' => $silent,
        ]);
    }

    public function removeMemberFromGroup(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('remove_from_group', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    public function promoteToAdmin(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('promote', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    public function demoteFromAdmin(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('demote', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    public function transferOwnership(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('transfer_owner', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    // ===========================================
    // POLLS & NOTES
    // ===========================================

    public function createPoll(string $ownId, string $groupId, string $question, array $options, array $settings = []): array
    {
        return $this->executeWithCredentials('create_poll', $ownId, array_merge([
            'groupId' => $groupId,
            'question' => $question,
            'options' => $options,
        ], $settings));
    }

    public function lockPoll(string $ownId, string $pollId): array
    {
        return $this->executeWithCredentials('lock_poll', $ownId, [
            'pollId' => $pollId,
        ]);
    }

    public function createNote(string $ownId, string $groupId, string $title, string $content, int $pinAct = 1): array
    {
        return $this->executeWithCredentials('create_note', $ownId, [
            'groupId' => $groupId,
            'title' => $title,
            'content' => $content,
            'pinAct' => $pinAct,
        ]);
    }

    public function editNote(string $ownId, string $noteId, string $title, string $content, ?int $pinAct = null): array
    {
        $args = ['noteId' => $noteId, 'title' => $title, 'content' => $content];
        if ($pinAct !== null)
            $args['pinAct'] = $pinAct;
        return $this->executeWithCredentials('edit_note', $ownId, $args);
    }

    // ===========================================
    // STICKERS
    // ===========================================

    public function getStickers(string $ownId, string $keyword = 'hello'): array
    {
        return $this->executeWithCredentials('stickers', $ownId, [
            'keyword' => $keyword,
        ]);
    }

    public function getStickersDetail(string $ownId, string $stickerType): array
    {
        return $this->executeWithCredentials('stickers_detail', $ownId, [
            'type' => $stickerType,
        ]);
    }

    // ===========================================
    // EXTENDED
    // ===========================================

    public function changeGroupAvatar(string $ownId, string $groupId, string $avatarPath): array
    {
        return $this->executeWithCredentials('change_group_avatar', $ownId, [
            'group' => $groupId,
            'file' => $avatarPath,
        ]);
    }

    public function sendReport(string $ownId, string $threadId, string $reason = 'spam', string $type = 'user'): array
    {
        return $this->executeWithCredentials('send_report', $ownId, [
            'thread' => $threadId,
            'reason' => $reason,
            'type' => $type,
        ]);
    }

    public function undoMessage(string $ownId, string $threadId, string $msgId, string $type = 'user'): array
    {
        return $this->executeWithCredentials('undo', $ownId, [
            'thread' => $threadId,
            'msgId' => $msgId,
            'type' => $type,
        ]);
    }

    // ===========================================
    // DATABASE SYNC (still runs on backend)
    // ===========================================

    public function syncGroupsForAccount(ZaloAccount $account): array
    {
        $groups = $this->getGroups($account->own_id);
        $synced = [];

        foreach ($groups as $group) {
            $zaloGroup = ZaloGroup::updateOrCreate(
                [
                    'zalo_account_id' => $account->id,
                    'group_id' => $group['id'],
                ],
                [
                    'name' => $group['name'] ?? 'Unknown Group',
                    'member_count' => $group['memberCount'] ?? 0,
                    'avatar' => $group['avatar'] ?? null,
                ]
            );

            $synced[] = $zaloGroup;
        }

        return $synced;
    }

    // ===========================================
    // USER CACHING (still runs on backend)
    // ===========================================

    public function fetchAndCacheUserProfile(string $ownId, string $zaloUserId, bool $forceRefresh = false): ?ZaloUser
    {
        $cachedUser = ZaloUser::where('zalo_user_id', $zaloUserId)->first();

        if ($cachedUser && !$forceRefresh && !$cachedUser->isStale()) {
            return $cachedUser;
        }

        $result = $this->getUserInfo($ownId, $zaloUserId);

        if (!$result['success'] || empty($result['data'])) {
            return $cachedUser;
        }

        $data = $result['data'];
        $profileData = $data['changed_profiles'][$zaloUserId] ?? null;

        if (!$profileData)
            return $cachedUser;

        return ZaloUser::updateFromApiResponse($zaloUserId, $profileData);
    }

    public function getCachedUserInfo(string $ownId, string $zaloUserId): array
    {
        $user = $this->fetchAndCacheUserProfile($ownId, $zaloUserId);

        return [
            'display_name' => $user?->display_name ?? 'Unknown',
            'avatar' => $user?->avatar ?? null,
            'zalo_name' => $user?->zalo_name ?? null,
        ];
    }
}
