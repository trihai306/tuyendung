<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('task_candidates', function (Blueprint $table) {
            $table->foreignId('application_id')->nullable()->after('recruitment_task_id')
                ->constrained('applications')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('task_candidates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('application_id');
        });
    }
};
