<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scheduled_group_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_id')->nullable()->constrained('recruitment_jobs')->nullOnDelete();
            $table->foreignId('zalo_account_id')->constrained()->onDelete('cascade');

            // Target groups (JSON array of group_ids or 'all')
            $table->json('target_groups');

            // Content
            $table->text('content');
            $table->json('media_urls')->nullable();
            $table->foreignId('template_id')->nullable()->constrained('post_templates')->nullOnDelete();

            // Schedule
            $table->timestamp('scheduled_at');
            $table->enum('repeat_type', ['once', 'daily', 'weekly', 'custom'])->default('once');
            $table->json('repeat_config')->nullable(); // For custom intervals

            // Status
            $table->enum('status', ['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->integer('success_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->json('results')->nullable(); // Detailed results per group

            // Audit
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('executed_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['company_id', 'status']);
            $table->index(['scheduled_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_group_posts');
    }
};
