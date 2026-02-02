<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('recruitment_jobs')->onDelete('cascade');
            $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
            $table->foreignId('stage_id')->constrained('pipeline_stages');
            $table->json('screening_answers')->nullable();
            $table->timestamp('stage_entered_at')->useCurrent();
            $table->timestamp('interview_scheduled_at')->nullable();
            $table->text('interview_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->decimal('offer_amount', 15, 2)->nullable();
            $table->timestamp('hired_at')->nullable();
            $table->timestamps();

            $table->unique(['job_id', 'candidate_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
