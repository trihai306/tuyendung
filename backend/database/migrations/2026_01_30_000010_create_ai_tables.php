<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ai_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_id')->nullable()->constrained('recruitment_jobs')->nullOnDelete();
            $table->enum('mode', ['rule_based', 'llm_agent']);
            $table->enum('status', ['active', 'paused', 'completed'])->default('active');
            $table->json('context')->nullable();
            $table->string('current_step')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('message_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('action_type', ['generate', 'tool_call', 'approve', 'reject', 'edit', 'auto_send']);
            $table->text('input_prompt')->nullable();
            $table->string('tool_name')->nullable();
            $table->json('tool_input')->nullable();
            $table->json('tool_output')->nullable();
            $table->text('generated_response')->nullable();
            $table->text('final_response')->nullable();
            $table->decimal('confidence_score', 3, 2)->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('processing_time_ms')->nullable();
            $table->json('token_usage')->nullable();
            $table->timestamps();

            $table->index(['ai_session_id', 'created_at']);
        });

        Schema::create('knowledge_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('category', ['faq', 'policy', 'job_info', 'company']);
            $table->string('title');
            $table->text('content');
            $table->foreignId('job_id')->nullable()->constrained('recruitment_jobs')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_documents');
        Schema::dropIfExists('ai_audit_logs');
        Schema::dropIfExists('ai_sessions');
    }
};
