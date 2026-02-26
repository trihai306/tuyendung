<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_to')->nullable()->after('added_by');
            $table->foreign('assigned_to')->references('id')->on('users')->nullOnDelete();
        });

        // Default: set assigned_to = added_by for existing records
        DB::table('applications')
            ->whereNotNull('added_by')
            ->whereNull('assigned_to')
            ->update(['assigned_to' => DB::raw('added_by')]);
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn('assigned_to');
        });
    }
};
