<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'job_id',
        'mode',
        'status',
        'context',
        'current_step',
    ];

    protected $casts = [
        'context' => 'array',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(RecruitmentJob::class, 'job_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AiAuditLog::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function updateContext(array $data): void
    {
        $this->update([
            'context' => array_merge($this->context ?? [], $data),
        ]);
    }

    public function pause(): void
    {
        $this->update(['status' => 'paused']);
    }

    public function complete(): void
    {
        $this->update(['status' => 'completed']);
    }
}
