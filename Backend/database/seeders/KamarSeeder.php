<?php

namespace Database\Seeders;

use App\Models\Kamar;
use Illuminate\Database\Seeder;

/**
 * KamarSeeder — 5 kamar demo representatif.
 */
class KamarSeeder extends Seeder
{
    public function run(): void
    {
        $kamars = [
            [
                'nomor'       => '101',
                'tipe'        => 'Standard',
                'harga_dasar' => 1500000,
                'fasilitas'   => ['WiFi', 'Kipas Angin', 'Meja Belajar', 'Lemari'],
                'status'      => 'TERSEDIA',
                'foto_url'    => 'https://images.unsplash.com/photo-1522771739844-649f6d175d97?w=800&fit=crop',
                'lantai'      => 1,
                'deskripsi'   => 'Kamar nyaman di lantai 1 dengan pencahayaan alami.',
            ],
            [
                'nomor'       => '102',
                'tipe'        => 'Standard',
                'harga_dasar' => 1500000,
                'fasilitas'   => ['WiFi', 'Kipas Angin', 'Meja Belajar'],
                'status'      => 'DIHUNI',
                'foto_url'    => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&fit=crop',
                'lantai'      => 1,
                'deskripsi'   => 'Kamar Standard dengan suasana tenang.',
            ],
            [
                'nomor'       => '201',
                'tipe'        => 'Deluxe',
                'harga_dasar' => 2000000,
                'fasilitas'   => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV'],
                'status'      => 'TERSEDIA',
                'foto_url'    => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&fit=crop',
                'lantai'      => 2,
                'deskripsi'   => 'Kamar Deluxe dengan kamar mandi pribadi dan AC.',
            ],
            [
                'nomor'       => '202',
                'tipe'        => 'Deluxe',
                'harga_dasar' => 2000000,
                'fasilitas'   => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV'],
                'status'      => 'DIPESAN',
                'foto_url'    => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fit=crop',
                'lantai'      => 2,
                'deskripsi'   => 'Kamar Deluxe view taman yang asri.',
            ],
            [
                'nomor'       => '301',
                'tipe'        => 'Suite',
                'harga_dasar' => 2500000,
                'fasilitas'   => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas Mini', 'Balkon'],
                'status'      => 'TERSEDIA',
                'foto_url'    => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&fit=crop',
                'lantai'      => 3,
                'deskripsi'   => 'Kamar Suite luas dengan balkon pribadi.',
            ],
            [
                'nomor'       => '302',
                'tipe'        => 'Suite',
                'harga_dasar' => 2500000,
                'fasilitas'   => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas Mini', 'Balkon'],
                'status'      => 'DIHUNI',
                'foto_url'    => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&fit=crop',
                'lantai'      => 3,
                'deskripsi'   => 'Kamar Suite dengan view kota dan ventilasi maksimal.',
            ],
            [
                'nomor'       => '401',
                'tipe'        => 'Suite',
                'harga_dasar' => 3500000,
                'fasilitas'   => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV Besar', 'Kulkas Besar', 'Rooftop Access'],
                'status'      => 'TERSEDIA',
                'foto_url'    => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&fit=crop',
                'lantai'      => 4,
                'deskripsi'   => 'Kamar eksklusif di lantai teratas dengan akses ke area rooftop.',
            ],
            [
                'nomor'       => '402',
                'tipe'        => 'Suite',
                'harga_dasar' => 3500000,
                'fasilitas'   => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV Besar', 'Kulkas Besar', 'Rooftop Access'],
                'status'      => 'TERSEDIA',
                'foto_url'    => 'https://images.unsplash.com/photo-1522771739844-649f6d175d97?w=800&fit=crop',
                'lantai'      => 4,
                'deskripsi'   => 'Kamar eksklusif yang sangat privat dan tenang.',
            ],
        ];

        foreach ($kamars as $data) {
            Kamar::firstOrCreate(['nomor' => $data['nomor']], $data);
        }

        $this->command->info('✅ KamarSeeder: ' . count($kamars) . ' kamar dibuat.');
    }
}
