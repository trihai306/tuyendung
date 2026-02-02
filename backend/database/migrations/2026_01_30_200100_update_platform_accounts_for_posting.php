<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('platform_accounts', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->string('name')->nullable()->after('company_id');
            $table->json('credentials')->nullable()->after('permissions');
            $table->boolean('is_active')->default(true)->after('status');
            $table->boolean('is_default')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('platform_accounts', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn(['company_id', 'name', 'credentials', 'is_active', 'is_default']);
        });
    }
};
