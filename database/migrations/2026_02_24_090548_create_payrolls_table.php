<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_candidate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recruitment_task_id')->constrained()->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedInteger('total_shifts')->default(0);
            $table->unsignedInteger('overtime_hours')->default(0);
            $table->decimal('shift_amount', 12, 0)->default(0);
            $table->decimal('overtime_amount', 12, 0)->default(0);
            $table->decimal('bonus', 12, 0)->default(0);
            $table->decimal('deduction', 12, 0)->default(0);
            $table->decimal('total_amount', 12, 0)->default(0);
            $table->enum('status', ['draft', 'confirmed', 'paid'])->default('draft');
            $table->datetime('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('recruitment_task_id');
            $table->index('task_candidate_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
