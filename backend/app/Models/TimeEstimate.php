<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEstimate extends Model
{
    use HasFactory;

    public $timestamps = false; // created_atのみ使用

    protected $fillable = [
        'user_id',
        'task_id',
        'estimated_minutes',
        'actual_minutes',
        'accuracy_percentage',
        'variance_minutes',
        'task_complexity',
    ];

    protected $casts = [
        'accuracy_percentage' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    // リレーション
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}