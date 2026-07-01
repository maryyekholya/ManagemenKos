<?php

namespace App\Services\Strategies;

/**
 * Manager untuk mengelola strategi filter
 */
class FilterStrategyManager
{
    private static array $strategies = [];

    public static function registerDefaultStrategies(): void
    {
        self::$strategies['type'] = new RoomTypeFilterStrategy();
        self::$strategies['price'] = new PriceFilterStrategy();
        self::$strategies['status'] = new StatusFilterStrategy();
        self::$strategies['features'] = new FeaturesFilterStrategy();
    }

    public static function register(string $key, FilterStrategy $strategy): void
    {
        self::$strategies[$key] = $strategy;
    }

    public static function getStrategy(string $key): ?FilterStrategy
    {
        return self::$strategies[$key] ?? null;
    }

    public static function filter(array $rooms, array $filters): array
    {
        if (empty(self::$strategies)) {
            self::registerDefaultStrategies();
        }

        foreach ($filters as $filterType => $criteria) {
            $strategy = self::getStrategy($filterType);
            if ($strategy) {
                $rooms = $strategy->apply($rooms, $criteria);
            }
        }
        return $rooms;
    }
}
