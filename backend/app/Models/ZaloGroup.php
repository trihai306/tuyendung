<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZaloGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'zalo_account_id',
        'group_id',
        'name',
        'member_count',
        'avatar',
        'synced_at',
    ];

    protected $casts = [
        'member_count' => 'integer',
        'synced_at' => 'datetime',
    ];

    /**
     * Get the Zalo account that owns this group.
     */
    public function zaloAccount(): BelongsTo
    {
        return $this->belongsTo(ZaloAccount::class);
    }

    /**
     * Get the company through the Zalo account.
     */
    public function company()
    {
        return $this->zaloAccount->company;
    }

    /**
     * Update group info from Zalo API response.
     */
    public function updateFromApi(array $data): void
    {
        $this->update([
            'name' => $data['name'] ?? $this->name,
            'member_count' => $data['member_count'] ?? $this->member_count,
            'avatar' => $data['avatar'] ?? $this->avatar,
            'synced_at' => now(),
        ]);
    }
}
