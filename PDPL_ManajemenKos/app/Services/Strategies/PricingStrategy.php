<?php

namespace App\Services\Strategies;

/**
 * [STRATEGY PATTERN]
 * PricingStrategy: Interface untuk berbagai strategi harga
 * Memungkinkan perhitungan harga dinamis tanpa mengubah UI
 */
interface PricingStrategy
{
    public function calculatePrice(float $basePrice): float;
    public function getName(): string;
    public function getDescription(): string;
}

/**
 * Strategi harga normal (tanpa diskon atau kenaikan)
 */
class NormalPricingStrategy implements PricingStrategy
{
    public function calculatePrice(float $basePrice): float
    {
        return $basePrice;
    }

    public function getName(): string
    {
        return 'NORMAL';
    }

    public function getDescription(): string
    {
        return 'Harga normal tanpa adjustment';
    }
}

/**
 * Strategi harga seasonal (kenaikan harga musiman)
 * Cocok untuk peak season atau hari libur
 */
class SeasonalPricingStrategy implements PricingStrategy
{
    private float $multiplier = 1.2; // Naik 20%

    public function __construct(float $multiplier = 1.2)
    {
        $this->multiplier = $multiplier;
    }

    public function calculatePrice(float $basePrice): float
    {
        return $basePrice * $this->multiplier;
    }

    public function getName(): string
    {
        return 'SEASONAL';
    }

    public function getDescription(): string
    {
        return 'Harga naik ' . (($this->multiplier - 1) * 100) . '% untuk musim ramai';
    }
}

/**
 * Strategi harga dengan diskon tetap
 * Cocok untuk promo atau early bird
 */
class DiscountPricingStrategy implements PricingStrategy
{
    private int $discountAmount = 100000;

    public function __construct(int $discountAmount = 100000)
    {
        $this->discountAmount = $discountAmount;
    }

    public function calculatePrice(float $basePrice): float
    {
        $discountedPrice = $basePrice - $this->discountAmount;
        return max(0, $discountedPrice); // Jangan minus
    }

    public function getName(): string
    {
        return 'DISCOUNT';
    }

    public function getDescription(): string
    {
        return 'Diskon Rp ' . number_format($this->discountAmount, 0, ',', '.');
    }
}

/**
 * Strategi harga dengan persentase diskon
 * Lebih fleksibel untuk berbagai tingkat harga kamar
 */
class PercentageDiscountPricingStrategy implements PricingStrategy
{
    private float $discountPercentage = 0.15; // 15%

    public function __construct(float $discountPercentage = 0.15)
    {
        $this->discountPercentage = max(0, min(1, $discountPercentage));
    }

    public function calculatePrice(float $basePrice): float
    {
        return $basePrice * (1 - $this->discountPercentage);
    }

    public function getName(): string
    {
        return 'PERCENTAGE_DISCOUNT';
    }

    public function getDescription(): string
    {
        return 'Diskon ' . ($this->discountPercentage * 100) . '%';
    }
}

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
        return self::$strategies[$key] ?? null;
    }

    public static function calculatePrice(string $strategyKey, float $basePrice): float
    {
        $strategy = self::getStrategy($strategyKey);
        return $strategy?->calculatePrice($basePrice) ?? $basePrice;
    }

    public static function getAllStrategies(): array
    {
        return self::$strategies;
    }
}
