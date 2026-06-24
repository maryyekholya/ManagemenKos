<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Kamar;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * BookingSeeder — 2 booking demo dasar.
 */
class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $user   = User::where('email', 'user@nestin.id')->first();
        $kamar102 = Kamar::where('nomor', '102')->first();
        $kamar202 = Kamar::where('nomor', '202')->first();

        if (!$user || !$kamar102) {
            $this->command->warn('Jalankan UserSeeder dan KamarSeeder terlebih dahulu.');
            return;
        }

        // Bookings cleared

        $this->command->info('✅ BookingSeeder: 0 booking demo dibuat.');
    }
}
