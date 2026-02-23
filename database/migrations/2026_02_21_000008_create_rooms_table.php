<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landlord_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('room_type', ['single', 'shared', 'apartment', 'mini_apartment'])->default('single');
            $table->decimal('price', 12, 0); // VND monthly
            $table->decimal('area_sqm', 8, 2)->nullable();
            $table->string('address');
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->json('amenities')->nullable(); // wifi, parking, washer, ac, etc.
            $table->json('images')->nullable();
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->integer('max_tenants')->default(1);
            $table->decimal('electricity_price', 10, 0)->nullable(); // per kWh
            $table->decimal('water_price', 10, 0)->nullable(); // per m3
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'city']);
            $table->index('price');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
