<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->json('work_dates')->nullable()->after('due_date');
            $table->json('work_shifts')->nullable()->after('work_dates');
        });
    }

    public function down(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->dropColumn(['work_dates', 'work_shifts']);
        });
    }
};
