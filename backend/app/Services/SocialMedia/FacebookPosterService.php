<?php

namespace App\Services\SocialMedia;

use App\Models\PlatformAccount;
use App\Models\ScheduledPost;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

class FacebookPosterService implements SocialPosterInterface
{
    private string $scriptsPath;

    public function __construct()
    {
        $this->scriptsPath = base_path('scripts/playwright');
    }

    /**
     * Đăng bài lên Facebook bằng Playwright
     * @return array ['success' => bool, 'post_id' => string|null, 'error' => string|null]
     */
    public function post(ScheduledPost $post, PlatformAccount $account): array
    {
        try {
            // Prepare data for Playwright script
            $data = [
                'account_id' => $account->id,
                'cookies' => $account->credentials['cookies'] ?? [],
                'page_url' => $account->credentials['page_url'] ?? null,
                'group_url' => $account->credentials['group_url'] ?? null,
                'content' => $post->content,
                'media_urls' => $post->media_urls ?? [],
            ];

            // Save data to temp file for Playwright
            $tempFile = storage_path('app/temp/fb_post_' . $post->id . '.json');
            file_put_contents($tempFile, json_encode($data));

            // Run Playwright script
            $result = Process::timeout(120)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-poster.spec.ts --project=chromium -- --data={$tempFile}");

            // Clean up temp file
            @unlink($tempFile);

            if ($result->failed()) {
                return [
                    'success' => false,
                    'post_id' => null,
                    'error' => $this->parseError($result->errorOutput()),
                ];
            }

            // Parse result từ output
            $output = $result->output();
            $postId = $this->parsePostId($output);

            return [
                'success' => true,
                'post_id' => $postId,
                'error' => null,
            ];
        } catch (\Exception $e) {
            Log::error('Facebook posting error: ' . $e->getMessage(), [
                'post_id' => $post->id,
                'account_id' => $account->id,
            ]);

            return [
                'success' => false,
                'post_id' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate Facebook account bằng Playwright
     */
    public function validateAccount(PlatformAccount $account): bool
    {
        try {
            $cookies = $account->credentials['cookies'] ?? [];
            if (empty($cookies)) {
                return false;
            }

            // Save cookies to temp file
            $tempFile = storage_path('app/temp/fb_validate_' . $account->id . '.json');
            file_put_contents($tempFile, json_encode(['cookies' => $cookies]));

            $result = Process::timeout(60)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-validate.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            return $result->successful();
        } catch (\Exception $e) {
            Log::warning('Facebook validation error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Login và lấy cookies
     */
    public function loginAndGetCookies(string $email, string $password): ?array
    {
        try {
            $data = [
                'email' => $email,
                'password' => $password,
            ];

            $tempFile = storage_path('app/temp/fb_login_' . time() . '.json');
            file_put_contents($tempFile, json_encode($data));

            $result = Process::timeout(120)
                ->path($this->scriptsPath)
                ->run("npx playwright test facebook-login.spec.ts --project=chromium -- --data={$tempFile}");

            @unlink($tempFile);

            if ($result->failed()) {
                return null;
            }

            // Parse cookies từ output
            return $this->parseCookies($result->output());
        } catch (\Exception $e) {
            Log::error('Facebook login error: ' . $e->getMessage());
            return null;
        }
    }

    private function parsePostId(string $output): ?string
    {
        // Parse post ID from Playwright output
        if (preg_match('/POST_ID:(\w+)/', $output, $matches)) {
            return $matches[1];
        }
        return null;
    }

    private function parseError(string $output): string
    {
        // Extract meaningful error message
        if (str_contains($output, 'blocked') || str_contains($output, 'checkpoint')) {
            return 'Tài khoản bị chặn hoặc cần xác minh';
        }
        if (str_contains($output, 'login') || str_contains($output, 'session')) {
            return 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
        }
        if (str_contains($output, 'timeout')) {
            return 'Timeout - Facebook phản hồi chậm';
        }
        return 'Lỗi không xác định khi đăng bài';
    }

    private function parseCookies(string $output): ?array
    {
        if (preg_match('/COOKIES:(.+)/', $output, $matches)) {
            return json_decode(base64_decode($matches[1]), true);
        }
        return null;
    }
}
