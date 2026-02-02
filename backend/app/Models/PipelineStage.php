<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PipelineStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'color',
        'sort_order',
        'is_system',
        'auto_actions',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'auto_actions' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'stage_id');
    }

    public static function getDefaultStages(): array
    {
        return [
            ['name' => 'Mới', 'slug' => 'new', 'color' => '#6B7280', 'is_system' => true],
            ['name' => 'Sàng lọc', 'slug' => 'screening', 'color' => '#3B82F6', 'is_system' => false],
            ['name' => 'Phỏng vấn', 'slug' => 'interview', 'color' => '#8B5CF6', 'is_system' => false],
            ['name' => 'Đề nghị', 'slug' => 'offer', 'color' => '#F59E0B', 'is_system' => false],
            ['name' => 'Đã tuyển', 'slug' => 'hired', 'color' => '#10B981', 'is_system' => true],
            ['name' => 'Từ chối', 'slug' => 'rejected', 'color' => '#EF4444', 'is_system' => true],
        ];
    }
}
