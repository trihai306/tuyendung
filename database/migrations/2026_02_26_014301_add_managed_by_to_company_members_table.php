<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('company_members', function (Blueprint $table) {
            $table->unsignedBigInteger('managed_by')->nullable()->after('role');
            $table->foreign('managed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('company_members', function (Blueprint $table) {
            $table->dropForeign(['managed_by']);
            $table->dropColumn('managed_by');
        });
    }
};
