<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewApplicationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $applicationId,
        private readonly string $candidateName,
        private readonly string $jobTitle,
        private readonly string $source,
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_application',
            'application_id' => $this->applicationId,
            'candidate_name' => $this->candidateName,
            'job_title' => $this->jobTitle,
            'source' => $this->source,
            'message' => "{$this->candidateName} da ung tuyen vao vi tri {$this->jobTitle}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
