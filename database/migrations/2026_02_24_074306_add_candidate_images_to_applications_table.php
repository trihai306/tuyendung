<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('candidate_photo')->nullable()->after('candidate_phone');
            $table->string('candidate_id_card_front')->nullable()->after('candidate_photo');
            $table->string('candidate_id_card_back')->nullable()->after('candidate_id_card_front');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['candidate_photo', 'candidate_id_card_front', 'candidate_id_card_back']);
        });
    }
};
