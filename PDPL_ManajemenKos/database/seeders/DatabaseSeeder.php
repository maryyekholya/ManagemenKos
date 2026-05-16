<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Urutan penting: User → Kamar → Booking (karena foreign key)
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            KamarSeeder::class,
            BookingSeeder::class,
        ]);
    }
}
