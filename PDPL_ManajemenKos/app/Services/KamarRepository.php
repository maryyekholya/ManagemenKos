<?php

namespace App\Services;

/**
 * [SINGLETON PATTERN]
 * KamarRepository: Satu pintu akses data kamar
 * Memastikan data yang ditarik konsisten di seluruh aplikasi
 * tanpa melakukan re-fetch yang tidak perlu
 */
class KamarRepository
{
    private static ?self $instance = null;
    private array $rooms = [];

    private function __construct()
    {
        $this->initializeRooms();
    }

    /**
     * Mendapatkan instance tunggal dari KamarRepository
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Inisialisasi data kamar (simulasi atau dari database)
     */
    private function initializeRooms(): void
    {
        $this->rooms = [
            [
                'id' => 1,
                'name' => 'Kamar A1',
                'type' => 'Tunggal',
                'price' => 1500000,
                'status' => 'TERSEDIA',
                'features' => ['WiFi', 'AC'],
                'image' => 'https://images.unsplash.com/photo-1522771739844-649f6d175d97?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'id' => 2,
                'name' => 'Kamar B5',
                'type' => 'Double',
                'price' => 2200000,
                'status' => 'DIPESAN',
                'features' => ['WiFi', 'AC', 'KM Dalam'],
                'image' => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'id' => 3,
                'name' => 'Kamar C2',
                'type' => 'VIP',
                'price' => 3500000,
                'status' => 'TERSEDIA',
                'features' => ['WiFi', 'AC', 'KM Dalam', 'TV'],
                'image' => 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800'
            ],
        ];
    }

    /**
     * Mendapatkan semua kamar
     */
    public function getAllRooms(): array
    {
        return $this->rooms;
    }

    /**
     * Mendapatkan kamar berdasarkan ID
     */
    public function getRoomById(int $id): ?array
    {
        foreach ($this->rooms as $room) {
            if ($room['id'] === $id) {
                return $room;
            }
        }
        return null;
    }

    /**
     * Filter kamar berdasarkan tipe
     */
    public function filterByType(string $type): array
    {
        if ($type === 'ALL') {
            return $this->rooms;
        }
        return array_filter($this->rooms, fn($room) => $room['type'] === $type);
    }

    /**
     * Filter kamar berdasarkan harga maksimal
     */
    public function filterByMaxPrice(int $maxPrice): array
    {
        return array_filter($this->rooms, fn($room) => $room['price'] <= $maxPrice);
    }

    /**
     * Mencegah kloning instance
     */
    private function __clone() {}

    /**
     * Mencegah unserialize instance
     */
    public function __wakeup() {
        throw new \Exception("Tidak bisa unserialize singleton");
    }
}
