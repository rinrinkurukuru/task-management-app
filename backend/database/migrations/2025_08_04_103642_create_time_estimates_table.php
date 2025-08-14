<?php
// database/migrations/2025_08_03_102000_create_time_estimates_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_estimates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->integer('estimated_minutes');
            $table->integer('actual_minutes');
            $table->decimal('accuracy_percentage', 5, 2)->nullable()->comment('見積精度');
            $table->integer('variance_minutes')->nullable()->comment('差異（実績-見積）');
            $table->enum('task_complexity', ['simple', 'medium', 'complex'])->nullable();
            $table->timestamp('created_at')->nullable();
            
            $table->index(['user_id']);
            $table->index(['task_id']);
            $table->index(['accuracy_percentage']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_estimates');
    }
};