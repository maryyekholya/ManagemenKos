<?php

namespace Database\Seeders;

use App\Models\Kamar;
use Illuminate\Database\Seeder;

class KamarSeeder extends Seeder
{
    public function run(): void
    {
        $kamars = [
            // Lantai 1: A1 - A5
            ['nomor' => 'A1', 'tipe' => 'Standard', 'harga_dasar' => 1500000, 'fasilitas' => ['WiFi', 'Kipas Angin', 'Lemari'], 'status' => 'DIHUNI', 'lantai' => 1],
            ['nomor' => 'A2', 'tipe' => 'Standard', 'harga_dasar' => 1500000, 'fasilitas' => ['WiFi', 'Kipas Angin', 'Lemari'], 'status' => 'TERSEDIA', 'lantai' => 1],
            ['nomor' => 'A3', 'tipe' => 'Standard', 'harga_dasar' => 1500000, 'fasilitas' => ['WiFi', 'Kipas Angin', 'Lemari'], 'status' => 'TERSEDIA', 'lantai' => 1],
            ['nomor' => 'A4', 'tipe' => 'Standard', 'harga_dasar' => 1500000, 'fasilitas' => ['WiFi', 'Kipas Angin', 'Lemari'], 'status' => 'TERSEDIA', 'lantai' => 1],
            ['nomor' => 'A5', 'tipe' => 'Standard', 'harga_dasar' => 1500000, 'fasilitas' => ['WiFi', 'Kipas Angin', 'Lemari'], 'status' => 'TERSEDIA', 'lantai' => 1],
            
            // Lantai 2: B1 - B4
            ['nomor' => 'B1', 'tipe' => 'Deluxe', 'harga_dasar' => 2000000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam'], 'status' => 'DIHUNI', 'lantai' => 2],
            ['nomor' => 'B2', 'tipe' => 'Deluxe', 'harga_dasar' => 2000000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam'], 'status' => 'TERSEDIA', 'lantai' => 2],
            ['nomor' => 'B3', 'tipe' => 'Deluxe', 'harga_dasar' => 2000000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam'], 'status' => 'TERSEDIA', 'lantai' => 2],
            ['nomor' => 'B4', 'tipe' => 'Deluxe', 'harga_dasar' => 2000000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam'], 'status' => 'TERSEDIA', 'lantai' => 2],

            // Lantai 3: C1 - C4
            ['nomor' => 'C1', 'tipe' => 'Suite', 'harga_dasar' => 2500000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV'], 'status' => 'TERSEDIA', 'lantai' => 3],
            ['nomor' => 'C2', 'tipe' => 'Suite', 'harga_dasar' => 2500000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV'], 'status' => 'TERSEDIA', 'lantai' => 3],
            ['nomor' => 'C3', 'tipe' => 'Suite', 'harga_dasar' => 2500000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV'], 'status' => 'TERSEDIA', 'lantai' => 3],
            ['nomor' => 'C4', 'tipe' => 'Suite', 'harga_dasar' => 2500000, 'fasilitas' => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV'], 'status' => 'TERSEDIA', 'lantai' => 3],
        ];

        foreach ($kamars as $data) {
            Kamar::firstOrCreate(['nomor' => $data['nomor']], $data);
        }

        $this->command->info('✅ KamarSeeder: ' . count($kamars) . ' kamar dibuat.');
    }
}
