<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'landlord_id',
        'title',
        'slug',
        'description',
        'room_type',
        'price',
        'area_sqm',
        'address',
        'district',
        'city',
        'lat',
        'lng',
        'amenities',
        'images',
        'status',
        'max_tenants',
        'electricity_price',
        'water_price',
        'views_count',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'images' => 'array',
            'price' => 'decimal:0',
            'area_sqm' => 'decimal:2',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'electricity_price' => 'decimal:0',
            'water_price' => 'decimal:0',
        ];
    }

    // ─── Relationships ───

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(TenantContract::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(RoomReview::class);
    }

    // ─── Scopes ───

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    // ─── Accessors ───

    public function getAverageRatingAttribute(): float
    {
        return $this->reviews()->avg('rating') ?? 0;
    }
}
