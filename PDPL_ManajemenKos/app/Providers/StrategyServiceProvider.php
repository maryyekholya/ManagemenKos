<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Strategies\PricingStrategyManager;
use App\Services\Strategies\NormalPricingStrategy;
use App\Services\Strategies\SeasonalPricingStrategy;
use App\Services\Strategies\DiscountPricingStrategy;
use App\Services\Strategies\PercentageDiscountPricingStrategy;

/**
 * [SERVICE PROVIDER]
 * StrategyServiceProvider: Registrasi semua pricing strategies saat aplikasi startup
 * 
 * Tambahkan ke config/app.php di array 'providers':
 * App\Providers\StrategyServiceProvider::class,
 */
class StrategyServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // [STRATEGY PATTERN] Register pricing strategies
        $this->registerPricingStrategies();
    }

    /**
     * Registrasi semua pricing strategies yang tersedia
     */
    private function registerPricingStrategies(): void
    {
        // Normal pricing - tanpa adjustment
        PricingStrategyManager::register(
            'NORMAL',
            new NormalPricingStrategy()
        );

        // Seasonal pricing - untuk musim ramai (naik 20%)
        PricingStrategyManager::register(
            'SEASONAL',
            new SeasonalPricingStrategy(1.2)
        );

        // Fixed discount - potongan tetap Rp 100.000
        PricingStrategyManager::register(
            'DISCOUNT',
            new DiscountPricingStrategy(100000)
        );

        // Early bird discount - diskon 15% untuk pemesanan awal
        PricingStrategyManager::register(
            'EARLY_BIRD',
            new PercentageDiscountPricingStrategy(0.15)
        );

        // End year sale - diskon besar 25%
        PricingStrategyManager::register(
            'YEAR_END',
            new PercentageDiscountPricingStrategy(0.25)
        );

        // Member exclusive - diskon 10% untuk member
        PricingStrategyManager::register(
            'MEMBER',
            new PercentageDiscountPricingStrategy(0.10)
        );

        // Peak season - harga naik 30%
        PricingStrategyManager::register(
            'PEAK_SEASON',
            new SeasonalPricingStrategy(1.30)
        );

        \Log::info('Pricing strategies registered successfully', [
            'strategies' => array_keys(PricingStrategyManager::getAllStrategies())
        ]);
    }
}
