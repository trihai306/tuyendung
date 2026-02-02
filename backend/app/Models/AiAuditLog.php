<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_session_id',
        'message_id',
        'action_type',
        'input_prompt',
        'tool_name',
        'tool_input',
        'tool_output',
        'generated_response',
        'final_response',
        'confidence_score',
        'approved_by',
        'processing_time_ms',
        'token_usage',
    ];

    protected $casts = [
        'tool_input' => 'array',
        'tool_output' => 'array',
        'token_usage' => 'array',
        'confidence_score' => 'decimal:2',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiSession::class, 'ai_session_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
