<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('scheduled_posts', function (Blueprint $table) {
            $table->foreignId('platform_account_id')->nullable()->after('channel_id')->constrained('platform_accounts')->nullOnDelete();
        });

        Schema::table('post_templates', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('scheduled_posts', function (Blueprint $table) {
            $table->dropForeign(['platform_account_id']);
            $table->dropColumn('platform_account_id');
        });

        Schema::table('post_templates', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn('company_id');
        });
    }
};
