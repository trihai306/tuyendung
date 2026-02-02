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
        Schema::create('zalo_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zalo_account_id')->nullable()->constrained('zalo_accounts')->nullOnDelete();
            $table->string('external_account_id')->index(); // ownId from zalo-service
            $table->string('thread_id')->index(); // user ID or group ID
            $table->enum('thread_type', ['user', 'group'])->default('user');
            $table->string('sender_id')->nullable();
            $table->string('sender_name')->nullable();
            $table->text('content');
            $table->enum('direction', ['inbound', 'outbound'])->default('inbound');
            $table->json('raw_data')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            // Composite index for efficient queries
            $table->index(['external_account_id', 'thread_id', 'received_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zalo_messages');
    }
};
