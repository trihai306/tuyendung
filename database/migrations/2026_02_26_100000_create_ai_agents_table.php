<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ai_agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['messaging', 'posting', 'recruiting']);
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->enum('status', ['active', 'paused', 'disabled'])->default('disabled');
            $table->json('config')->nullable();
            $table->json('schedule')->nullable();
            $table->json('stats')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();

            $table->index(['employer_profile_id', 'status']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agents');
    }
};
