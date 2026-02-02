<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('channel_id')->constrained()->onDelete('cascade');
            $table->string('external_thread_id')->nullable();
            $table->string('participant_id');
            $table->string('participant_name')->nullable();
            $table->text('participant_avatar')->nullable();
            $table->json('participant_metadata')->nullable();
            $table->enum('status', ['open', 'pending', 'resolved', 'spam'])->default('open');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->json('tags')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->string('last_message_preview', 500)->nullable();
            $table->unsignedInteger('unread_count')->default(0);
            $table->timestamp('sla_deadline_at')->nullable();
            $table->foreignId('candidate_id')->nullable();
            $table->timestamps();

            $table->index(['channel_id', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('last_message_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
