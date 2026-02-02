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
        Schema::create('zalo_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('own_id')->unique()->comment('Zalo user ID');
            $table->string('phone')->nullable();
            $table->string('display_name')->nullable();
            $table->string('avatar')->nullable();
            $table->enum('status', ['connected', 'disconnected', 'connecting'])->default('disconnected');
            $table->string('proxy_url')->nullable();
            $table->json('webhook_config')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zalo_accounts');
    }
};
