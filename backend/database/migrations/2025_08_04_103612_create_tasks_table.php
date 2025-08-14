<?php
// database/migrations/2025_08_03_100000_create_tasks_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('estimated_minutes')->default(25)->comment('見積時間（分）');
            $table->integer('actual_minutes')->default(0)->comment('実際にかかった時間（分）');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['todo', 'in_progress', 'completed', 'cancelled'])->default('todo');
            $table->enum('day_of_week', ['todo', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])->default('todo');
            $table->integer('position')->default(0)->comment('Kanbanボード内での表示順序');
            $table->json('tags')->nullable()->comment('タグ');
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id']);
            $table->index(['status']);
            $table->index(['day_of_week']);
            $table->index(['priority']);
            $table->index(['due_date']);
            $table->index(['position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};