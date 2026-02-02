<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ZaloAccountStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $accountId;
    public string $status; // 'connected' | 'disconnected' | 'login'
    public ?string $displayName;
    public ?string $phone;
    public ?string $avatar;

    public function __construct(string $accountId, string $status, ?array $accountInfo = null)
    {
        $this->accountId = $accountId;
        $this->status = $status;
        $this->displayName = $accountInfo['displayName'] ?? null;
        $this->phone = $accountInfo['phone'] ?? null;
        $this->avatar = $accountInfo['avatar'] ?? null;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('zalo.accounts'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'account.status';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'accountId' => $this->accountId,
            'status' => $this->status,
            'displayName' => $this->displayName,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
        ];
    }
}
