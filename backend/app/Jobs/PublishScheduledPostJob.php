<?php

namespace App\Jobs;

use App\Models\ScheduledPost;
use App\Models\PlatformAccount;
use App\Services\SocialMedia\FacebookPosterService;
use App\Services\SocialMedia\ZaloPosterService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PublishScheduledPostJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 180;

    public function __construct(
        public ScheduledPost $post
    ) {
    }

    public function handle(): void
    {
        // Kiểm tra status - nếu không phải approved thì skip
        if ($this->post->status !== 'approved') {
            Log::info("Post {$this->post->id} is not approved, skipping");
            return;
        }

        // Lấy platform account
        $account = $this->post->platformAccount;
        if (!$account) {
            $this->post->markAsFailed('Không tìm thấy tài khoản mạng xã hội');
            return;
        }

        // Xác định service
        $platform = $account->platform;
        $result = match ($platform) {
            'facebook' => $this->postToFacebook($account),
            'zalo' => $this->postToZalo($account),
            default => ['success' => false, 'error' => "Platform {$platform} không được hỗ trợ"],
        };

        // Cập nhật kết quả
        if ($result['success']) {
            $this->post->markAsPublished($result['post_id'] ?? null);
            Log::info("Successfully published post {$this->post->id} to {$platform}");
        } else {
            $this->post->markAsFailed($result['error'] ?? 'Lỗi không xác định');
            Log::error("Failed to publish post {$this->post->id}: {$result['error']}");
        }
    }

    private function postToFacebook(PlatformAccount $account): array
    {
        $service = app(FacebookPosterService::class);
        return $service->post($this->post, $account);
    }

    private function postToZalo(PlatformAccount $account): array
    {
        $service = app(ZaloPosterService::class);
        return $service->post($this->post, $account);
    }

    public function failed(\Throwable $exception): void
    {
        $this->post->markAsFailed($exception->getMessage());
        Log::error("PublishScheduledPostJob failed for post {$this->post->id}", [
            'error' => $exception->getMessage(),
        ]);
    }
}
