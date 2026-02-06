<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'created_by_user_id',
        'assigned_user_id',
        'full_name',
        'email',
        'phone',
        'avatar_url',
        'source',
        'source_channel_id',
        'source_conversation_id',
        'resume_url',
        'resume_text',
        'profile_data',
        'tags',
        'notes',
        'rating',
        'status',
    ];

    protected $casts = [
        'profile_data' => 'array',
        'tags' => 'array',
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    /**
     * Company that owns this candidate
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * User who created this candidate
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * User responsible for this candidate (for member-level filtering)
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function sourceChannel(): BelongsTo
    {
        return $this->belongsTo(Channel::class, 'source_channel_id');
    }

    public function sourceConversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'source_conversation_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    /**
     * Scope by company
     */
    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Scope for member access - only candidates assigned to them or created by them
     */
    public function scopeForMember($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('assigned_user_id', $userId)
                ->orWhere('created_by_user_id', $userId);
        });
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSource($query, string $source)
    {
        return $query->where('source', $source);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('full_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Find duplicate candidate within same company
     */
    public static function findDuplicate(int $companyId, ?string $email = null, ?string $phone = null): ?self
    {
        if (!$email && !$phone) {
            return null;
        }

        return static::query()
            ->where('company_id', $companyId)
            ->where(function ($q) use ($email, $phone) {
                if ($email) {
                    $q->orWhere('email', $email);
                }
                if ($phone) {
                    $q->orWhere('phone', $phone);
                }
            })
            ->first();
    }

    /**
     * Check if user can access this candidate
     */
    public function isAccessibleBy(User $user): bool
    {
        // Check if user belongs to same company
        if ($user->company_id !== $this->company_id) {
            return false;
        }

        $role = $user->company_role;

        // Owner and Admin can see all candidates
        if (in_array($role, ['owner', 'admin'])) {
            return true;
        }

        // Member can only see their own candidates
        return $this->assigned_user_id === $user->id || $this->created_by_user_id === $user->id;
    }
}
