<?php

namespace App\Events;

use App\Models\AgentTask;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * AgentTaskDispatched
 * 
 * Broadcasts on the 'agent-tasks' channel so that
 * the automation app (Electron) can receive and execute tasks.
 */
class AgentTaskDispatched implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public AgentTask $task
    ) {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('agent-tasks');
    }

    public function broadcastAs(): string
    {
        return 'task.dispatch';
    }

    public function broadcastWith(): array
    {
        return [
            'task_id' => (string) $this->task->id,
            'type' => $this->task->type,
            'payload' => $this->task->payload,
            'callback_url' => $this->task->callback_url,
            'company_id' => $this->task->company_id,
        ];
    }
}
