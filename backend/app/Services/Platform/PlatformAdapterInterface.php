<?php

namespace App\Services\Platform;

use App\Models\PlatformAccount;
use App\Models\Channel;

interface PlatformAdapterInterface
{
    /**
     * Get all channels (pages, groups, OAs) for this account
     */
    public function getChannels(): array;

    /**
     * Send a message to a participant
     */
    public function sendMessage(Channel $channel, string $recipientId, array $message): array;

    /**
     * Send a text message
     */
    public function sendTextMessage(Channel $channel, string $recipientId, string $text): array;

    /**
     * Send an image message
     */
    public function sendImageMessage(Channel $channel, string $recipientId, string $imageUrl): array;

    /**
     * Send a file attachment
     */
    public function sendFileMessage(Channel $channel, string $recipientId, string $fileUrl, string $filename): array;

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $signature, string $payload): bool;

    /**
     * Parse webhook payload into normalized message format
     */
    public function parseWebhookPayload(array $payload): array;

    /**
     * Refresh access token
     */
    public function refreshAccessToken(): array;

    /**
     * Get user profile
     */
    public function getUserProfile(string $userId): array;

    /**
     * Check if token is valid
     */
    public function validateToken(): bool;
}
