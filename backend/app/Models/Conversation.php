<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel_id',
        'external_thread_id',
        'participant_id',
        'participant_name',
        'participant_avatar',
        'participant_metadata',
        'status',
        'assigned_to',
        'assigned_at',
        'priority',
        'tags',
        'last_message_at',
        'last_message_preview',
        'unread_count',
        'sla_deadline_at',
        'candidate_id',
    ];

    protected $casts = [
        'participant_metadata' => 'array',
        'tags' => 'array',
        'last_message_at' => 'datetime',
        'assigned_at' => 'datetime',
        'sla_deadline_at' => 'datetime',
    ];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function aiSession(): HasOne
    {
        return $this->hasOne(AiSession::class)->where('status', 'active');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function markAsRead(): void
    {
        $this->update(['unread_count' => 0]);
    }
}
