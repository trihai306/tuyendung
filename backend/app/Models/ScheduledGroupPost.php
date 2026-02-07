<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduledGroupPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'job_id',
        'zalo_account_id',
        'target_groups',
        'content',
        'media_urls',
        'template_id',
        'scheduled_at',
        'repeat_type',
        'repeat_config',
        'status',
        'success_count',
        'failed_count',
        'results',
        'created_by',
        'approved_by',
        'approved_at',
        'executed_at',
    ];

    protected $casts = [
        'target_groups' => 'array',
        'media_urls' => 'array',
        'repeat_config' => 'array',
        'results' => 'array',
        'scheduled_at' => 'datetime',
        'approved_at' => 'datetime',
        'executed_at' => 'datetime',
    ];

    // ===========================================
    // RELATIONSHIPS
    // ===========================================

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(RecruitmentJob::class, 'job_id');
    }

    public function zaloAccount(): BelongsTo
    {
        return $this->belongsTo(ZaloAccount::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(PostTemplate::class, 'template_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ===========================================
    // SCOPES
    // ===========================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeDue($query)
    {
        return $query->where('status', 'approved')
            ->where('scheduled_at', '<=', now());
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // ===========================================
    // STATUS HELPERS
    // ===========================================

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function approve(?int $userId = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    public function markAsCompleted(array $results = []): void
    {
        $this->update([
            'status' => 'completed',
            'results' => $results,
            'executed_at' => now(),
        ]);
    }

    public function markAsFailed(string $error = null): void
    {
        $this->update([
            'status' => 'failed',
            'results' => ['error' => $error],
            'executed_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    // ===========================================
    // ACCESSORS
    // ===========================================

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Chờ duyệt',
            'approved' => 'Đã duyệt',
            'processing' => 'Đang xử lý',
            'completed' => 'Hoàn thành',
            'failed' => 'Thất bại',
            'cancelled' => 'Đã hủy',
            default => $this->status,
        };
    }

    public function getTargetGroupCountAttribute(): int
    {
        if ($this->target_groups === ['all']) {
            // Count all groups for this Zalo account
            return $this->zaloAccount?->groups()->count() ?? 0;
        }
        return count($this->target_groups ?? []);
    }
}
