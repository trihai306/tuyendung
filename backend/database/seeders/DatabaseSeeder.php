<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Base seeders
        $this->call([
            PackageSeeder::class,
            SeatPackageSeeder::class,
        ]);

        // Demo data for testing
        $this->call([
            CompanySeeder::class,
            JobSeeder::class,
        ]);
    }
}
