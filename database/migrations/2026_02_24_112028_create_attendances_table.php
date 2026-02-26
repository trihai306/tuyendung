<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_candidate_id')->constrained('task_candidates')->cascadeOnDelete();
            $table->foreignId('recruitment_task_id')->constrained('recruitment_tasks')->cascadeOnDelete();
            $table->date('work_date');
            $table->enum('status', ['present', 'absent', 'half_day', 'late'])->default('present');
            $table->unsignedInteger('shifts_worked')->default(1);
            $table->decimal('overtime_hours', 5, 1)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['task_candidate_id', 'work_date'], 'attendance_candidate_date_unique');
            $table->index(['recruitment_task_id', 'work_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
