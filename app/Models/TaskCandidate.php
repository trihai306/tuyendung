<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskCandidate extends Model
{
    protected $fillable = [
        'recruitment_task_id',
        'application_id',
        'candidate_name',
        'candidate_phone',
        'candidate_email',
        'status',
        'notes',
        'hired_date',
    ];

    protected function casts(): array
    {
        return [
            'hired_date' => 'date',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(RecruitmentTask::class, 'recruitment_task_id');
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
