<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'type',
        'category',
        'title',
        'message',
        'link',
        'data',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    // ==================== SCOPES ====================

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // ==================== METHODS ====================

    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    // ==================== STATIC HELPERS ====================

    public static function createForUser(int $userId, array $data): self
    {
        return static::create([
            'user_id' => $userId,
            ...$data,
        ]);
    }

    public static function notify(int $userId, string $title, string $message, array $options = []): self
    {
        return static::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $options['type'] ?? 'info',
            'category' => $options['category'] ?? 'system',
            'link' => $options['link'] ?? null,
            'data' => $options['data'] ?? null,
            'company_id' => $options['company_id'] ?? null,
        ]);
    }
}
