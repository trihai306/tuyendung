<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * ZaloLoginProgress - Broadcasts QR login progress via Soketi
 * 
 * Stages:
 * - qr_generated: QR code ready to scan
 * - waiting_scan: Waiting for user to scan
 * - login_success: Login completed
 * - login_failed: Login failed/timeout
 */
class ZaloLoginProgress implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $sessionId,
        public string $stage,
        public ?string $qrCode = null,
        public ?array $data = null,
        public ?string $message = null,
        public ?string $error = null
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel("zalo-login.{$this->sessionId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'login.progress';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'stage' => $this->stage,
            'qr_code' => $this->qrCode,
            'data' => $this->data,
            'message' => $this->message,
            'error' => $this->error,
            'timestamp' => now()->toISOString(),
        ];
    }
}
