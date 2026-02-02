<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('avatar_url')->nullable();
            $table->enum('source', ['chat', 'manual', 'import', 'referral'])->default('chat');
            $table->foreignId('source_channel_id')->nullable()->constrained('channels')->nullOnDelete();
            $table->foreignId('source_conversation_id')->nullable()->constrained('conversations')->nullOnDelete();
            $table->text('resume_url')->nullable();
            $table->text('resume_text')->nullable();
            $table->json('profile_data')->nullable();
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->enum('status', ['active', 'blacklisted', 'archived'])->default('active');
            $table->timestamps();

            $table->index('user_id');
            $table->index('email');
            $table->index('phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
