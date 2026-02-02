<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zalo_users', function (Blueprint $table) {
            $table->boolean('is_group')->default(false)->after('gender');
            $table->json('profile_data')->nullable()->after('raw_data');
        });
    }

    public function down(): void
    {
        Schema::table('zalo_users', function (Blueprint $table) {
            $table->dropColumn(['is_group', 'profile_data']);
        });
    }
};
