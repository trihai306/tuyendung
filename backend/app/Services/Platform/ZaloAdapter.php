<?php

namespace App\Services\Platform;

use App\Models\PlatformAccount;
use App\Models\Channel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZaloAdapter implements PlatformAdapterInterface
{
    private const API_BASE = 'https://openapi.zalo.me/v3.0';
    private const OA_API_BASE = 'https://openapi.zalo.me/v2.0/oa';

    public function __construct(
        private PlatformAccount $account
    ) {
    }

    public function getChannels(): array
    {
        $response = Http::withToken($this->account->access_token)
            ->get(self::OA_API_BASE . '/getoa');

        if (!$response->successful()) {
            Log::error('Zalo getChannels failed', ['response' => $response->json()]);
            return [];
        }

        $data = $response->json('data');

        return [
            [
                'channel_type' => 'oa',
                'channel_id' => $data['oa_id'] ?? null,
                'channel_name' => $data['name'] ?? 'Zalo OA',
                'avatar_url' => $data['avatar'] ?? null,
            ]
        ];
    }

    public function sendMessage(Channel $channel, string $recipientId, array $message): array
    {
        $payload = [
            'recipient' => ['user_id' => $recipientId],
            'message' => $message,
        ];

        $response = Http::withToken($this->account->access_token)
            ->post(self::OA_API_BASE . '/message', $payload);

        if (!$response->successful()) {
            Log::error('Zalo sendMessage failed', [
                'channel' => $channel->id,
                'recipient' => $recipientId,
                'response' => $response->json(),
            ]);
            throw new \Exception('Gửi tin nhắn Zalo thất bại: ' . $response->json('message', 'Unknown error'));
        }

        return [
            'message_id' => $response->json('data.message_id'),
            'status' => 'sent',
        ];
    }

    public function sendTextMessage(Channel $channel, string $recipientId, string $text): array
    {
        return $this->sendMessage($channel, $recipientId, [
            'text' => $text,
        ]);
    }

    public function sendImageMessage(Channel $channel, string $recipientId, string $imageUrl): array
    {
        return $this->sendMessage($channel, $recipientId, [
            'attachment' => [
                'type' => 'template',
                'payload' => [
                    'template_type' => 'media',
                    'elements' => [
                        [
                            'media_type' => 'image',
                            'url' => $imageUrl,
                        ]
                    ],
                ],
            ],
        ]);
    }

    public function sendFileMessage(Channel $channel, string $recipientId, string $fileUrl, string $filename): array
    {
        return $this->sendMessage($channel, $recipientId, [
            'attachment' => [
                'type' => 'file',
                'payload' => [
                    'url' => $fileUrl,
                    'name' => $filename,
                ],
            ],
        ]);
    }

    public function verifyWebhookSignature(string $signature, string $payload): bool
    {
        $secret = config('services.zalo.app_secret');
        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }

    public function parseWebhookPayload(array $payload): array
    {
        $event = $payload['event_name'] ?? '';
        $data = $payload['message'] ?? [];
        $sender = $payload['sender'] ?? [];

        if ($event !== 'user_send_text' && $event !== 'user_send_image' && $event !== 'user_send_file') {
            return [];
        }

        return [
            'channel_id' => $payload['oa_id'] ?? null,
            'sender_id' => $sender['id'] ?? null,
            'sender_name' => null, // Need to fetch separately
            'message_id' => $data['msg_id'] ?? null,
            'content_type' => $this->mapContentType($event),
            'content' => $data['text'] ?? '',
            'attachments' => $this->parseAttachments($data),
            'timestamp' => $payload['timestamp'] ?? now()->timestamp,
        ];
    }

    private function mapContentType(string $event): string
    {
        return match ($event) {
            'user_send_image' => 'image',
            'user_send_file' => 'file',
            default => 'text',
        };
    }

    private function parseAttachments(array $data): ?array
    {
        if (!isset($data['attachments'])) {
            return null;
        }

        return array_map(fn($att) => [
            'type' => $att['type'] ?? 'file',
            'url' => $att['payload']['url'] ?? null,
            'name' => $att['payload']['name'] ?? null,
        ], $data['attachments']);
    }

    public function refreshAccessToken(): array
    {
        $response = Http::asForm()->post('https://oauth.zaloapp.com/v4/oa/access_token', [
            'refresh_token' => $this->account->refresh_token,
            'app_id' => config('services.zalo.app_id'),
            'grant_type' => 'refresh_token',
        ]);

        if (!$response->successful()) {
            throw new \Exception('Làm mới token Zalo thất bại');
        }

        $data = $response->json();

        return [
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'] ?? $this->account->refresh_token,
            'expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
        ];
    }

    public function getUserProfile(string $userId): array
    {
        $response = Http::withToken($this->account->access_token)
            ->get(self::OA_API_BASE . '/getprofile', [
                'data' => json_encode(['user_id' => $userId]),
            ]);

        if (!$response->successful()) {
            return ['name' => null, 'avatar' => null];
        }

        $data = $response->json('data');

        return [
            'name' => $data['display_name'] ?? null,
            'avatar' => $data['avatars']['120'] ?? $data['avatar'] ?? null,
        ];
    }

    public function validateToken(): bool
    {
        try {
            $response = Http::withToken($this->account->access_token)
                ->get(self::OA_API_BASE . '/getoa');

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
