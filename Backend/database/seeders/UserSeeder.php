<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            // Admin (1)
            [
                'name' => 'Sari Dewi',
                'email' => 'sari.dewi@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '081234567890',
                'address' => 'Jl. Cempaka No. 12, Bandung',
                'email_verified_at' => now(),
            ],
            // Manager (2)
            [
                'name' => 'Hendra Wijaya',
                'email' => 'hendra.wijaya@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'manager',
                'phone' => '081234567891',
                'address' => 'Jl. Melati No. 5, Bandung',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Dian Permatasari',
                'email' => 'dian.permata@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'manager',
                'phone' => '081234567892',
                'address' => 'Jl. Anggrek No. 8, Bandung',
                'email_verified_at' => now(),
            ],
            // User (5)
            // 2 User memiliki kamar (Budi & Siti)
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081234567101',
                'address' => 'Jl. Kenanga No. 15, Jakarta',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Siti Aminah',
                'email' => 'siti.aminah@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081234567102',
                'address' => 'Jl. Dahlia No. 22, Surabaya',
                'email_verified_at' => now(),
            ],
            // 3 User belum memiliki kamar
            [
                'name' => 'Agus Pratama',
                'email' => 'agus.pratama@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081234567103',
                'address' => 'Jl. Mawar No. 7, Yogyakarta',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Rini Wulandari',
                'email' => 'rini.wulandari@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081234567104',
                'address' => 'Jl. Tulip No. 3, Semarang',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Joko Susilo',
                'email' => 'joko.susilo@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081234567105',
                'address' => 'Jl. Flamboyan No. 9, Malang',
                'email_verified_at' => now(),
            ]
        ];

        foreach ($users as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }

        $this->command->info('✅ UserSeeder: ' . count($users) . ' users dibuat.');
    }
}
