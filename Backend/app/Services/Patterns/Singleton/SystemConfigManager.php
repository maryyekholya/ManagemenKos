<?php

namespace App\Services\Patterns\Singleton;

class SystemConfigManager
{
    private static ?SystemConfigManager $instance = null;
    private array $configs = [];

    private function __construct()
    {
        // Load default configs sesuai dengan dokumen (Fitur 6)
        $this->configs = [
            'nama_kos' => 'Manajemen Kos Pintar',
            'alamat' => 'Jl. Pendidikan No. 123, Kota Pelajar',
            'nomor_rekening' => 'BCA 123456789 a/n Kos Pintar',
            'batas_keterlambatan' => 5 // Hari batas keterlambatan pembayaran
        ];
    }

    public static function getInstance(): SystemConfigManager
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConfig(string $key)
    {
        return $this->configs[$key] ?? null;
    }

    public function setConfig(string $key, $value): void
    {
        $this->configs[$key] = $value;
    }
}
