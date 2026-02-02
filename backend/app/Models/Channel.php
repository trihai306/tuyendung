<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Channel extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform_account_id',
        'channel_type',
        'channel_id',
        'channel_name',
        'avatar_url',
        'settings',
        'is_active',
        'synced_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'synced_at' => 'datetime',
    ];

    public function platformAccount(): BelongsTo
    {
        return $this->belongsTo(PlatformAccount::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function scheduledPosts(): HasMany
    {
        return $this->hasMany(ScheduledPost::class);
    }

    public function getPlatformAttribute(): string
    {
        return $this->platformAccount->platform;
    }
}
