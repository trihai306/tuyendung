<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        // External candidate columns and nullable candidate_id already applied.
        // Unique index already dropped via tinker.
    }

    public function down(): void
    {
        //
    }
};
