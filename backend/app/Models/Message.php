<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'external_message_id',
        'direction',
        'sender_type',
        'sender_id',
        'sender_name',
        'content_type',
        'content',
        'attachments',
        'metadata',
        'status',
        'error_message',
        'ai_generated',
        'ai_session_id',
        'idempotency_key',
        'platform_timestamp',
    ];

    protected $casts = [
        'attachments' => 'array',
        'metadata' => 'array',
        'ai_generated' => 'boolean',
        'platform_timestamp' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function aiSession(): BelongsTo
    {
        return $this->belongsTo(AiSession::class);
    }

    public function isInbound(): bool
    {
        return $this->direction === 'inbound';
    }

    public function isOutbound(): bool
    {
        return $this->direction === 'outbound';
    }

    public function markAsSent(): void
    {
        $this->update(['status' => 'sent']);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }
}
