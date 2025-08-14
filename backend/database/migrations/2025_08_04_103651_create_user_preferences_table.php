<?php
// database/migrations/2025_08_03_103000_create_user_preferences_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('work_duration_minutes')->default(25);
            $table->integer('short_break_minutes')->default(5);
            $table->integer('long_break_minutes')->default(15);
            $table->integer('sessions_until_long_break')->default(4);
            $table->boolean('auto_start_breaks')->default(false);
            $table->boolean('auto_start_work')->default(false);
            $table->boolean('sound_enabled')->default(true);
            $table->boolean('notification_enabled')->default(true);
            $table->integer('daily_goal_sessions')->default(8);
            $table->enum('theme', ['light', 'dark', 'auto'])->default('auto');
            $table->timestamps();
            
            $table->unique(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};