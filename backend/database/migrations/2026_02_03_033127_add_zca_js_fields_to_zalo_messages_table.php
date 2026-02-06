<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Add zca-js compatible fields to zalo_messages table
     * Based on official TMessage structure from zca-js docs
     */
    public function up(): void
    {
        Schema::table('zalo_messages', function (Blueprint $table) {
            // Message identifiers (from TMessage)
            $table->string('msg_id')->nullable()->after('id')->index();
            $table->string('cli_msg_id')->nullable()->after('msg_id');

            // Message type
            $table->string('msg_type')->nullable()->after('thread_type');

            // Rename semantic: sender_id is actually uid_from, d_name is sender display name
            // Keep sender_id and sender_name for backward compatibility
            // uid_from = sender's Zalo user ID
            // d_name = sender's display name (same as sender_name)

            // Additional receiver info
            $table->string('id_to')->nullable()->after('sender_name')->comment('Receiver ID');

            // Quote/Reply support (from TMessage.quote)
            $table->json('quote_data')->nullable()->after('content');

            // Mentions for group messages (from TGroupMessage.mentions)
            $table->json('mentions')->nullable()->after('quote_data');

            // Original timestamp from Zalo
            $table->string('ts')->nullable()->after('received_at')->comment('Original Zalo timestamp');
        });
    }

    public function down(): void
    {
        Schema::table('zalo_messages', function (Blueprint $table) {
            $table->dropColumn([
                'msg_id',
                'cli_msg_id',
                'msg_type',
                'id_to',
                'quote_data',
                'mentions',
                'ts',
            ]);
        });
    }
};
