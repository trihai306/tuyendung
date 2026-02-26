<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'task_candidate_id',
        'recruitment_task_id',
        'work_date',
        'status',
        'shifts_worked',
        'overtime_hours',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'work_date' => 'date',
            'overtime_hours' => 'decimal:1',
            'shifts_worked' => 'integer',
        ];
    }

    public function taskCandidate(): BelongsTo
    {
        return $this->belongsTo(TaskCandidate::class);
    }

    public function recruitmentTask(): BelongsTo
    {
        return $this->belongsTo(RecruitmentTask::class);
    }
}
