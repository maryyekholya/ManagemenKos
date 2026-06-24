<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * UserSeeder — Membuat 3 akun demo dasar.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Utama',
                'email' => 'admin@admin.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '081234567890',
                'address' => 'Jl. Admin No. 1',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Manager Operasional',
                'email' => 'manager@manager.com',
                'password' => Hash::make('password123'),
                'role' => 'manager',
                'phone' => '081234567891',
                'address' => 'Jl. Manager No. 2',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'User Reguler',
                'email' => 'user@user.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081234567892',
                'address' => 'Jl. User No. 3',
                'email_verified_at' => now(),
            ]
        ];
        foreach ($users as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }

        $this->command->info('✅ UserSeeder: ' . count($users) . ' users dibuat.');
    }
}
