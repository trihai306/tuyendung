<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ZaloUser Model
 * 
 * Caches Zalo user profile information fetched via getUserInfo API.
 * Used to display sender names and avatars in conversations.
 */
class ZaloUser extends Model
{
    protected $fillable = [
        'zalo_user_id',
        'display_name',
        'zalo_name',
        'avatar',
        'phone',
        'gender',
        'is_group',
        'raw_data',
        'profile_data',
        'fetched_at',
    ];

    protected $casts = [
        'raw_data' => 'array',
        'profile_data' => 'array',
        'is_group' => 'boolean',
        'fetched_at' => 'datetime',
    ];

    /**
     * Messages sent by this user
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ZaloMessage::class, 'sender_id', 'zalo_user_id');
    }

    /**
     * Check if profile is stale (older than 24 hours)
     */
    public function isStale(): bool
    {
        if (!$this->fetched_at) {
            return true;
        }
        return $this->fetched_at->diffInHours(now()) > 24;
    }

    /**
     * Get display name, fallback to zalo_name or Unknown
     */
    public function getNameAttribute(): string
    {
        return $this->display_name ?: $this->zalo_name ?: 'Unknown';
    }

    /**
     * Find or create from API response
     */
    public static function updateFromApiResponse(string $zaloUserId, array $profileData): self
    {
        return self::updateOrCreate(
            ['zalo_user_id' => $zaloUserId],
            [
                'display_name' => $profileData['displayName'] ?? null,
                'zalo_name' => $profileData['zaloName'] ?? null,
                'avatar' => $profileData['avatar'] ?? null,
                'phone' => $profileData['phoneNumber'] ?? null,
                'gender' => $profileData['gender'] ?? 0,
                'raw_data' => $profileData,
                'fetched_at' => now(),
            ]
        );
    }
}
