<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    protected $fillable = [
        'job_post_id',
        'candidate_id',
        'candidate_name',
        'candidate_email',
        'candidate_phone',
        'source',
        'source_note',
        'social_links',
        'added_by',
        'cover_letter',
        'resume_url',
        'status',
        'employer_notes',
        'applied_at',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'social_links' => 'array',
        ];
    }

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    public function addedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    /**
     * Get the display name of the candidate (system user or external).
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->candidate) {
            return $this->candidate->name ?? 'N/A';
        }
        return $this->candidate_name ?? 'N/A';
    }

    /**
     * Get the display email (system user or external).
     */
    public function getDisplayEmailAttribute(): ?string
    {
        if ($this->candidate) {
            return $this->candidate->email;
        }
        return $this->candidate_email;
    }

    /**
     * Check if this is an external (non-registered) candidate.
     */
    public function isExternal(): bool
    {
        return is_null($this->candidate_id);
    }
}
