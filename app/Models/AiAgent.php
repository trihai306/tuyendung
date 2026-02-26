<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiAgent extends Model
{
    protected $fillable = [
        'employer_profile_id',
        'created_by',
        'name',
        'type',
        'description',
        'avatar',
        'status',
        'is_global',
        'config',
        'schedule',
        'stats',
        'last_active_at',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'schedule' => 'array',
            'stats' => 'array',
            'is_global' => 'boolean',
            'last_active_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function employerProfile(): BelongsTo
    {
        return $this->belongsTo(EmployerProfile::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scenarios(): HasMany
    {
        return $this->hasMany(AiAgentScenario::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AiAgentLog::class);
    }

    public function companyActivations(): HasMany
    {
        return $this->hasMany(CompanyAiAgent::class);
    }

    // --- Scopes ---

    public function scopeGlobal($query)
    {
        return $query->where('is_global', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // --- Helpers ---

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isActivatedBy(int $companyId): bool
    {
        return $this->companyActivations()
            ->where('employer_profile_id', $companyId)
            ->where('is_active', true)
            ->exists();
    }

    public function getCompanyConfig(int $companyId): ?array
    {
        $pivot = $this->companyActivations()
            ->where('employer_profile_id', $companyId)
            ->first();

        return $pivot?->config;
    }

    public function getActiveScenarioCount(): int
    {
        return $this->scenarios()->where('is_active', true)->count();
    }

    public function getTodayLogCount(): int
    {
        return $this->logs()->whereDate('executed_at', today())->count();
    }

    public function getSuccessRate(): float
    {
        $total = $this->logs()->count();
        if ($total === 0) {
            return 0;
        }
        $success = $this->logs()->where('status', 'success')->count();

        return round(($success / $total) * 100, 1);
    }
}
