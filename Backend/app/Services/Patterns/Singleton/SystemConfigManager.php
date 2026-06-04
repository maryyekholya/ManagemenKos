<?php

namespace App\Services\Patterns\Singleton;

class SystemConfigManager
{
    private static ?SystemConfigManager $instance = null;
    private array $configs = [];

    private function __construct()
    {
        // Load default configs
        $this->configs = [
            'app_name' => 'Manajemen Kos Pintar',
            'tax_rate' => 0.11,
            'max_booking_days' => 30
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
