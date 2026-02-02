<?php

namespace App\Services\SocialMedia;

use App\Models\PlatformAccount;
use App\Models\ScheduledPost;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZaloPosterService implements SocialPosterInterface
{
    private string $baseUrl = 'https://openapi.zalo.me/v2.0';

    /**
     * Đăng bài lên Zalo OA
     * @return array ['success' => bool, 'post_id' => string|null, 'error' => string|null]
     */
    public function post(ScheduledPost $post, PlatformAccount $account): array
    {
        try {
            $accessToken = $account->access_token;

            if (!$accessToken) {
                return [
                    'success' => false,
                    'post_id' => null,
                    'error' => 'Access token không hợp lệ',
                ];
            }

            // Tạo article trên Zalo OA
            $response = $this->createArticle($accessToken, $post);

            if ($response['error'] ?? false) {
                return [
                    'success' => false,
                    'post_id' => null,
                    'error' => $response['message'] ?? 'Lỗi không xác định từ Zalo API',
                ];
            }

            return [
                'success' => true,
                'post_id' => $response['data']['token'] ?? null,
                'error' => null,
            ];
        } catch (\Exception $e) {
            Log::error('Zalo posting error: ' . $e->getMessage(), [
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
     * Tạo article trên Zalo OA
     */
    private function createArticle(string $accessToken, ScheduledPost $post): array
    {
        $job = $post->job;
        $mediaUrls = $post->media_urls ?? [];

        // Prepare cover image
        $cover = !empty($mediaUrls) ? $this->uploadImage($accessToken, $mediaUrls[0]) : null;

        $body = [
            'type' => 'normal',
            'title' => $job->title,
            'author' => $job->company?->name ?? 'Tuyển dụng',
            'cover' => $cover ? [
                'cover_type' => 'photo',
                'photo_url' => $cover['url'] ?? '',
                'status' => 'show',
            ] : null,
            'description' => mb_substr(strip_tags($post->content), 0, 150),
            'body' => $this->formatBodyContent($post->content, $mediaUrls),
            'status' => 'show',
        ];

        $response = Http::withToken($accessToken)
            ->post("{$this->baseUrl}/article/create", $body);

        return $response->json();
    }

    /**
     * Upload image lên Zalo
     */
    private function uploadImage(string $accessToken, string $imageUrl): ?array
    {
        try {
            $response = Http::withToken($accessToken)
                ->post("{$this->baseUrl}/article/upload_photo", [
                    'photo_url' => $imageUrl,
                ]);

            return $response->json()['data'] ?? null;
        } catch (\Exception $e) {
            Log::warning('Failed to upload image to Zalo: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Format nội dung body cho article
     */
    private function formatBodyContent(string $content, array $mediaUrls = []): array
    {
        $body = [];

        // Add text content
        $body[] = [
            'type' => 'text',
            'content' => $content,
        ];

        // Add images
        foreach (array_slice($mediaUrls, 1) as $url) {
            $body[] = [
                'type' => 'photo',
                'content' => $url,
            ];
        }

        return $body;
    }

    /**
     * Validate Zalo OA account
     */
    public function validateAccount(PlatformAccount $account): bool
    {
        try {
            $response = Http::withToken($account->access_token)
                ->get("{$this->baseUrl}/oa/getoa");

            return isset($response->json()['data']['oa_id']);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Lấy danh sách followers
     */
    public function getFollowers(PlatformAccount $account, int $offset = 0, int $count = 50): array
    {
        $response = Http::withToken($account->access_token)
            ->get("{$this->baseUrl}/oa/getfollowers", [
                'offset' => $offset,
                'count' => $count,
            ]);

        return $response->json()['data'] ?? [];
    }

    /**
     * Gửi broadcast message
     */
    public function sendBroadcast(PlatformAccount $account, string $message): array
    {
        $response = Http::withToken($account->access_token)
            ->post("{$this->baseUrl}/oa/message", [
                'recipient' => ['user_id' => 'all'],
                'message' => [
                    'text' => $message,
                ],
            ]);

        return $response->json();
    }
}
