<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('utility_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('tenant_contracts')->cascadeOnDelete();
            $table->enum('type', ['electric', 'water', 'internet', 'other']);
            $table->decimal('amount', 12, 0);
            $table->decimal('old_index', 10, 2)->nullable(); // meter reading
            $table->decimal('new_index', 10, 2)->nullable();
            $table->unsignedTinyInteger('period_month');
            $table->unsignedSmallInteger('period_year');
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utility_bills');
    }
};
