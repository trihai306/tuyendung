<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employer_profiles', function (Blueprint $table) {
            $table->string('invite_code', 8)->nullable()->unique()->after('contact_email');
        });

        // Generate invite codes for existing profiles
        $profiles = \App\Models\EmployerProfile::all();
        foreach ($profiles as $profile) {
            $profile->update(['invite_code' => strtoupper(Str::random(6))]);
        }
    }

    public function down(): void
    {
        Schema::table('employer_profiles', function (Blueprint $table) {
            $table->dropColumn('invite_code');
        });
    }
};
