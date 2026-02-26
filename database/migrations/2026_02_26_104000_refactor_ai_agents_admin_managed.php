<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Make ai_agents admin-managed: employer_profile_id and created_by become nullable
        Schema::table('ai_agents', function (Blueprint $table) {
            $table->dropForeign(['employer_profile_id']);
            $table->dropForeign(['created_by']);

            $table->unsignedBigInteger('employer_profile_id')->nullable()->change();
            $table->unsignedBigInteger('created_by')->nullable()->change();
            $table->boolean('is_global')->default(true)->after('status');

            $table->foreign('employer_profile_id')->references('id')->on('employer_profiles')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        // Pivot table: which companies activated which agents
        Schema::create('company_ai_agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_agent_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->json('config')->nullable(); // Company-specific config overrides
            $table->timestamp('activated_at')->useCurrent();
            $table->timestamps();

            $table->unique(['employer_profile_id', 'ai_agent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_ai_agents');

        Schema::table('ai_agents', function (Blueprint $table) {
            $table->dropColumn('is_global');
        });
    }
};
