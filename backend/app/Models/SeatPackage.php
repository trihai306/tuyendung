<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SeatPackage extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_per_seat',
        'duration_days',
        'features',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'price_per_seat' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format((float) $this->price_per_seat, 0, ',', '.') . ' ₫';
    }
}
