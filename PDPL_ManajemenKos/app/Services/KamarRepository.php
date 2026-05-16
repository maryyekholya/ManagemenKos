<?php

namespace App\Services;

use App\Models\Kamar;
use Illuminate\Support\Collection;

/**
 * [SINGLETON PATTERN]
 * KamarRepository: Satu pintu akses data kamar dari database.
 * Memastikan data konsisten di seluruh aplikasi dengan caching in-memory.
 * Kini menggunakan Eloquent Model (Kamar) sebagai sumber data utama.
 */
class KamarRepository
{
    private static ?self $instance = null;
    private ?Collection $cache = null; // In-memory cache

    private function __construct()
    {
        // Private constructor — hanya bisa dibuat via getInstance()
    }

    /**
     * Mendapatkan instance tunggal dari KamarRepository.
     * [SINGLETON] — satu instance sepanjang lifecycle request.
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Mendapatkan semua kamar.
     * Menggunakan in-memory cache untuk menghindari query berulang.
     */
    public function getAllRooms(): Collection
    {
        if ($this->cache === null) {
            $this->cache = Kamar::orderBy('nomor')->get();
        }
        return $this->cache;
    }

    /**
     * Mendapatkan kamar berdasarkan ID.
     */
    public function getRoomById(int $id): ?Kamar
    {
        return $this->getAllRooms()->firstWhere('id', $id);
    }

    /**
     * Mendapatkan kamar yang tersedia.
     */
    public function getAvailableRooms(): Collection
    {
        return $this->getAllRooms()->where('status', 'TERSEDIA')->values();
    }

    /**
     * Filter kamar berdasarkan tipe.
     */
    public function filterByType(string $type): Collection
    {
        if ($type === 'All' || $type === 'ALL') {
            return $this->getAllRooms();
        }
        return $this->getAllRooms()->where('tipe', $type)->values();
    }

    /**
     * Filter kamar berdasarkan harga maksimal.
     */
    public function filterByMaxPrice(int $maxPrice): Collection
    {
        return $this->getAllRooms()->filter(fn($room) => $room->harga_dasar <= $maxPrice)->values();
    }

    /**
     * Hapus cache — dipanggil setelah create/update/delete kamar.
     */
    public function clearCache(): void
    {
        $this->cache = null;
    }

    /**
     * Kompatibilitas backward dengan RoomController (mengembalikan array).
     */
    public function getAllRoomsAsArray(): array
    {
        return $this->getAllRooms()->toArray();
    }

    // ─── Singleton protection ─────────────────────────────────

    /** Mencegah kloning instance */
    private function __clone() {}

    /** Mencegah unserialize instance */
    public function __wakeup()
    {
        throw new \Exception("Tidak bisa unserialize Singleton KamarRepository");
    }
}
