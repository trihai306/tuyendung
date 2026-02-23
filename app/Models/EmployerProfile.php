<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class EmployerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'company_logo',
        'industry',
        'company_size',
        'address',
        'district',
        'city',
        'description',
        'tax_code',
        'website',
        'contact_phone',
        'contact_email',
        'invite_code',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (EmployerProfile $profile): void {
            if (empty($profile->invite_code)) {
                $profile->invite_code = self::generateUniqueCode();
            }
        });
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (self::where('invite_code', $code)->exists());

        return $code;
    }

    public function regenerateInviteCode(): string
    {
        $this->invite_code = self::generateUniqueCode();
        $this->save();

        return $this->invite_code;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(CompanyMember::class);
    }

    public function recruitmentTasks(): HasMany
    {
        return $this->hasMany(RecruitmentTask::class);
    }
}
