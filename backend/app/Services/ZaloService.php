<?php

namespace App\Services;

use App\Models\ZaloAccount;
use App\Models\ZaloGroup;
use App\Models\ZaloUser;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * ZaloService - CLI Bridge
 * 
 * All operations use CLI commands with credentials from DB
 * CLI Path: ../zalo-service/cli/index.js
 */
class ZaloService
{
    protected string $cliPath;

    public function __construct()
    {
        // CLI path - use env variable (Docker) or fallback to relative path (local)
        $this->cliPath = env('ZALO_CLI_PATH', base_path('../zalo-service/cli/index.js'));
    }

    /**
     * Get credentials from database for an account
     * Returns JSON string for CLI --credentials argument
     */
    public function getCredentials(string $ownId): ?string
    {
        $account = ZaloAccount::where('own_id', $ownId)->first();

        if (!$account || empty($account->credentials)) {
            Log::warning("ZaloService: No credentials found for account", ['ownId' => $ownId]);
            return null;
        }

        return json_encode($account->credentials);
    }

    /**
     * Execute CLI command and return parsed JSON result
     * 
     * @param string $command CLI command name (e.g., 'send', 'groups')
     * @param array $args Arguments as key => value pairs
     * @return array{success: bool, data?: mixed, error?: string}
     */
    public function executeCliCommand(string $command, array $args = []): array
    {
        try {
            // Build command arguments
            $argString = '';
            foreach ($args as $key => $value) {
                if (is_bool($value)) {
                    if ($value)
                        $argString .= " --{$key}";
                } elseif (is_array($value)) {
                    $argString .= " --{$key}=" . escapeshellarg(json_encode($value));
                } else {
                    $argString .= " --{$key}=" . escapeshellarg((string) $value);
                }
            }

            $fullCommand = "node {$this->cliPath} {$command}{$argString}";

            Log::debug("ZaloService CLI: {$fullCommand}");

            $result = Process::timeout(30)->run($fullCommand);

            if (!$result->successful()) {
                $errorOutput = $result->errorOutput() ?: $result->output();
                Log::error("ZaloService CLI failed", [
                    'command' => $command,
                    'error' => $errorOutput,
                    'exitCode' => $result->exitCode()
                ]);

                // Try to parse error output as JSON
                $parsed = json_decode($errorOutput, true);
                return [
                    'success' => false,
                    'error' => $parsed['error'] ?? $errorOutput,
                ];
            }

            $output = trim($result->output());
            $parsed = json_decode($output, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return [
                    'success' => false,
                    'error' => 'Invalid JSON response: ' . $output,
                ];
            }

            return [
                'success' => true,
                'data' => $parsed['data'] ?? $parsed,
            ];

        } catch (\Exception $e) {
            Log::error("ZaloService CLI exception", [
                'command' => $command,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Execute CLI command with credentials from DB
     */
    protected function executeWithCredentials(string $command, string $ownId, array $args = []): array
    {
        $credentials = $this->getCredentials($ownId);
        if (!$credentials) {
            return [
                'success' => false,
                'error' => "No credentials found for account {$ownId}",
            ];
        }

        $args['account'] = $ownId;
        $args['credentials'] = $credentials;

        return $this->executeCliCommand($command, $args);
    }

    // ===========================================
    // MESSAGING
    // ===========================================

    /**
     * Send message to user or group
     */
    public function sendMessage(string $ownId, string $threadId, string $message, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send', $ownId, [
            'to' => $threadId,
            'message' => $message,
            'type' => $type,
        ]);
    }

    /**
     * Send sticker
     */
    public function sendSticker(string $ownId, string $threadId, string $stickerId, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send-sticker', $ownId, [
            'to' => $threadId,
            'sticker' => $stickerId,
            'type' => $type,
        ]);
    }

    /**
     * Send voice message
     */
    public function sendVoice(string $ownId, string $threadId, string $filePath, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send-voice', $ownId, [
            'to' => $threadId,
            'file' => $filePath,
            'type' => $type,
        ]);
    }

    /**
     * Send file
     */
    public function sendFile(string $ownId, string $threadId, string $filePath, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send-file', $ownId, [
            'to' => $threadId,
            'file' => $filePath,
            'type' => $type,
        ]);
    }

    /**
     * Send contact card
     */
    public function sendCard(string $ownId, string $threadId, string $userId, string $phone, string $type = 'user'): array
    {
        return $this->executeWithCredentials('send-card', $ownId, [
            'to' => $threadId,
            'userId' => $userId,
            'phone' => $phone,
            'type' => $type,
        ]);
    }

    /**
     * React to message
     */
    public function reactToMessage(string $ownId, string $threadId, string $msgId, string $icon, string $type = 'user'): array
    {
        return $this->executeWithCredentials('react', $ownId, [
            'thread' => $threadId,
            'msgId' => $msgId,
            'icon' => $icon,
            'type' => $type,
        ]);
    }

    /**
     * Delete message
     */
    public function deleteMessage(string $ownId, string $threadId, string $msgId, bool $forAll = false, string $type = 'user'): array
    {
        return $this->executeWithCredentials('delete-message', $ownId, [
            'thread' => $threadId,
            'msgId' => $msgId,
            'forAll' => $forAll,
            'type' => $type,
        ]);
    }

    // ===========================================
    // ACCOUNT & USER
    // ===========================================

    /**
     * Get account info
     */
    public function getAccountInfo(string $ownId): array
    {
        return $this->executeWithCredentials('account-info', $ownId);
    }

    /**
     * Get user info
     */
    public function getUserInfo(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('user-info', $ownId, [
            'userId' => $userId,
        ]);
    }

    /**
     * Find user by phone
     */
    public function findUser(string $ownId, string $phone): array
    {
        return $this->executeWithCredentials('find-user', $ownId, [
            'phone' => $phone,
        ]);
    }

    /**
     * Set alias for user
     */
    public function setAlias(string $ownId, string $userId, string $alias): array
    {
        return $this->executeWithCredentials('set-alias', $ownId, [
            'userId' => $userId,
            'alias' => $alias,
        ]);
    }

    /**
     * Pin conversation
     */
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

    /**
     * Get friends list
     */
    public function getFriends(string $ownId): array
    {
        return $this->executeWithCredentials('friends', $ownId);
    }

    /**
     * Send friend request
     */
    public function sendFriendRequest(string $ownId, string $userId, string $message = 'Xin chào!'): array
    {
        return $this->executeWithCredentials('add-friend', $ownId, [
            'userId' => $userId,
            'message' => $message,
        ]);
    }

    /**
     * Accept friend request
     */
    public function acceptFriendRequest(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('accept-friend', $ownId, [
            'userId' => $userId,
        ]);
    }

    /**
     * Block user
     */
    public function blockUser(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('block', $ownId, [
            'userId' => $userId,
        ]);
    }

    /**
     * Unblock user
     */
    public function unblockUser(string $ownId, string $userId): array
    {
        return $this->executeWithCredentials('unblock', $ownId, [
            'userId' => $userId,
        ]);
    }

    // ===========================================
    // GROUPS
    // ===========================================

    /**
     * Get groups
     */
    public function getGroups(string $ownId): array
    {
        $result = $this->executeWithCredentials('groups', $ownId);
        return $result['success'] ? ($result['data'] ?? []) : [];
    }

    /**
     * Get group info
     */
    public function getGroupInfo(string $ownId, string $groupId): array
    {
        return $this->executeWithCredentials('group-info', $ownId, [
            'groupId' => $groupId,
        ]);
    }

    /**
     * Create group
     */
    public function createGroup(string $ownId, string $name, array $members = []): array
    {
        return $this->executeWithCredentials('create-group', $ownId, [
            'name' => $name,
            'members' => $members,
        ]);
    }

    /**
     * Rename group
     */
    public function renameGroup(string $ownId, string $groupId, string $name): array
    {
        return $this->executeWithCredentials('rename-group', $ownId, [
            'groupId' => $groupId,
            'name' => $name,
        ]);
    }

    /**
     * Delete group
     */
    public function deleteGroup(string $ownId, string $groupId): array
    {
        return $this->executeWithCredentials('delete-group', $ownId, [
            'groupId' => $groupId,
        ]);
    }

    /**
     * Add member to group
     */
    public function addMemberToGroup(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('add-to-group', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    /**
     * Remove member from group
     */
    public function removeMemberFromGroup(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('remove-from-group', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    /**
     * Promote to admin
     */
    public function promoteToAdmin(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('promote', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    /**
     * Demote from admin
     */
    public function demoteFromAdmin(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('demote', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    /**
     * Transfer ownership
     */
    public function transferOwnership(string $ownId, string $groupId, string $userId): array
    {
        return $this->executeWithCredentials('transfer-owner', $ownId, [
            'groupId' => $groupId,
            'userId' => $userId,
        ]);
    }

    // ===========================================
    // POLLS & NOTES
    // ===========================================

    /**
     * Create poll
     */
    public function createPoll(string $ownId, string $groupId, string $question, array $options, array $settings = []): array
    {
        return $this->executeWithCredentials('create-poll', $ownId, array_merge([
            'groupId' => $groupId,
            'question' => $question,
            'options' => $options,
        ], $settings));
    }

    /**
     * Lock poll
     */
    public function lockPoll(string $ownId, string $pollId): array
    {
        return $this->executeWithCredentials('lock-poll', $ownId, [
            'pollId' => $pollId,
        ]);
    }

    /**
     * Create note
     */
    public function createNote(string $ownId, string $groupId, string $title, string $content, int $pinAct = 1): array
    {
        return $this->executeWithCredentials('create-note', $ownId, [
            'groupId' => $groupId,
            'title' => $title,
            'content' => $content,
            'pinAct' => $pinAct,
        ]);
    }

    /**
     * Edit note
     */
    public function editNote(string $ownId, string $noteId, string $title, string $content, ?int $pinAct = null): array
    {
        $args = [
            'noteId' => $noteId,
            'title' => $title,
            'content' => $content,
        ];
        if ($pinAct !== null) {
            $args['pinAct'] = $pinAct;
        }
        return $this->executeWithCredentials('edit-note', $ownId, $args);
    }

    // ===========================================
    // STICKERS
    // ===========================================

    /**
     * Get stickers
     */
    public function getStickers(string $ownId, string $keyword = 'hello'): array
    {
        return $this->executeWithCredentials('stickers', $ownId, [
            'keyword' => $keyword,
        ]);
    }

    // ===========================================
    // DATABASE SYNC
    // ===========================================

    /**
     * Sync groups for an account
     */
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
    // USER CACHING
    // ===========================================

    /**
     * Fetch user profile and cache in database
     */
    public function fetchAndCacheUserProfile(string $ownId, string $zaloUserId, bool $forceRefresh = false): ?ZaloUser
    {
        // Check cache first
        $cachedUser = ZaloUser::where('zalo_user_id', $zaloUserId)->first();

        if ($cachedUser && !$forceRefresh && !$cachedUser->isStale()) {
            return $cachedUser;
        }

        // Fetch from API
        $result = $this->getUserInfo($ownId, $zaloUserId);

        if (!$result['success'] || empty($result['data'])) {
            Log::warning("Failed to fetch Zalo user info", [
                'userId' => $zaloUserId,
                'error' => $result['error'] ?? 'Unknown'
            ]);
            return $cachedUser; // Return stale cache if available
        }

        // Parse API response - user info is in changed_profiles
        $data = $result['data'];
        $profileData = $data['changed_profiles'][$zaloUserId] ?? null;

        if (!$profileData) {
            return $cachedUser;
        }

        // Update cache
        return ZaloUser::updateFromApiResponse($zaloUserId, $profileData);
    }

    /**
     * Get cached user info or fetch if not available
     */
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
