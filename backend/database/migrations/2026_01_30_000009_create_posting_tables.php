<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('post_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('platform', ['facebook', 'zalo', 'all'])->default('all');
            $table->text('content_template');
            $table->json('media_urls')->nullable();
            $table->string('cta_type', 50)->nullable();
            $table->text('cta_url')->nullable();
            $table->timestamps();
        });

        Schema::create('scheduled_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('recruitment_jobs')->onDelete('cascade');
            $table->foreignId('template_id')->nullable()->constrained('post_templates')->nullOnDelete();
            $table->foreignId('channel_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->json('media_urls')->nullable();
            $table->timestamp('scheduled_at');
            $table->enum('status', ['pending', 'approved', 'published', 'failed', 'cancelled'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->string('external_post_id')->nullable();
            $table->json('metrics')->nullable();
            $table->text('error_message')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_posts');
        Schema::dropIfExists('post_templates');
    }
};
