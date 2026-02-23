<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('task_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recruitment_task_id')->constrained()->cascadeOnDelete();
            $table->string('candidate_name');
            $table->string('candidate_phone')->nullable();
            $table->string('candidate_email')->nullable();
            $table->enum('status', ['hired', 'trial', 'rejected'])->default('hired');
            $table->text('notes')->nullable();
            $table->date('hired_date')->nullable();
            $table->timestamps();

            $table->index('recruitment_task_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_candidates');
    }
};
