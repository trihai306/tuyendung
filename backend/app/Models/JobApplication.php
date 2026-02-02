<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'candidate_id',
        'stage_id',
        'screening_answers',
        'stage_entered_at',
        'interview_scheduled_at',
        'interview_notes',
        'rejection_reason',
        'offer_amount',
        'hired_at',
    ];

    protected $casts = [
        'screening_answers' => 'array',
        'stage_entered_at' => 'datetime',
        'interview_scheduled_at' => 'datetime',
        'hired_at' => 'datetime',
        'offer_amount' => 'decimal:2',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(RecruitmentJob::class, 'job_id');
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id');
    }

    public function moveToStage(PipelineStage $stage): void
    {
        $this->update([
            'stage_id' => $stage->id,
            'stage_entered_at' => now(),
        ]);
    }

    public function scheduleInterview(\DateTime $dateTime): void
    {
        $this->update(['interview_scheduled_at' => $dateTime]);
    }

    public function reject(string $reason = null): void
    {
        $rejectedStage = PipelineStage::where('user_id', $this->job->user_id)
            ->where('slug', 'rejected')
            ->first();

        $this->update([
            'stage_id' => $rejectedStage->id,
            'rejection_reason' => $reason,
            'stage_entered_at' => now(),
        ]);
    }

    public function hire(float $offerAmount = null): void
    {
        $hiredStage = PipelineStage::where('user_id', $this->job->user_id)
            ->where('slug', 'hired')
            ->first();

        $this->update([
            'stage_id' => $hiredStage->id,
            'offer_amount' => $offerAmount,
            'hired_at' => now(),
            'stage_entered_at' => now(),
        ]);

        $this->job->increment('hired_count');
    }
}
