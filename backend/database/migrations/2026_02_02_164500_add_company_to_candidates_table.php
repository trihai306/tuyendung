<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Add company_id for company-level access control
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->onDelete('cascade');

            // Rename user_id to created_by_user_id for clarity (who created this candidate)
            $table->renameColumn('user_id', 'created_by_user_id');

            // Add assigned_user_id for member-level access (who is responsible for this candidate)
            $table->foreignId('assigned_user_id')->nullable()->after('company_id')->constrained('users')->nullOnDelete();

            // Index for faster queries
            $table->index('company_id');
            $table->index('assigned_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['assigned_user_id']);
            $table->dropColumn(['company_id', 'assigned_user_id']);
            $table->renameColumn('created_by_user_id', 'user_id');
        });
    }
};
