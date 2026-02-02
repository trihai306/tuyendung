<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->string('external_message_id')->nullable();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('sender_type', ['customer', 'agent', 'bot']);
            $table->string('sender_id')->nullable();
            $table->string('sender_name')->nullable();
            $table->enum('content_type', ['text', 'image', 'file', 'sticker', 'location', 'template'])->default('text');
            $table->text('content')->nullable();
            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('sent');
            $table->text('error_message')->nullable();
            $table->boolean('ai_generated')->default(false);
            $table->foreignId('ai_session_id')->nullable();
            $table->string('idempotency_key', 64)->unique()->nullable();
            $table->timestamp('platform_timestamp')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
