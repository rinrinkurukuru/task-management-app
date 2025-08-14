<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'estimated_minutes',
        'actual_minutes',
        'priority',
        'status',
        'day_of_week',
        'position',
        'tags',
        'due_date',
        'completed_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'due_date' => 'date',
        'completed_at' => 'datetime',
    ];

    // リレーション
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pomodoroSessions(): HasMany
    {
        return $this->hasMany(PomodoroSession::class);
    }

    public function timeEstimates(): HasMany
    {
        return $this->hasMany(TimeEstimate::class);
    }
}