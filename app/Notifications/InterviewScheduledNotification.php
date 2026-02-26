<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class InterviewScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $interviewId,
        private readonly string $scheduledAt,
        private readonly string $interviewType,
        private readonly string $jobTitle,
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
        $typeLabel = $this->interviewType === 'online' ? 'truc tuyen' : 'truc tiep';

        return [
            'type' => 'interview_scheduled',
            'interview_id' => $this->interviewId,
            'scheduled_at' => $this->scheduledAt,
            'interview_type' => $this->interviewType,
            'job_title' => $this->jobTitle,
            'message' => "Ban co lich phong van {$typeLabel} cho vi tri {$this->jobTitle}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
