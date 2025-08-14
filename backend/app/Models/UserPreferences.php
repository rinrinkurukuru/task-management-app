<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreferences extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'work_duration_minutes',
        'short_break_minutes',
        'long_break_minutes',
        'sessions_until_long_break',
        'auto_start_breaks',
        'auto_start_work',
        'sound_enabled',
        'notification_enabled',
        'daily_goal_sessions',
        'theme',
    ];

    protected $casts = [
        'auto_start_breaks' => 'boolean',
        'auto_start_work' => 'boolean',
        'sound_enabled' => 'boolean',
        'notification_enabled' => 'boolean',
    ];

    // リレーション
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}