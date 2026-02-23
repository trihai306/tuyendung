<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPost extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employer_id',
        'title',
        'slug',
        'description',
        'job_type',
        'category_id',
        'salary_min',
        'salary_max',
        'salary_type',
        'location',
        'district',
        'city',
        'lat',
        'lng',
        'requirements',
        'benefits',
        'slots',
        'deadline',
        'status',
        'work_schedule',
        'experience_level',
        'views_count',
    ];

    protected function casts(): array
    {
        return [
            'salary_min' => 'decimal:0',
            'salary_max' => 'decimal:0',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'deadline' => 'date',
        ];
    }

    // ─── Relationships ───

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class, 'category_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    public function savedByUsers(): HasMany
    {
        return $this->hasMany(SavedJob::class);
    }

    // ─── Scopes ───

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSeasonal($query)
    {
        return $query->where('job_type', 'seasonal');
    }

    public function scopeOffice($query)
    {
        return $query->where('job_type', 'office');
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('city', $city);
    }
}
