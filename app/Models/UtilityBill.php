<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UtilityBill extends Model
{
    protected $fillable = [
        'contract_id',
        'type',
        'amount',
        'old_index',
        'new_index',
        'period_month',
        'period_year',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:0',
            'old_index' => 'decimal:2',
            'new_index' => 'decimal:2',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(TenantContract::class, 'contract_id');
    }

    public function getUsageAttribute(): float
    {
        return ($this->new_index ?? 0) - ($this->old_index ?? 0);
    }
}
