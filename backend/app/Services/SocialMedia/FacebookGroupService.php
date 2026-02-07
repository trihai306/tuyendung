<?php

namespace App\Services\SocialMedia;

use App\Models\FacebookGroup;
use App\Models\PlatformAccount;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

/**
 * FacebookGroupService
 * 
 * Manages Facebook groups via Playwright automation.
 * Handles group syncing, posting, and member management.
 */
class FacebookGroupService
{
    private string $scriptsPath;

    public function __construct()
    {
        $this->scriptsPath = base_path('scripts/playwright');
    }

    /**
     * Sync user's Facebook groups from their account
     */
    public function syncGroups(PlatformAccount $account): array
    {
        try {
            $cookies = $account->credentials['cookies'] ?? [];

            if (empty($cookies)) {
                return [
                    'success' => false,
                    'error' => 'No cookies available for this account',
                ];
            }

            // Save cookies to temp file
            $tempFile = $this->createTempFile([
                'cookies' => $cookies,
                'action' => 'sync_groups',
            ]);

            $result = Process::timeout(120)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-groups.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            if ($result->failed()) {
                return [
                    'success' => false,
                    'error' => $this->parseError($result->errorOutput()),
                ];
            }

            $output = $this->parseOutput($result->output());
            $groups = $output['groups'] ?? [];

            // Sync groups to database
            $synced = [];
            foreach ($groups as $groupData) {
                $group = FacebookGroup::updateOrCreate(
                    [
                        'platform_account_id' => $account->id,
                        'group_id' => $groupData['id'],
                    ],
                    [
                        'company_id' => $account->company_id,
                        'group_url' => $groupData['url'],
                        'name' => $groupData['name'],
                        'description' => $groupData['description'] ?? null,
                        'member_count' => $groupData['member_count'] ?? 0,
                        'privacy' => $groupData['privacy'] ?? null,
                        'role' => $groupData['role'] ?? 'member',
                        'synced_at' => now(),
                    ]
                );
                $synced[] = $group;
            }

            return [
                'success' => true,
                'synced_count' => count($synced),
                'groups' => $synced,
            ];

        } catch (\Exception $e) {
            Log::error('FacebookGroupService sync error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Post content to a Facebook group
     */
    public function postToGroup(PlatformAccount $account, FacebookGroup $group, string $content, array $mediaUrls = []): array
    {
        try {
            $cookies = $account->credentials['cookies'] ?? [];

            if (empty($cookies)) {
                return [
                    'success' => false,
                    'error' => 'No cookies available for this account',
                ];
            }

            $tempFile = $this->createTempFile([
                'cookies' => $cookies,
                'action' => 'post',
                'group_url' => $group->group_url,
                'content' => $content,
                'media_urls' => $mediaUrls,
            ]);

            $result = Process::timeout(180)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-group-post.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            if ($result->failed()) {
                return [
                    'success' => false,
                    'error' => $this->parseError($result->errorOutput()),
                ];
            }

            $output = $this->parseOutput($result->output());

            // Update group's last post timestamp
            $group->markPostSent();

            return [
                'success' => true,
                'post_id' => $output['post_id'] ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('FacebookGroupService post error: ' . $e->getMessage(), [
                'group_id' => $group->id,
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get group members (admin only)
     */
    public function getGroupMembers(PlatformAccount $account, FacebookGroup $group, int $limit = 50): array
    {
        if (!$group->isAdmin()) {
            return [
                'success' => false,
                'error' => 'Bạn cần là Admin để xem danh sách thành viên',
            ];
        }

        try {
            $cookies = $account->credentials['cookies'] ?? [];

            $tempFile = $this->createTempFile([
                'cookies' => $cookies,
                'action' => 'get_members',
                'group_url' => $group->group_url,
                'limit' => $limit,
            ]);

            $result = Process::timeout(120)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-group-members.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            if ($result->failed()) {
                return [
                    'success' => false,
                    'error' => $this->parseError($result->errorOutput()),
                ];
            }

            $output = $this->parseOutput($result->output());

            return [
                'success' => true,
                'members' => $output['members'] ?? [],
                'pending_count' => $output['pending_count'] ?? 0,
            ];

        } catch (\Exception $e) {
            Log::error('FacebookGroupService get members error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get pending member requests (admin only)
     */
    public function getPendingMembers(PlatformAccount $account, FacebookGroup $group): array
    {
        if (!$group->isAdmin()) {
            return [
                'success' => false,
                'error' => 'Bạn cần là Admin để xem yêu cầu tham gia',
            ];
        }

        try {
            $cookies = $account->credentials['cookies'] ?? [];

            $tempFile = $this->createTempFile([
                'cookies' => $cookies,
                'action' => 'get_pending',
                'group_url' => $group->group_url,
            ]);

            $result = Process::timeout(120)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-group-pending.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            if ($result->failed()) {
                return [
                    'success' => false,
                    'error' => $this->parseError($result->errorOutput()),
                ];
            }

            $output = $this->parseOutput($result->output());

            return [
                'success' => true,
                'pending' => $output['pending'] ?? [],
            ];

        } catch (\Exception $e) {
            Log::error('FacebookGroupService get pending error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Accept a pending member request
     */
    public function acceptMemberRequest(PlatformAccount $account, FacebookGroup $group, string $userId): array
    {
        if (!$group->isAdmin()) {
            return [
                'success' => false,
                'error' => 'Bạn cần là Admin để duyệt thành viên',
            ];
        }

        try {
            $cookies = $account->credentials['cookies'] ?? [];

            $tempFile = $this->createTempFile([
                'cookies' => $cookies,
                'action' => 'accept_member',
                'group_url' => $group->group_url,
                'user_id' => $userId,
            ]);

            $result = Process::timeout(60)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-group-accept.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            if ($result->failed()) {
                return [
                    'success' => false,
                    'error' => $this->parseError($result->errorOutput()),
                ];
            }

            return [
                'success' => true,
                'message' => 'Đã duyệt thành viên thành công',
            ];

        } catch (\Exception $e) {
            Log::error('FacebookGroupService accept member error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate Facebook account cookies
     */
    public function validateAccount(PlatformAccount $account): bool
    {
        try {
            $cookies = $account->credentials['cookies'] ?? [];
            if (empty($cookies)) {
                return false;
            }

            $tempFile = $this->createTempFile([
                'cookies' => $cookies,
                'action' => 'validate',
            ]);

            $result = Process::timeout(60)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-validate.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            return $result->successful();

        } catch (\Exception $e) {
            Log::warning('FacebookGroupService validation error: ' . $e->getMessage());
            return false;
        }
    }

    // ===========================================
    // HELPER METHODS
    // ===========================================

    private function createTempFile(array $data): string
    {
        $tempFile = storage_path('app/temp/fb_' . uniqid() . '.json');

        // Ensure temp directory exists
        $dir = dirname($tempFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        file_put_contents($tempFile, json_encode($data));
        return $tempFile;
    }

    private function parseOutput(string $output): array
    {
        // Look for JSON output between markers
        if (preg_match('/OUTPUT_START(.+)OUTPUT_END/s', $output, $matches)) {
            return json_decode(trim($matches[1]), true) ?? [];
        }

        // Try to parse the entire output as JSON
        $decoded = json_decode($output, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        return [];
    }

    private function parseError(string $output): string
    {
        if (str_contains($output, 'blocked') || str_contains($output, 'checkpoint')) {
            return 'Tài khoản bị chặn hoặc cần xác minh';
        }
        if (str_contains($output, 'login') || str_contains($output, 'session')) {
            return 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
        }
        if (str_contains($output, 'timeout')) {
            return 'Timeout - Facebook phản hồi chậm';
        }
        if (str_contains($output, 'not found') || str_contains($output, '404')) {
            return 'Không tìm thấy nhóm';
        }

        return 'Lỗi không xác định';
    }
}
