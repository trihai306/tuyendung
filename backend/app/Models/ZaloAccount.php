<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ZaloAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'own_id',
        'phone',
        'display_name',
        'avatar',
        'status',
        'credentials',
        'proxy_url',
        'webhook_config',
        'last_active_at',
    ];

    protected $casts = [
        'credentials' => 'array',
        'webhook_config' => 'array',
        'last_active_at' => 'datetime',
    ];

    /**
     * Status constants
     */
    const STATUS_CONNECTED = 'connected';
    const STATUS_DISCONNECTED = 'disconnected';
    const STATUS_CONNECTING = 'connecting';

    /**
     * Get the company that owns the Zalo account.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the groups for this Zalo account.
     */
    public function groups(): HasMany
    {
        return $this->hasMany(ZaloGroup::class);
    }

    /**
     * Get the user that owns this Zalo account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for connected accounts.
     */
    public function scopeConnected($query)
    {
        return $query->where('status', self::STATUS_CONNECTED);
    }

    /**
     * Check if account is connected.
     */
    public function isConnected(): bool
    {
        return $this->status === self::STATUS_CONNECTED;
    }

    /**
     * Mark account as connected.
     */
    public function markAsConnected(): void
    {
        $this->update([
            'status' => self::STATUS_CONNECTED,
            'last_active_at' => now(),
        ]);
    }

    /**
     * Mark account as disconnected.
     */
    public function markAsDisconnected(): void
    {
        $this->update([
            'status' => self::STATUS_DISCONNECTED,
        ]);
    }
}
