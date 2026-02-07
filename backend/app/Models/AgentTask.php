<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentTask extends Model
{
    protected $fillable = [
        'company_id',
        'type',
        'payload',
        'status',
        'result',
        'agent_id',
        'callback_url',
        'dispatched_at',
        'completed_at',
        'created_by',
    ];

    protected $casts = [
        'payload' => 'array',
        'result' => 'array',
        'dispatched_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // ============ Relations ============

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ============ Scopes ============

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // ============ Status Helpers ============

    public function markAsDispatched(): void
    {
        $this->update([
            'status' => 'dispatched',
            'dispatched_at' => now(),
        ]);
    }

    public function markAsProcessing(string $agentId): void
    {
        $this->update([
            'status' => 'processing',
            'agent_id' => $agentId,
        ]);
    }

    public function markAsCompleted(array $result): void
    {
        $this->update([
            'status' => 'completed',
            'result' => $result,
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(array $result): void
    {
        $this->update([
            'status' => 'failed',
            'result' => $result,
            'completed_at' => now(),
        ]);
    }
}
