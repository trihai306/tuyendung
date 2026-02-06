<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('candidates', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            }
            if (!Schema::hasColumn('candidates', 'created_by_user_id')) {
                $table->foreignId('created_by_user_id')->nullable()->after('company_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('candidates', 'assigned_user_id')) {
                $table->foreignId('assigned_user_id')->nullable()->after('created_by_user_id')->constrained('users')->nullOnDelete();
            }
        });

        // Migrate data: set company_id from user's company
        DB::statement('
            UPDATE candidates c
            JOIN users u ON c.user_id = u.id
            SET c.company_id = u.company_id,
                c.created_by_user_id = u.id
            WHERE c.company_id IS NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['created_by_user_id']);
            $table->dropForeign(['assigned_user_id']);
            $table->dropColumn(['company_id', 'created_by_user_id', 'assigned_user_id']);
        });
    }
};
