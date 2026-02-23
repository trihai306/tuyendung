<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'skills',
        'experience_years',
        'education',
        'resume_url',
        'desired_salary',
        'job_type_preference',
        'current_address',
        'district',
        'city',
        'date_of_birth',
        'gender',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'desired_salary' => 'decimal:0',
            'date_of_birth' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
