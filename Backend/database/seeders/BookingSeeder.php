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

        // Booking aktif — kamar 102 sedang dihuni
        Booking::firstOrCreate(
            ['kamar_id' => $kamar102->id, 'user_id' => $user->id],
            [
                'user_name'    => $user->name,
                'tgl_masuk'    => '2025-01-15',
                'tgl_keluar'   => '2025-07-15',
                'durasi_bulan' => 6,
                'status'       => 'DIHUNI',
                'total'        => 9000000,
                'metode_bayar' => 'QRIS',
            ]
        );

        // Booking menunggu konfirmasi — kamar 202 dipesan
        if ($kamar202) {
            Booking::firstOrCreate(
                ['kamar_id' => $kamar202->id, 'user_id' => $user->id],
                [
                    'user_name'    => $user->name,
                    'tgl_masuk'    => now()->addDays(7)->toDateString(),
                    'tgl_keluar'   => now()->addMonths(3)->addDays(7)->toDateString(),
                    'durasi_bulan' => 3,
                    'status'       => 'DIPESAN',
                    'total'        => 6000000,
                    'metode_bayar' => 'Transfer',
                ]
            );
        }

        $this->command->info('✅ BookingSeeder: 2 booking demo dibuat.');
    }
}
