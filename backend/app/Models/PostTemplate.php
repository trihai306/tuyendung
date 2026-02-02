<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PostTemplate extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'name',
        'platform',
        'content_template',
        'media_urls',
        'cta_type',
        'cta_url',
    ];

    protected $casts = [
        'media_urls' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scheduledPosts(): HasMany
    {
        return $this->hasMany(ScheduledPost::class, 'template_id');
    }

    /**
     * Parse template với dữ liệu job
     */
    public function parseContent(RecruitmentJob $job): string
    {
        $content = $this->content_template;

        $replacements = [
            '{job_title}' => $job->title,
            '{company_name}' => $job->company?->name ?? '',
            '{location}' => $job->location ?? '',
            '{salary_min}' => number_format($job->salary_min ?? 0, 0, ',', '.'),
            '{salary_max}' => number_format($job->salary_max ?? 0, 0, ',', '.'),
            '{salary_range}' => $job->getSalaryRangeAttribute(),
            '{job_type}' => $job->job_type ?? '',
            '{experience}' => $job->experience ?? '',
            '{deadline}' => $job->deadline?->format('d/m/Y') ?? '',
            '{requirements}' => strip_tags($job->requirements ?? ''),
            '{benefits}' => strip_tags($job->benefits ?? ''),
            '{description}' => strip_tags($job->description ?? ''),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $content);
    }
}
