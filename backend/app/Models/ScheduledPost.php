<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledPost extends Model
{
    protected $fillable = [
        'job_id',
        'template_id',
        'channel_id',
        'platform_account_id',
        'content',
        'media_urls',
        'scheduled_at',
        'status',
        'approved_by',
        'approved_at',
        'published_at',
        'external_post_id',
        'metrics',
        'error_message',
        'created_by',
    ];

    protected $casts = [
        'media_urls' => 'array',
        'metrics' => 'array',
        'scheduled_at' => 'datetime',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(RecruitmentJob::class, 'job_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(PostTemplate::class, 'template_id');
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function platformAccount(): BelongsTo
    {
        return $this->belongsTo(PlatformAccount::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function markAsPublished(string $externalPostId = null): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
            'external_post_id' => $externalPostId,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending' => 'Chờ duyệt',
            'approved' => 'Đã duyệt',
            'published' => 'Đã đăng',
            'failed' => 'Lỗi',
            'cancelled' => 'Đã hủy',
            default => $this->status,
        };
    }
}
