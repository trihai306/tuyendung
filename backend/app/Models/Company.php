<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'description',
        'industry',
        'size',
        'website',
        'address',
        'phone',
        'email',
        'tax_code',
        'owner_id',
        'settings',
        'status',
        'balance',
        'verification_status',
        'verified_at',
        'verification_notes',
    ];

    protected $casts = [
        'settings' => 'array',
        'balance' => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($company) {
            if (empty($company->slug)) {
                $company->slug = Str::slug($company->name) . '-' . Str::random(6);
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function recruitmentJobs(): HasMany
    {
        return $this->hasMany(RecruitmentJob::class);
    }

    public function admins(): HasMany
    {
        return $this->members()->whereIn('company_role', ['owner', 'admin']);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function topupRequests(): HasMany
    {
        return $this->hasMany(TopupRequest::class);
    }

    public function activeSubscription()
    {
        return $this->subscriptions()
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription() !== null;
    }

    public function addBalance(float $amount, string $type, string $description = null, $userId = null): WalletTransaction
    {
        $balanceBefore = $this->balance ?? 0;
        $this->increment('balance', $amount);

        return $this->walletTransactions()->create([
            'user_id' => $userId,
            'type' => $type,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
        ]);
    }

    public function deductBalance(float $amount, string $type, string $description = null, $userId = null): ?WalletTransaction
    {
        if (($this->balance ?? 0) < $amount) {
            return null;
        }

        $balanceBefore = $this->balance;
        $this->decrement('balance', $amount);

        return $this->walletTransactions()->create([
            'user_id' => $userId,
            'type' => $type,
            'amount' => -$amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
        ]);
    }

    public static function sizeOptions(): array
    {
        return [
            '1-10' => '1-10 nhân viên',
            '11-50' => '11-50 nhân viên',
            '51-200' => '51-200 nhân viên',
            '201-500' => '201-500 nhân viên',
            '500+' => 'Trên 500 nhân viên',
        ];
    }
}

