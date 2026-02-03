<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'user_id',
        'target_assigned',
        'found_count',
        'confirmed_count',
        'notes',
        'status',
    ];

    protected $casts = [
        'target_assigned' => 'integer',
        'found_count' => 'integer',
        'confirmed_count' => 'integer',
    ];

    /**
     * Job này thuộc về
     */
    public function job(): BelongsTo
    {
        return $this->belongsTo(RecruitmentJob::class, 'job_id');
    }

    /**
     * Nhân viên được giao
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Cập nhật tiến độ
     */
    public function updateProgress(int $found, ?int $confirmed = null, ?string $notes = null): void
    {
        $this->found_count = $found;

        if ($confirmed !== null) {
            $this->confirmed_count = $confirmed;
        }

        if ($notes !== null) {
            $this->notes = $notes;
        }

        // Tự động chuyển status
        if ($this->target_assigned && $found >= $this->target_assigned) {
            $this->status = 'completed';
        } elseif ($found > 0) {
            $this->status = 'in_progress';
        }

        $this->save();

        // Cập nhật tổng hired_count của job
        $this->job->updateTotalHired();
    }

    /**
     * Get progress percentage
     */
    public function getProgressPercentAttribute(): float
    {
        if (!$this->target_assigned) {
            return 0;
        }
        return min(100, ($this->found_count / $this->target_assigned) * 100);
    }
}
