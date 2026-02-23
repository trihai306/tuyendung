<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'roles',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'roles' => 'array',
        ];
    }

    // ─── Role Helpers ───

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles ?? []);
    }

    public function isCandidate(): bool
    {
        return $this->hasRole('candidate');
    }

    public function isEmployer(): bool
    {
        return $this->hasRole('employer');
    }

    public function isLandlord(): bool
    {
        return $this->hasRole('landlord');
    }

    public function addRole(string $role): void
    {
        $roles = $this->roles ?? [];
        if (!in_array($role, $roles)) {
            $roles[] = $role;
            $this->update(['roles' => $roles]);
        }
    }

    // ─── Relationships ───

    public function candidateProfile(): HasOne
    {
        return $this->hasOne(CandidateProfile::class);
    }

    public function employerProfile(): HasOne
    {
        return $this->hasOne(EmployerProfile::class);
    }

    public function jobPosts(): HasMany
    {
        return $this->hasMany(JobPost::class, 'employer_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'candidate_id');
    }

    public function savedJobs(): HasMany
    {
        return $this->hasMany(SavedJob::class);
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'landlord_id');
    }

    public function tenantContracts(): HasMany
    {
        return $this->hasMany(TenantContract::class, 'tenant_id');
    }
}
