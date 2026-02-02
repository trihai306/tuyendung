<?php

namespace App\Services;

use App\Models\ZaloAccount;
use App\Models\ZaloGroup;
use App\Models\ZaloUser;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * ZaloService - Hybrid Bridge (CLI + HTTP fallback)
 * 
 * Primary: CLI commands for operations (no HTTP server needed)
 * Fallback: HTTP for legacy/special operations
 * 
 * CLI Path: ../zalo-service/cli/index.js
 */
class ZaloService
{
    protected string $baseUrl;
    protected string $cliPath;

    public function __construct()
    {
        // HTTP fallback URL (Docker internal network)
        $this->baseUrl = config('services.zalo.base_url', 'http://zalo:3001');

        // CLI path - use env variable (Docker) or fallback to relative path (local)
        $this->cliPath = env('ZALO_CLI_PATH', base_path('../zalo-service/cli/index.js'));
    }

    /**
     * Execute CLI command and return parsed JSON result
     * 
     * @param string $command CLI command name (e.g., 'send', 'accounts')
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
     * Get HTTP client with default headers
     */
    protected function client()
    {
        return Http::baseUrl($this->baseUrl)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->timeout(30);
    }

    /**
     * Initiate QR login process
     */
    public function initiateQrLogin(?string $proxyUrl = null): array
    {
        try {
            $response = $this->client()->post('/api/login', [
                'proxy' => $proxyUrl,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'qr_code' => $response->json('qrCode'),
                    'session_id' => $response->json('sessionId'),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json('error', 'Failed to initiate login'),
            ];
        } catch (\Exception $e) {
            Log::error('ZaloService::initiateQrLogin failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all logged-in accounts (CLI-based)
     */
    public function getAccounts(): array
    {
        $result = $this->executeCliCommand('accounts');
        return $result['success'] ? ($result['data'] ?? []) : [];
    }

    /**
     * Get account details by ownId
     */
    public function getAccountDetails(string $ownId): ?array
    {
        try {
            $response = $this->client()->get("/api/accounts/{$ownId}");

            if ($response->successful()) {
                return $response->json('data');
            }

            return null;
        } catch (\Exception $e) {
            Log::error('ZaloService::getAccountDetails failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Check service status
     */
    public function checkStatus(): array
    {
        try {
            $response = $this->client()->get('/health');

            if ($response->successful()) {
                return $response->json();
            }

            return ['connected' => false];
        } catch (\Exception $e) {
            return ['connected' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send message to user or group (CLI-based)
     */
    public function sendMessage(string $ownId, string $threadId, string $message, string $type = 'user'): array
    {
        return $this->executeCliCommand('send', [
            'account' => $ownId,
            'to' => $threadId,
            'message' => $message,
            'type' => $type,
        ]);
    }

    /**
     * Get groups for an account
     */
    public function getGroups(string $ownId): array
    {
        try {
            $response = $this->client()->get("/api/accounts/{$ownId}/groups");

            if ($response->successful()) {
                return $response->json('data', []);
            }

            return [];
        } catch (\Exception $e) {
            Log::error('ZaloService::getGroups failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Disconnect (logout) a Zalo account
     */
    public function disconnectAccount(string $ownId): array
    {
        try {
            $response = $this->client()->post("/api/accounts/{$ownId}/disconnect");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json('data'),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json('error', 'Failed to disconnect'),
            ];
        } catch (\Exception $e) {
            Log::error('ZaloService::disconnectAccount failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Sync accounts to database
     */
    public function syncAccountsToDatabase(int $companyId): array
    {
        $accounts = $this->getAccounts();
        $synced = [];

        foreach ($accounts as $account) {
            $zaloAccount = ZaloAccount::updateOrCreate(
                ['own_id' => $account['ownId']],
                [
                    'company_id' => $companyId,
                    'display_name' => $account['displayName'] ?? 'Unknown',
                    'phone' => $account['phone'] ?? null,
                    'avatar' => $account['avatar'] ?? null,
                    'is_connected' => $account['isOnline'] ?? false,
                ]
            );

            $synced[] = $zaloAccount;
        }

        return $synced;
    }

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

    /**
     * ==========================================
     * EXTENDED FEATURES (CLI Parity)
     * All methods require ownId to select account
     * ==========================================
     */

    /**
     * Find user by phone number
     */
    public function findUser(string $ownId, string $phone): array
    {
        return $this->makeRequest('post', '/api/find-user', [
            'ownId' => $ownId,
            'phone' => $phone
        ]);
    }

    /**
     * Get all friends for account
     */
    public function getFriends(string $ownId): array
    {
        return $this->makeRequest('get', "/api/accounts/{$ownId}/friends");
    }

    /**
     * Send friend request
     */
    public function sendFriendRequest(string $ownId, string $userId, string $message = 'Xin chào!'): array
    {
        return $this->makeRequest('post', '/api/friends/add', [
            'ownId' => $ownId,
            'userId' => $userId,
            'message' => $message
        ]);
    }

    /**
     * Accept friend request
     */
    public function acceptFriendRequest(string $ownId, string $userId): array
    {
        return $this->makeRequest('post', '/api/friends/accept', [
            'ownId' => $ownId,
            'userId' => $userId
        ]);
    }

    /**
     * Create group
     */
    public function createGroup(string $ownId, string $name, array $members = []): array
    {
        return $this->makeRequest('post', '/api/groups/create', [
            'ownId' => $ownId,
            'name' => $name,
            'members' => $members
        ]);
    }

    /**
     * Add member to group
     */
    public function addMemberToGroup(string $ownId, string $groupId, string $userId): array
    {
        return $this->makeRequest('post', "/api/groups/{$groupId}/add", [
            'ownId' => $ownId,
            'userId' => $userId
        ]);
    }

    /**
     * Remove member from group
     */
    public function removeMemberFromGroup(string $ownId, string $groupId, string $userId): array
    {
        return $this->makeRequest('post', "/api/groups/{$groupId}/remove", [
            'ownId' => $ownId,
            'userId' => $userId
        ]);
    }

    /**
     * Block user
     */
    public function blockUser(string $ownId, string $userId): array
    {
        return $this->makeRequest('post', "/api/users/{$userId}/block", [
            'ownId' => $ownId,
            'block' => true
        ]);
    }

    /**
     * Unblock user
     */
    public function unblockUser(string $ownId, string $userId): array
    {
        return $this->makeRequest('post', "/api/users/{$userId}/block", [
            'ownId' => $ownId,
            'block' => false
        ]);
    }

    /**
     * React to message
     */
    public function reactToMessage(string $ownId, string $threadId, string $msgId, string $icon, string $type = 'user'): array
    {
        return $this->makeRequest('post', '/api/react', [
            'ownId' => $ownId,
            'threadId' => $threadId,
            'msgId' => $msgId,
            'icon' => $icon,
            'type' => $type
        ]);
    }

    /**
     * Delete message
     */
    public function deleteMessage(string $ownId, string $threadId, string $msgId, bool $forAll = false, string $type = 'user'): array
    {
        return $this->makeRequest('post', '/api/delete-message', [
            'ownId' => $ownId,
            'threadId' => $threadId,
            'msgId' => $msgId,
            'forAll' => $forAll,
            'type' => $type
        ]);
    }

    /**
     * Send sticker
     */
    public function sendSticker(string $ownId, string $threadId, string $stickerId, string $type = 'user'): array
    {
        return $this->makeRequest('post', '/api/send-sticker', [
            'ownId' => $ownId,
            'threadId' => $threadId,
            'stickerId' => $stickerId,
            'type' => $type
        ]);
    }

    /**
     * Helper method for HTTP requests
     */
    protected function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        try {
            $response = $method === 'get'
                ? $this->client()->get($endpoint, $data)
                : $this->client()->post($endpoint, $data);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json('data'),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json('error', 'Request failed'),
            ];
        } catch (\Exception $e) {
            Log::error("ZaloService::{$endpoint} failed", ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ===========================================
    // ADDITIONAL FEATURES (Full CLI Parity)
    // ===========================================

    /**
     * Send voice message
     */
    public function sendVoice(string $ownId, string $threadId, string $filePath, string $type = 'user'): array
    {
        return $this->makeRequest('POST', '/api/send-voice', [
            'ownId' => $ownId,
            'threadId' => $threadId,
            'filePath' => $filePath,
            'type' => $type,
        ]);
    }

    /**
     * Send contact card
     */
    public function sendCard(string $ownId, string $threadId, string $userId, string $phone, string $type = 'user'): array
    {
        return $this->makeRequest('POST', '/api/send-card', [
            'ownId' => $ownId,
            'threadId' => $threadId,
            'userId' => $userId,
            'phone' => $phone,
            'type' => $type,
        ]);
    }

    /**
     * Get user info
     */
    public function getUserInfo(string $ownId, string $userId): array
    {
        return $this->makeRequest('POST', '/api/user-info', [
            'ownId' => $ownId,
            'userId' => $userId,
        ]);
    }

    /**
     * Fetch user profile and cache in database
     * 
     * @param string $ownId Account ID to use for API call
     * @param string $zaloUserId User ID to fetch
     * @param bool $forceRefresh Force refresh even if cached
     * @return ZaloUser|null
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
     * Batch fetch and cache multiple user profiles
     * 
     * @param string $ownId Account ID to use
     * @param array $userIds Array of user IDs to fetch
     * @return array<string, ZaloUser> Keyed by zalo_user_id
     */
    public function fetchAndCacheUserProfiles(string $ownId, array $userIds): array
    {
        $results = [];

        // Check which users we already have cached
        $cachedUsers = ZaloUser::whereIn('zalo_user_id', $userIds)
            ->where('fetched_at', '>', now()->subHours(24))
            ->get()
            ->keyBy('zalo_user_id');

        // Find users that need fetching
        $needsFetching = array_filter($userIds, fn($id) => !isset($cachedUsers[$id]));

        // Fetch missing users (API supports array of userIds)
        if (!empty($needsFetching)) {
            $result = $this->makeRequest('POST', '/api/user-info', [
                'ownId' => $ownId,
                'userId' => array_values($needsFetching),
            ]);

            if ($result['success'] && isset($result['data']['changed_profiles'])) {
                foreach ($result['data']['changed_profiles'] as $userId => $profileData) {
                    $user = ZaloUser::updateFromApiResponse($userId, $profileData);
                    $results[$userId] = $user;
                }
            }
        }

        // Merge with cached
        foreach ($cachedUsers as $userId => $user) {
            $results[$userId] = $user;
        }

        return $results;
    }

    /**
     * Get cached user info or fetch if not available
     * Returns array with display_name and avatar
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

    /**
     * Get group info
     */
    public function getGroupInfo(string $ownId, string $groupId): array
    {
        return $this->makeRequest('GET', "/api/groups/{$groupId}/info?ownId={$ownId}");
    }

    /**
     * Rename group
     */
    public function renameGroup(string $ownId, string $groupId, string $name): array
    {
        return $this->makeRequest('POST', "/api/groups/{$groupId}/rename", [
            'ownId' => $ownId,
            'name' => $name,
        ]);
    }

    /**
     * Delete/disperse group
     */
    public function deleteGroup(string $ownId, string $groupId): array
    {
        return $this->makeRequest('POST', "/api/groups/{$groupId}/delete", [
            'ownId' => $ownId,
        ]);
    }

    /**
     * Promote user to admin
     */
    public function promoteToAdmin(string $ownId, string $groupId, string $userId): array
    {
        return $this->makeRequest('POST', "/api/groups/{$groupId}/promote", [
            'ownId' => $ownId,
            'userId' => $userId,
        ]);
    }

    /**
     * Demote admin to member
     */
    public function demoteFromAdmin(string $ownId, string $groupId, string $userId): array
    {
        return $this->makeRequest('POST', "/api/groups/{$groupId}/demote", [
            'ownId' => $ownId,
            'userId' => $userId,
        ]);
    }

    /**
     * Transfer group ownership
     */
    public function transferOwnership(string $ownId, string $groupId, string $userId): array
    {
        return $this->makeRequest('POST', "/api/groups/{$groupId}/transfer", [
            'ownId' => $ownId,
            'userId' => $userId,
        ]);
    }

    /**
     * Create poll
     */
    public function createPoll(string $ownId, string $groupId, string $question, array $options, array $settings = []): array
    {
        return $this->makeRequest('POST', "/api/groups/{$groupId}/poll", array_merge([
            'ownId' => $ownId,
            'question' => $question,
            'options' => $options,
        ], $settings));
    }

    /**
     * Lock poll
     */
    public function lockPoll(string $ownId, string $pollId): array
    {
        return $this->makeRequest('POST', "/api/polls/{$pollId}/lock", [
            'ownId' => $ownId,
        ]);
    }

    /**
     * Create note
     */
    public function createNote(string $ownId, string $groupId, string $title, string $content, int $pinAct = 1): array
    {
        return $this->makeRequest('POST', "/api/groups/{$groupId}/note", [
            'ownId' => $ownId,
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
        return $this->makeRequest('PUT', "/api/notes/{$noteId}", array_filter([
            'ownId' => $ownId,
            'title' => $title,
            'content' => $content,
            'pinAct' => $pinAct,
        ]));
    }

    /**
     * Get stickers
     */
    public function getStickers(string $ownId, string $keyword = 'hello'): array
    {
        return $this->makeRequest('GET', "/api/stickers?ownId={$ownId}&keyword=" . urlencode($keyword));
    }

    /**
     * Get own account profile
     */
    public function getAccountInfo(string $ownId): array
    {
        return $this->makeRequest('GET', "/api/accounts/{$ownId}/info");
    }

    /**
     * Set alias for user
     */
    public function setAlias(string $ownId, string $userId, string $alias): array
    {
        return $this->makeRequest('POST', "/api/users/{$userId}/alias", [
            'ownId' => $ownId,
            'alias' => $alias,
        ]);
    }

    /**
     * Pin/unpin conversation
     */
    public function pinConversation(string $ownId, string $threadId, bool $pinned = true): array
    {
        return $this->makeRequest('POST', "/api/conversations/{$threadId}/pin", [
            'ownId' => $ownId,
            'pinned' => $pinned,
        ]);
    }
}

