<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->unsignedInteger('target_quantity')->default(1)->after('priority');
        });
    }

    public function down(): void
    {
        Schema::table('recruitment_tasks', function (Blueprint $table) {
            $table->dropColumn('target_quantity');
        });
    }
};
