<?php

namespace App\Services\Patterns\Factory;

use App\Models\Kamar;

class RoomFactory
{
    /**
     * Membuat instance Kamar berdasarkan tipe tertentu.
     * Mengkapsulasi logika pembuatan kamar sehingga lebih mudah dikelola (Factory Method Pattern).
     */
    public static function createRoom(string $type, array $data): Kamar
    {
        // Standarisasi atribut default
        $defaultData = [
            'status' => 'TERSEDIA',
            'fasilitas' => 'Kasur, Lemari',
            'harga_per_bulan' => 500000,
        ];

        if (strtoupper($type) === 'VIP') {
            $defaultData['fasilitas'] = 'Kasur, Lemari, AC, TV, Kamar Mandi Dalam';
            $defaultData['harga_per_bulan'] = 1500000;
        } elseif (strtoupper($type) === 'KAPSUL') {
            $defaultData['fasilitas'] = 'Kasur Single, Loker';
            $defaultData['harga_per_bulan'] = 300000;
        }

        $mergedData = array_merge($defaultData, $data);
        return Kamar::create($mergedData);
    }
}
