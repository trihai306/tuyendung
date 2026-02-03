<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('recruitment_jobs')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('target_assigned')->nullable()->comment('Số người được giao tìm');
            $table->unsignedInteger('found_count')->default(0)->comment('Số người đã tìm được');
            $table->unsignedInteger('confirmed_count')->default(0)->comment('Số người xác nhận đi làm');
            $table->text('notes')->nullable()->comment('Ghi chú của nhân viên');
            $table->enum('status', ['assigned', 'in_progress', 'completed'])->default('assigned');
            $table->timestamps();

            // Mỗi nhân viên chỉ được giao 1 lần cho 1 job
            $table->unique(['job_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_assignments');
    }
};
