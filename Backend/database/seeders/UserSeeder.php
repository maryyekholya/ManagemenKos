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
                'name'     => 'Admin NestIn',
                'email'    => 'admin@nestin.id',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'phone'    => '081200000001',
            ],
            [
                'name'     => 'Budi Santoso',
                'email'    => 'user@nestin.id',
                'password' => Hash::make('user123'),
                'role'     => 'user',
                'phone'    => '081200000002',
            ],
            [
                'name'     => 'Manager Kos',
                'email'    => 'manager@nestin.id',
                'password' => Hash::make('manager123'),
                'role'     => 'manager',
                'phone'    => '081200000003',
            ],
            [
                'name'     => 'Andi Organizer',
                'email'    => 'organizer@nestin.id',
                'password' => Hash::make('organizer123'),
                'role'     => 'organizer',
                'phone'    => '081200000004',
            ],
            [
                'name'     => 'Siti Aminah',
                'email'    => 'newuser@nestin.id',
                'password' => Hash::make('user123'),
                'role'     => 'user',
                'phone'    => '081200000005',
            ],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }

        $this->command->info('✅ UserSeeder: ' . count($users) . ' users dibuat.');
    }
}
