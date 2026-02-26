<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    protected $fillable = [
        'task_candidate_id',
        'recruitment_task_id',
        'period_start',
        'period_end',
        'total_shifts',
        'overtime_hours',
        'shift_amount',
        'overtime_amount',
        'bonus',
        'deduction',
        'total_amount',
        'status',
        'paid_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'total_shifts' => 'integer',
            'overtime_hours' => 'integer',
            'shift_amount' => 'decimal:0',
            'overtime_amount' => 'decimal:0',
            'bonus' => 'decimal:0',
            'deduction' => 'decimal:0',
            'total_amount' => 'decimal:0',
            'paid_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function taskCandidate(): BelongsTo
    {
        return $this->belongsTo(TaskCandidate::class);
    }

    public function recruitmentTask(): BelongsTo
    {
        return $this->belongsTo(RecruitmentTask::class);
    }

    // --- Helpers ---

    public function calculateTotal(): void
    {
        $this->total_amount = (int) $this->shift_amount
            + (int) $this->overtime_amount
            + (int) $this->bonus
            - (int) $this->deduction;
    }
}
