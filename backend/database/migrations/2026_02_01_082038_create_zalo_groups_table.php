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
        Schema::create('zalo_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zalo_account_id')->constrained()->onDelete('cascade');
            $table->string('group_id')->comment('Zalo group ID');
            $table->string('name');
            $table->unsignedInteger('member_count')->default(0);
            $table->string('avatar')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->unique(['zalo_account_id', 'group_id']);
            $table->index('group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zalo_groups');
    }
};
