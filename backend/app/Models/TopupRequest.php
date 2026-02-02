<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TopupRequest extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'payment_method',
        'amount',
        'status',
        'transaction_id',
        'payment_data',
        'note',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_data' => 'array',
        'completed_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending' => 'Chờ xử lý',
            'processing' => 'Đang xử lý',
            'completed' => 'Hoàn thành',
            'failed' => 'Thất bại',
            'cancelled' => 'Đã hủy',
            default => $this->status,
        };
    }

    public function getStatusColor(): string
    {
        return match ($this->status) {
            'pending' => 'warning',
            'processing' => 'info',
            'completed' => 'success',
            'failed' => 'danger',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        $this->company->addBalance(
            $this->amount,
            'topup',
            'Nạp tiền qua ' . $this->payment_method,
            $this->user_id
        );
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function fail(): void
    {
        $this->update(['status' => 'failed']);
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 0, ',', '.') . ' ₫';
    }
}
