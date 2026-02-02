<?php

namespace App\Events;

use App\Models\Candidate;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CandidateCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Candidate $candidate
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->candidate->user_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'candidate.created';
    }

    public function broadcastWith(): array
    {
        return [
            'candidate' => [
                'id' => $this->candidate->id,
                'full_name' => $this->candidate->full_name,
                'email' => $this->candidate->email,
                'phone' => $this->candidate->phone,
                'source' => $this->candidate->source,
                'created_at' => $this->candidate->created_at->toISOString(),
            ],
        ];
    }
}
