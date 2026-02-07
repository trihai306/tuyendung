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
        Schema::create('facebook_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_account_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');

            $table->string('group_id');                    // FB group ID
            $table->string('group_url');                   // Full URL
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('member_count')->default(0);
            $table->string('privacy')->nullable();         // public, closed, secret
            $table->string('role')->nullable();            // admin, moderator, member

            $table->boolean('is_active')->default(true);
            $table->boolean('auto_post_enabled')->default(false);
            $table->timestamp('last_post_at')->nullable();
            $table->timestamp('synced_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->unique(['platform_account_id', 'group_id']);
            $table->index(['company_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_groups');
    }
};
