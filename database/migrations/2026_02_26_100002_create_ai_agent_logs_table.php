<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ai_agent_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_agent_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scenario_id')->nullable()->constrained('ai_agent_scenarios')->nullOnDelete();
            $table->string('action');
            $table->enum('status', ['success', 'failed', 'pending'])->default('pending');
            $table->json('input_data')->nullable();
            $table->json('output_data')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('executed_at')->useCurrent();
            $table->timestamps();

            $table->index(['ai_agent_id', 'status']);
            $table->index('executed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agent_logs');
    }
};
