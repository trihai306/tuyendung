<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobCategory extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'parent_id', 'sort_order'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(JobCategory::class, 'parent_id');
    }

    public function jobPosts(): HasMany
    {
        return $this->hasMany(JobPost::class, 'category_id');
    }
}
