<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('zalo_accounts', function (Blueprint $table) {
            $table->json('credentials')->nullable()->after('webhook_config')
                ->comment('Zalo login credentials (imei, cookie, userAgent)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zalo_accounts', function (Blueprint $table) {
            $table->dropColumn('credentials');
        });
    }
};
