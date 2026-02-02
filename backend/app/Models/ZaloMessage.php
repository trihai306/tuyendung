<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZaloMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'zalo_account_id',
        'external_account_id',
        'thread_id',
        'thread_type',
        'sender_id',
        'sender_name',
        'content',
        'direction',
        'raw_data',
        'received_at',
        'is_read',
    ];

    protected $casts = [
        'raw_data' => 'array',
        'received_at' => 'datetime',
        'is_read' => 'boolean',
    ];

    /**
     * Get the Zalo account this message belongs to
     */
    public function zaloAccount(): BelongsTo
    {
        return $this->belongsTo(ZaloAccount::class);
    }

    /**
     * Scope for inbound messages
     */
    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    /**
     * Scope for outbound messages
     */
    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    /**
     * Scope for unread messages
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for a specific thread
     */
    public function scopeForThread($query, string $threadId)
    {
        return $query->where('thread_id', $threadId);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(): void
    {
        $this->update(['is_read' => true]);
    }
}
