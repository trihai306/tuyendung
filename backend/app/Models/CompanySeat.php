<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanySeat extends Model
{
    protected $fillable = [
        'company_id',
        'total_seats',
        'used_seats',
        'price_per_seat',
        'starts_at',
        'expires_at',
        'status',
        'total_amount',
    ];

    protected $casts = [
        'price_per_seat' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function getAvailableSeatsAttribute(): int
    {
        return $this->total_seats - $this->used_seats;
    }

    public function getFormattedTotalAttribute(): string
    {
        return number_format((float) $this->total_amount, 0, ',', '.') . ' ₫';
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->expires_at > now();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('expires_at', '>', now());
    }
}
