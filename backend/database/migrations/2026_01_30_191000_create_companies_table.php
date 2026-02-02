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
        Schema::table('companies', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('companies', 'description')) {
                $table->text('description')->nullable()->after('logo');
            }
            if (!Schema::hasColumn('companies', 'industry')) {
                $table->string('industry')->nullable()->after('description');
            }
            if (!Schema::hasColumn('companies', 'size')) {
                $table->string('size')->default('1-10')->after('industry');
            }
            if (!Schema::hasColumn('companies', 'website')) {
                $table->string('website')->nullable()->after('size');
            }
            if (!Schema::hasColumn('companies', 'owner_id')) {
                $table->foreignId('owner_id')->nullable()->after('address')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('companies', 'settings')) {
                $table->json('settings')->nullable()->after('owner_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['description', 'industry', 'size', 'website', 'owner_id', 'settings']);
        });
    }
};
