<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RecruitmentJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'department',
        'location',
        'job_type',
        'salary_min',
        'salary_max',
        'salary_currency',
        'description',
        'requirements',
        'benefits',
        'screening_questions',
        'status',
        'published_at',
        'expires_at',
        'hired_count',
        'target_count',
    ];

    protected $casts = [
        'screening_questions' => 'array',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($job) {
            if (empty($job->slug)) {
                $job->slug = Str::slug($job->title) . '-' . Str::random(6);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_id');
    }

    public function scheduledPosts(): HasMany
    {
        return $this->hasMany(ScheduledPost::class, 'job_id');
    }

    public function knowledgeDocuments(): HasMany
    {
        return $this->hasMany(KnowledgeDocument::class, 'job_id');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['open', 'paused']);
    }

    public function publish(): void
    {
        $this->update([
            'status' => 'open',
            'published_at' => now(),
        ]);
    }

    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    public function getSalaryRangeAttribute(): ?string
    {
        if (!$this->salary_min && !$this->salary_max) {
            return null;
        }

        $format = fn($val) => number_format($val, 0, '.', ',');

        if ($this->salary_min && $this->salary_max) {
            return "{$format($this->salary_min)} - {$format($this->salary_max)} {$this->salary_currency}";
        }

        return ($this->salary_min ? "Từ {$format($this->salary_min)}" : "Đến {$format($this->salary_max)}") . " {$this->salary_currency}";
    }
}
