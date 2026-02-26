<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private const STATUS_LABELS = [
        'pending' => 'Cho duyet',
        'reviewing' => 'Dang xem xet',
        'shortlisted' => 'Vao danh sach ngan',
        'accepted' => 'Duoc chap nhan',
        'rejected' => 'Bi tu choi',
    ];

    public function __construct(
        private readonly int $applicationId,
        private readonly string $jobTitle,
        private readonly string $newStatus,
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
        $statusLabel = self::STATUS_LABELS[$this->newStatus] ?? $this->newStatus;

        return [
            'type' => 'application_status',
            'application_id' => $this->applicationId,
            'job_title' => $this->jobTitle,
            'new_status' => $this->newStatus,
            'message' => "Don ung tuyen vao {$this->jobTitle} da duoc cap nhat: {$statusLabel}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
