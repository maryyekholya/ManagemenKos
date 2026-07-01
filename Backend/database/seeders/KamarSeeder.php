<?php

namespace Database\Seeders;

use App\Models\Kamar;
use Illuminate\Database\Seeder;

class KamarSeeder extends Seeder
{
    public function run(): void
    {
        $kamars = [
            // Lantai 1: Standard
            ['nomor' => 'A1', 'tipe' => 'Standard', 'harga_dasar' => 1500000, 'fasilitas' => ['WiFi', 'Kipas Angin', 'Lemari'], 'status' => 'TERSEDIA', 'lantai' => 1],
            
            // Lantai 2: Deluxe
            ['nomor' => 'B1', 'tipe' => 'Deluxe', 'harga_dasar' => 2000000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam'], 'status' => 'TERSEDIA', 'lantai' => 2],

            // Lantai 3: Suite
            ['nomor' => 'C1', 'tipe' => 'Suite', 'harga_dasar' => 2500000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV'], 'status' => 'TERSEDIA', 'lantai' => 3],
        ];

        foreach ($kamars as $data) {
            Kamar::firstOrCreate(['nomor' => $data['nomor']], $data);
        }

        $this->command->info('✅ KamarSeeder: ' . count($kamars) . ' kamar dibuat.');
    }
}
