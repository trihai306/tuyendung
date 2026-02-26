<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Step 1: Drop FK constraint if it exists (try-catch for safety)
        try {
            Schema::table('recruitment_tasks', function ($table) {
                $table->dropForeign(['assigned_to']);
            });
        } catch (\Exception $e) {
            // FK may not exist, ignore
        }

        // Step 2: Drop composite index if exists
        try {
            Schema::table('recruitment_tasks', function ($table) {
                $table->dropIndex(['assigned_to', 'status']);
            });
        } catch (\Exception $e) {
            // Index may not exist, ignore
        }

        // Step 3: Convert existing values to JSON arrays
        DB::statement("
            UPDATE recruitment_tasks
            SET assigned_to = CASE
                WHEN assigned_to IS NOT NULL THEN JSON_ARRAY(CAST(assigned_to AS UNSIGNED))
                ELSE JSON_ARRAY()
            END
        ");

        // Step 4: Change column type to JSON
        DB::statement("ALTER TABLE recruitment_tasks MODIFY assigned_to JSON NULL");
    }

    public function down(): void
    {
        // Extract first element and revert to bigint
        DB::statement("
            ALTER TABLE recruitment_tasks MODIFY assigned_to BIGINT UNSIGNED NULL
        ");
    }
};
