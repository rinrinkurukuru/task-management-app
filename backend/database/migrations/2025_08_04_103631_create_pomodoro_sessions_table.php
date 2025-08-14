<?php
// database/migrations/2025_08_03_101000_create_pomodoro_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pomodoro_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('task_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('session_type', ['work', 'short_break', 'long_break']);
            $table->integer('planned_duration_minutes')->default(25);
            $table->integer('actual_duration_minutes');
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('paused_duration_minutes')->default(0);
            $table->text('notes')->nullable();
            $table->boolean('was_completed')->default(false);
            $table->integer('interruptions_count')->default(0);
            $table->timestamps();
            
            $table->index(['user_id']);
            $table->index(['task_id']);
            $table->index(['started_at']);
            $table->index(['session_type']);
            $table->index(['was_completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pomodoro_sessions');
    }
};