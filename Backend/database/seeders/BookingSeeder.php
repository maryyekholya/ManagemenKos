<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Kamar;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $budi = User::where('email', 'budi.santoso@gmail.com')->first();
        $siti = User::where('email', 'siti.aminah@gmail.com')->first();
        
        $kamarA1 = Kamar::where('nomor', 'A1')->first();
        $kamarB1 = Kamar::where('nomor', 'B1')->first();

        if (!$budi || !$siti || !$kamarA1 || !$kamarB1) {
            $this->command->warn('Jalankan UserSeeder dan KamarSeeder terlebih dahulu.');
            return;
        }

        $bookings = [];

        foreach ($bookings as $data) {
            $booking = Booking::create($data);
            
            // Buat record payment agar valid
            \App\Models\Payment::create([
                'booking_id' => $booking->id,
                'jumlah' => $booking->total,
                'metode' => $booking->metode_bayar,
                'status' => 'SUCCESS',
                'tanggal' => $booking->tgl_masuk,
                'midtrans_id' => 'DUMMY-' . rand(1000, 9999),
            ]);
        }

        $this->command->info('✅ BookingSeeder: ' . count($bookings) . ' booking & payments dibuat (Dikosongkan untuk testing awal).');
    }
}
