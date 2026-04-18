<?php

namespace App\Services\Strategies;

/**
 * [STRATEGY PATTERN]
 * FilterStrategy: Interface untuk berbagai strategi filter
 * Memungkinkan penambahan filter baru tanpa merusak struktur yang ada
 */
interface FilterStrategy
{
    public function apply(array $rooms, mixed $criteria): array;
    public function getName(): string;
}

/**
 * Filter kamar berdasarkan tipe kamar
 */
class RoomTypeFilterStrategy implements FilterStrategy
{
    public function apply(array $rooms, mixed $criteria): array
    {
        if ($criteria === 'ALL' || empty($criteria)) {
            return $rooms;
        }
        return array_filter($rooms, fn($room) => $room['type'] === $criteria);
    }

    public function getName(): string
    {
        return 'type';
    }
}

/**
 * Filter kamar berdasarkan harga maksimal
 */
class PriceFilterStrategy implements FilterStrategy
{
    public function apply(array $rooms, mixed $criteria): array
    {
        $maxPrice = (int)$criteria;
        if ($maxPrice <= 0) {
            return $rooms;
        }
        return array_filter($rooms, fn($room) => $room['price'] <= $maxPrice);
    }

    public function getName(): string
    {
        return 'price';
    }
}

/**
 * Filter kamar berdasarkan status (tersedia, dipesan, dll)
 */
class StatusFilterStrategy implements FilterStrategy
{
    public function apply(array $rooms, mixed $criteria): array
    {
        if (empty($criteria)) {
            return $rooms;
        }
        return array_filter($rooms, fn($room) => $room['status'] === $criteria);
    }

    public function getName(): string
    {
        return 'status';
    }
}

/**
 * Filter kamar berdasarkan fitur yang tersedia
 * Kamar harus memiliki SEMUA fitur yang dicari
 */
class FeaturesFilterStrategy implements FilterStrategy
{
    public function apply(array $rooms, mixed $criteria): array
    {
        $requiredFeatures = (array)$criteria;
        if (empty($requiredFeatures)) {
            return $rooms;
        }

        return array_filter($rooms, function ($room) use ($requiredFeatures) {
            $roomFeatures = $room['features'] ?? [];
            foreach ($requiredFeatures as $feature) {
                if (!in_array($feature, $roomFeatures)) {
                    return false;
                }
            }
            return true;
        });
    }

    public function getName(): string
    {
        return 'features';
    }
}

/**
 * Filter composite untuk menggabungkan multiple filter
 */
class CompositeFilterStrategy implements FilterStrategy
{
    private array $strategies = [];
    private array $criteria = [];

    public function add(FilterStrategy $strategy, mixed $criterion): self
    {
        $this->strategies[] = $strategy;
        $this->criteria[] = $criterion;
        return $this;
    }

    public function apply(array $rooms, mixed $criteria = null): array
    {
        foreach ($this->strategies as $index => $strategy) {
            $rooms = $strategy->apply($rooms, $this->criteria[$index]);
        }
        return $rooms;
    }

    public function getName(): string
    {
        return 'composite';
    }
}

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
        foreach ($filters as $filterType => $criteria) {
            $strategy = self::getStrategy($filterType);
            if ($strategy) {
                $rooms = $strategy->apply($rooms, $criteria);
            }
        }
        return $rooms;
    }
}

// Inisialisasi strategi default saat file di-load
FilterStrategyManager::registerDefaultStrategies();
