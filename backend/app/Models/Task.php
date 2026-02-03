<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    protected $fillable = [
        'company_id',
        'title',
        'description',
        'assigned_by',
        'assigned_to',
        'priority',
        'status',
        'progress',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'progress' => 'integer',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function assignedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->orderByDesc('created_at');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)->orderByDesc('created_at');
    }

    // Scopes
    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helpers
    public function isOverdue(): bool
    {
        return $this->status !== 'completed' && $this->due_date->isPast();
    }

    public function markAsOverdue(): void
    {
        if ($this->isOverdue() && $this->status !== 'overdue') {
            $this->update(['status' => 'overdue']);
        }
    }
}
