<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecruitmentTask extends Model
{
    protected $fillable = [
        'employer_profile_id',
        'job_post_id',
        'assigned_to',
        'assigned_by',
        'title',
        'type',
        'description',
        'priority',
        'target_quantity',
        'status',
        'due_date',
        'completed_at',
        'notes',
        'completion_report',
        'work_dates',
        'work_shifts',
        'overtime_hours',
        'shift_rate',
        'overtime_rate',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'datetime',
            'assigned_to' => 'array',
            'work_dates' => 'array',
            'work_shifts' => 'array',
            'overtime_hours' => 'integer',
            'shift_rate' => 'integer',
            'overtime_rate' => 'integer',
        ];
    }

    // --- Relationships ---

    public function employerProfile(): BelongsTo
    {
        return $this->belongsTo(EmployerProfile::class);
    }

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class);
    }

    /**
     * Get the users assigned to this task.
     */
    public function assignees()
    {
        return User::whereIn('id', $this->assigned_to ?? [])->get();
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(TaskCandidate::class);
    }

    // --- Scopes ---

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now()->toDateString())
            ->whereNotIn('status', ['completed', 'cancelled']);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->whereJsonContains('assigned_to', $userId);
    }
}
