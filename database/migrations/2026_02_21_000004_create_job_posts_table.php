<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->enum('job_type', ['seasonal', 'office']);
            $table->foreignId('category_id')->nullable()->constrained('job_categories')->nullOnDelete();
            $table->decimal('salary_min', 12, 0)->nullable();
            $table->decimal('salary_max', 12, 0)->nullable();
            $table->enum('salary_type', ['hourly', 'daily', 'monthly'])->default('monthly');
            $table->string('location')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->text('requirements')->nullable();
            $table->text('benefits')->nullable();
            $table->integer('slots')->default(1);
            $table->date('deadline')->nullable();
            $table->enum('status', ['draft', 'active', 'closed', 'expired'])->default('draft');
            $table->string('work_schedule')->nullable(); // "08:00-17:00" or "Ca sáng, ca chiều"
            $table->enum('experience_level', ['none', 'under_1_year', '1_3_years', '3_5_years', 'over_5_years'])->default('none');
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'job_type']);
            $table->index('city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
