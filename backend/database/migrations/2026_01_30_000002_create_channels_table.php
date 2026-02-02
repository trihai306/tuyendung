<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_account_id')->constrained()->onDelete('cascade');
            $table->enum('channel_type', ['page', 'group', 'oa', 'direct']);
            $table->string('channel_id');
            $table->string('channel_name')->nullable();
            $table->text('avatar_url')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->unique(['platform_account_id', 'channel_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
