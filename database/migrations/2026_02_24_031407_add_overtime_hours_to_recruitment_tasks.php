<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->unsignedTinyInteger('overtime_hours')->nullable()->after('work_shifts');
        });
    }

    public function down(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->dropColumn('overtime_hours');
        });
    }
};
