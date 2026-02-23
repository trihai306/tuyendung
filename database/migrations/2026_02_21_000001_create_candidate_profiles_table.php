<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('candidate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->json('skills')->nullable();
            $table->integer('experience_years')->default(0);
            $table->string('education')->nullable();
            $table->string('resume_url')->nullable();
            $table->decimal('desired_salary', 12, 0)->nullable();
            $table->enum('job_type_preference', ['seasonal', 'office', 'both'])->default('both');
            $table->string('current_address')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_profiles');
    }
};
