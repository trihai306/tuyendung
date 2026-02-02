<?php

namespace App\Jobs;

use App\Models\ZaloAccount;
use App\Models\ZaloUser;
use App\Services\ZaloService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to fetch and cache Zalo user profile in background
 * Dispatched when receiving a message from a user not yet in zalo_users table
 */
class FetchZaloUserProfileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60]; // Retry after 10s, 30s, 60s

    public function __construct(
        protected string $accountOwnId,
        protected string $zaloUserId,
        protected ?string $threadId = null,
        protected string $threadType = 'user'
    ) {
    }

    public function handle(ZaloService $zaloService): void
    {
        // Check if already cached
        $existingUser = ZaloUser::where('zalo_user_id', $this->zaloUserId)->first();
        if ($existingUser && !$existingUser->isStale()) {
            Log::debug('FetchZaloUserProfileJob: Profile already cached', [
                'zalo_user_id' => $this->zaloUserId,
            ]);
            return;
        }

        // Fetch user profile
        if ($this->threadType === 'user') {
            $profile = $zaloService->fetchAndCacheUserProfile(
                $this->accountOwnId,
                $this->zaloUserId
            );
        } else {
            // For group threads, try to get group info first
            $profile = $this->fetchGroupOrUserProfile($zaloService);
        }

        if ($profile) {
            Log::info('FetchZaloUserProfileJob: Profile cached successfully', [
                'zalo_user_id' => $this->zaloUserId,
                'display_name' => $profile->display_name,
            ]);
        } else {
            Log::warning('FetchZaloUserProfileJob: Failed to fetch profile', [
                'zalo_user_id' => $this->zaloUserId,
                'account' => $this->accountOwnId,
            ]);
        }
    }

    /**
     * Fetch group info or user profile depending on thread type
     */
    protected function fetchGroupOrUserProfile(ZaloService $zaloService): ?ZaloUser
    {
        // If thread is a group, try to get group info
        if ($this->threadId && $this->threadType === 'group') {
            $groupInfo = $zaloService->getGroupInfo($this->accountOwnId, $this->threadId);

            if ($groupInfo['success'] && isset($groupInfo['data']['info'])) {
                $info = $groupInfo['data']['info'];

                // Create/update group as a special ZaloUser entry
                return ZaloUser::updateOrCreate(
                    ['zalo_user_id' => $this->threadId],
                    [
                        'display_name' => $info['name'] ?? 'Group',
                        'zalo_name' => $info['name'] ?? null,
                        'avatar' => $info['avatar'] ?? null,
                        'is_group' => true,
                        'profile_data' => $info,
                        'fetched_at' => now(),
                    ]
                );
            }
        }

        // Fallback to fetching user profile
        return $zaloService->fetchAndCacheUserProfile(
            $this->accountOwnId,
            $this->zaloUserId
        );
    }
}
