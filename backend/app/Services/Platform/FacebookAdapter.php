<?php

namespace App\Services\Platform;

use App\Models\PlatformAccount;
use App\Models\Channel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookAdapter implements PlatformAdapterInterface
{
    private const GRAPH_API = 'https://graph.facebook.com/v18.0';

    public function __construct(
        private PlatformAccount $account
    ) {
    }

    public function getChannels(): array
    {
        $response = Http::get(self::GRAPH_API . '/me/accounts', [
            'access_token' => $this->account->access_token,
            'fields' => 'id,name,picture,access_token',
        ]);

        if (!$response->successful()) {
            Log::error('Facebook getChannels failed', ['response' => $response->json()]);
            return [];
        }

        $pages = $response->json('data', []);

        return array_map(fn($page) => [
            'channel_type' => 'page',
            'channel_id' => $page['id'],
            'channel_name' => $page['name'],
            'avatar_url' => $page['picture']['data']['url'] ?? null,
            'settings' => ['page_access_token' => $page['access_token'] ?? null],
        ], $pages);
    }

    public function sendMessage(Channel $channel, string $recipientId, array $message): array
    {
        $pageToken = $channel->settings['page_access_token'] ?? $this->account->access_token;

        $payload = [
            'recipient' => ['id' => $recipientId],
            'message' => $message,
            'messaging_type' => 'RESPONSE',
        ];

        $response = Http::post(self::GRAPH_API . '/me/messages', [
            'access_token' => $pageToken,
            ...$payload,
        ]);

        if (!$response->successful()) {
            Log::error('Facebook sendMessage failed', [
                'channel' => $channel->id,
                'recipient' => $recipientId,
                'response' => $response->json(),
            ]);
            throw new \Exception('Gửi tin nhắn Facebook thất bại: ' . ($response->json('error.message') ?? 'Unknown error'));
        }

        return [
            'message_id' => $response->json('message_id'),
            'recipient_id' => $response->json('recipient_id'),
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
                'type' => 'image',
                'payload' => ['url' => $imageUrl, 'is_reusable' => true],
            ],
        ]);
    }

    public function sendFileMessage(Channel $channel, string $recipientId, string $fileUrl, string $filename): array
    {
        return $this->sendMessage($channel, $recipientId, [
            'attachment' => [
                'type' => 'file',
                'payload' => ['url' => $fileUrl, 'is_reusable' => true],
            ],
        ]);
    }

    public function verifyWebhookSignature(string $signature, string $payload): bool
    {
        $secret = config('services.facebook.app_secret');
        $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }

    public function parseWebhookPayload(array $payload): array
    {
        $entry = $payload['entry'][0] ?? [];
        $messaging = $entry['messaging'][0] ?? [];

        if (!isset($messaging['message'])) {
            return [];
        }

        $message = $messaging['message'];
        $sender = $messaging['sender'];

        return [
            'channel_id' => $entry['id'] ?? null,
            'sender_id' => $sender['id'] ?? null,
            'sender_name' => null, // Need to fetch separately
            'message_id' => $message['mid'] ?? null,
            'content_type' => $this->detectContentType($message),
            'content' => $message['text'] ?? '',
            'attachments' => $this->parseAttachments($message),
            'timestamp' => ($messaging['timestamp'] ?? now()->timestamp * 1000) / 1000,
        ];
    }

    private function detectContentType(array $message): string
    {
        if (isset($message['attachments'])) {
            $type = $message['attachments'][0]['type'] ?? 'file';
            return $type === 'image' ? 'image' : 'file';
        }
        return 'text';
    }

    private function parseAttachments(array $message): ?array
    {
        if (!isset($message['attachments'])) {
            return null;
        }

        return array_map(fn($att) => [
            'type' => $att['type'] ?? 'file',
            'url' => $att['payload']['url'] ?? null,
            'sticker_id' => $att['payload']['sticker_id'] ?? null,
        ], $message['attachments']);
    }

    public function refreshAccessToken(): array
    {
        // Facebook long-lived tokens don't need refresh in the same way
        // For page tokens, they're typically long-lived already
        $response = Http::get(self::GRAPH_API . '/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'fb_exchange_token' => $this->account->access_token,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Làm mới token Facebook thất bại');
        }

        $data = $response->json();

        return [
            'access_token' => $data['access_token'],
            'expires_at' => isset($data['expires_in'])
                ? now()->addSeconds($data['expires_in'])
                : now()->addDays(60),
        ];
    }

    public function getUserProfile(string $userId): array
    {
        $response = Http::get(self::GRAPH_API . "/{$userId}", [
            'access_token' => $this->account->access_token,
            'fields' => 'first_name,last_name,profile_pic',
        ]);

        if (!$response->successful()) {
            return ['name' => null, 'avatar' => null];
        }

        $data = $response->json();

        return [
            'name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
            'avatar' => $data['profile_pic'] ?? null,
        ];
    }

    public function validateToken(): bool
    {
        try {
            $response = Http::get(self::GRAPH_API . '/me', [
                'access_token' => $this->account->access_token,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
