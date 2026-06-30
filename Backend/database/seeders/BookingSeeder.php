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

        $bookings = [
            [
                'kamar_id' => $kamarA1->id,
                'user_id' => $budi->id,
                'user_name' => $budi->name,
                'tgl_masuk' => Carbon::now()->subDays(10)->toDateString(),
                'tgl_keluar' => Carbon::now()->addMonths(3)->toDateString(),
                'durasi_bulan' => 3,
                'status' => 'DIHUNI',
                'total' => $kamarA1->harga_dasar * 3,
                'metode_bayar' => 'TRANSFER',
                'catatan' => 'Booking untuk Budi',
            ],
            [
                'kamar_id' => $kamarB1->id,
                'user_id' => $siti->id,
                'user_name' => $siti->name,
                'tgl_masuk' => Carbon::now()->subDays(5)->toDateString(),
                'tgl_keluar' => Carbon::now()->addMonths(6)->toDateString(),
                'durasi_bulan' => 6,
                'status' => 'DIHUNI',
                'total' => $kamarB1->harga_dasar * 6,
                'metode_bayar' => 'QRIS',
                'catatan' => 'Booking untuk Siti',
            ]
        ];

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

        $this->command->info('✅ BookingSeeder: ' . count($bookings) . ' booking & payments dibuat.');
    }
}
