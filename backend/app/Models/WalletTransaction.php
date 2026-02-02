<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'reference',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'topup' => 'Nạp tiền',
            'purchase' => 'Mua gói',
            'refund' => 'Hoàn tiền',
            'bonus' => 'Thưởng',
            default => $this->type,
        };
    }

    public function getFormattedAmountAttribute(): string
    {
        $prefix = $this->amount > 0 ? '+' : '';
        return $prefix . number_format($this->amount, 0, ',', '.') . ' ₫';
    }

    public function scopeTopups($query)
    {
        return $query->where('type', 'topup');
    }

    public function scopePurchases($query)
    {
        return $query->where('type', 'purchase');
    }
}
