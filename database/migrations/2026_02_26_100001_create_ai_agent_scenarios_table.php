<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ai_agent_scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_agent_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('trigger_type', ['manual', 'scheduled', 'event'])->default('manual');
            $table->json('trigger_config')->nullable();
            $table->json('actions');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->unsignedInteger('run_count')->default(0);
            $table->timestamps();

            $table->index(['ai_agent_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agent_scenarios');
    }
};
