<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ZaloMessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $accountId;
    public string $threadId;
    public string $senderId;
    public string $senderName;
    public string $content;
    public string $direction;
    public string $timestamp;
    public ?array $raw;

    public function __construct(array $data)
    {
        $this->accountId = $data['accountId'] ?? $data['ownId'] ?? '';
        $this->threadId = $data['threadId'] ?? '';
        $this->senderId = $data['senderId'] ?? '';
        $this->senderName = $data['senderName'] ?? 'Unknown';
        $this->content = $data['content'] ?? '';
        $this->direction = $data['direction'] ?? 'inbound';
        $this->timestamp = $data['timestamp'] ?? now()->toISOString();
        $this->raw = $data['raw'] ?? null;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('zalo.messages.' . $this->accountId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.received';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'accountId' => $this->accountId,
            'threadId' => $this->threadId,
            'senderId' => $this->senderId,
            'senderName' => $this->senderName,
            'content' => $this->content,
            'direction' => $this->direction,
            'timestamp' => $this->timestamp,
        ];
    }
}
