<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiAgentLog extends Model
{
    protected $fillable = [
        'ai_agent_id',
        'scenario_id',
        'action',
        'status',
        'input_data',
        'output_data',
        'error_message',
        'executed_at',
    ];

    protected function casts(): array
    {
        return [
            'input_data' => 'array',
            'output_data' => 'array',
            'executed_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AiAgent::class, 'ai_agent_id');
    }

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(AiAgentScenario::class, 'scenario_id');
    }
}
