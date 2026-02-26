<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiAgentScenario extends Model
{
    protected $fillable = [
        'ai_agent_id',
        'name',
        'trigger_type',
        'trigger_config',
        'actions',
        'is_active',
        'last_run_at',
        'run_count',
    ];

    protected function casts(): array
    {
        return [
            'trigger_config' => 'array',
            'actions' => 'array',
            'is_active' => 'boolean',
            'last_run_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AiAgent::class, 'ai_agent_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AiAgentLog::class, 'scenario_id');
    }

    // --- Scopes ---

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
