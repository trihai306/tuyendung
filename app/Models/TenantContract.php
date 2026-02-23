<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenantContract extends Model
{
    protected $fillable = [
        'room_id',
        'tenant_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'deposit',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'monthly_rent' => 'decimal:0',
            'deposit' => 'decimal:0',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(RentPayment::class, 'contract_id');
    }

    public function utilityBills(): HasMany
    {
        return $this->hasMany(UtilityBill::class, 'contract_id');
    }
}
