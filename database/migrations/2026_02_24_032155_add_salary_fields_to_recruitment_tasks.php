<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->unsignedInteger('shift_rate')->nullable()->after('overtime_hours');
            $table->unsignedInteger('overtime_rate')->nullable()->after('shift_rate');
        });
    }

    public function down(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->dropColumn(['shift_rate', 'overtime_rate']);
        });
    }
};
