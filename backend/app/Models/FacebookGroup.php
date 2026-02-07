<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacebookGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform_account_id',
        'company_id',
        'group_id',
        'group_url',
        'name',
        'description',
        'member_count',
        'privacy',
        'role',
        'is_active',
        'auto_post_enabled',
        'last_post_at',
        'synced_at',
    ];

    protected $casts = [
        'member_count' => 'integer',
        'is_active' => 'boolean',
        'auto_post_enabled' => 'boolean',
        'last_post_at' => 'datetime',
        'synced_at' => 'datetime',
    ];

    // ===========================================
    // RELATIONSHIPS
    // ===========================================

    public function platformAccount(): BelongsTo
    {
        return $this->belongsTo(PlatformAccount::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    // ===========================================
    // SCOPES
    // ===========================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAutoPostEnabled($query)
    {
        return $query->where('auto_post_enabled', true);
    }

    public function scopeAdminRole($query)
    {
        return $query->whereIn('role', ['admin', 'moderator']);
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // ===========================================
    // HELPERS
    // ===========================================

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'moderator']);
    }

    public function markPostSent(): void
    {
        $this->update(['last_post_at' => now()]);
    }

    public function updateFromSync(array $data): void
    {
        $this->update([
            'name' => $data['name'] ?? $this->name,
            'description' => $data['description'] ?? $this->description,
            'member_count' => $data['member_count'] ?? $this->member_count,
            'privacy' => $data['privacy'] ?? $this->privacy,
            'role' => $data['role'] ?? $this->role,
            'synced_at' => now(),
        ]);
    }

    // ===========================================
    // ACCESSORS
    // ===========================================

    public function getPrivacyLabelAttribute(): string
    {
        return match ($this->privacy) {
            'public' => 'Công khai',
            'closed' => 'Riêng tư',
            'secret' => 'Bí mật',
            default => 'Không rõ',
        };
    }

    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            'admin' => 'Quản trị viên',
            'moderator' => 'Người kiểm duyệt',
            'member' => 'Thành viên',
            default => 'Thành viên',
        };
    }
}
