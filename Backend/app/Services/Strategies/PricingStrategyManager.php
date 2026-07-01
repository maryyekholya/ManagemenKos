<?php

namespace App\Services\Strategies;

/**
 * Manager untuk mengelola strategi pricing
 */
class PricingStrategyManager
{
    private static array $strategies = [];

    public static function register(string $key, PricingStrategy $strategy): void
    {
        self::$strategies[$key] = $strategy;
    }

    public static function getStrategy(string $key): ?PricingStrategy
    {
        // Pastikan strategi default sudah ter-register
        if (empty(self::$strategies)) {
            self::registerDefaults();
        }
        return self::$strategies[$key] ?? self::$strategies['NORMAL'];
    }

    public static function calculatePrice(string $strategyKey, float $basePrice): float
    {
        $strategy = self::getStrategy($strategyKey);
        return (int) round($strategy?->calculatePrice($basePrice) ?? $basePrice);
    }

    public static function getAllStrategies(): array
    {
        if (empty(self::$strategies)) {
            self::registerDefaults();
        }
        return self::$strategies;
    }

    /**
     * Ambil nama-nama strategi untuk dropdown view.
     * Sesuai dengan selector di LandingPage.tsx (Normal, Seasonal, Discount).
     */
    public static function getAllStrategyNames(): array
    {
        return [
            'NORMAL'   => 'Normal (Harga Standar)',
            'SEASONAL' => 'Seasonal (+20%)',
            'DISCOUNT' => 'Daily Discount (-15%)',
        ];
    }

    /**
     * Register strategi default (dipanggil otomatis jika belum ada strategi terdaftar).
     */
    public static function registerDefaults(): void
    {
        self::$strategies['NORMAL']   = new NormalPricingStrategy();
        self::$strategies['SEASONAL'] = new SeasonalPricingStrategy(1.2);
        self::$strategies['DISCOUNT'] = new PercentageDiscountPricingStrategy(0.15);
    }
}
