<?php

namespace App\Http\Controllers;

use App\Services\KamarRepository;
use App\Services\Strategies\PricingStrategyManager;
use App\Services\Strategies\FilterStrategyManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * RoomController: Mengelola API endpoints untuk data kamar
 * Mengintegrasikan Singleton (KamarRepository) dengan Strategy Patterns
 */
class RoomController extends Controller
{
    private KamarRepository $kamarRepository;

    public function __construct()
    {
        // [SINGLETON] Menggunakan instance tunggal repository
        $this->kamarRepository = KamarRepository::getInstance();
    }

    /**
     * GET /api/rooms
     * Mendapatkan semua kamar dengan opsi filter dan pricing strategy
     */
    public function getAllRooms(Request $request): JsonResponse
    {
        $rooms = $this->kamarRepository->getAllRooms();

        // [STRATEGY PATTERN] Terapkan filter berdasarkan request
        $filters = $request->only(['type', 'price', 'status', 'features']);
        if (!empty(array_filter($filters))) {
            $rooms = FilterStrategyManager::filter($rooms, array_filter($filters));
        }

        // [STRATEGY PATTERN] Terapkan pricing strategy
        $pricingStrategy = $request->get('pricing_strategy', 'NORMAL');
        $rooms = $this->applyPricingStrategy($rooms, $pricingStrategy);

        return response()->json([
            'success' => true,
            'data' => array_values($rooms),
            'count' => count($rooms),
            'pricing_strategy' => $pricingStrategy,
        ]);
    }

    /**
     * GET /api/rooms/{id}
     * Mendapatkan detail kamar berdasarkan ID
     */
    public function getRoomById(int $id, Request $request): JsonResponse
    {
        $room = $this->kamarRepository->getRoomById($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        // [STRATEGY PATTERN] Terapkan pricing strategy
        $pricingStrategy = $request->get('pricing_strategy', 'NORMAL');
        $room['displayPrice'] = PricingStrategyManager::calculatePrice(
            $pricingStrategy,
            $room['price']
        );

        return response()->json([
            'success' => true,
            'data' => $room,
        ]);
    }

    /**
     * GET /api/rooms/filter
     * Filter kamar dengan kriteria spesifik
     */
    public function filterRooms(Request $request): JsonResponse
    {
        $rooms = $this->kamarRepository->getAllRooms();

        // [STRATEGY PATTERN] Terapkan multiple filter
        $filters = [
            'type' => $request->get('type', 'ALL'),
            'price' => $request->get('max_price'),
            'status' => $request->get('status'),
            'features' => $request->get('features'),
        ];

        $filteredRooms = FilterStrategyManager::filter(
            $rooms,
            array_filter($filters, fn($v) => !is_null($v))
        );

        $pricingStrategy = $request->get('pricing_strategy', 'NORMAL');
        $filteredRooms = $this->applyPricingStrategy($filteredRooms, $pricingStrategy);

        return response()->json([
            'success' => true,
            'data' => array_values($filteredRooms),
            'count' => count($filteredRooms),
            'filters_applied' => $filters,
        ]);
    }

    /**
     * GET /api/pricing-strategies
     * Mendapatkan daftar strategi pricing yang tersedia
     */
    public function getPricingStrategies(): JsonResponse
    {
        $strategies = [];
        foreach (PricingStrategyManager::getAllStrategies() as $key => $strategy) {
            $strategies[] = [
                'key' => $key,
                'name' => $strategy->getName(),
                'description' => $strategy->getDescription(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $strategies,
        ]);
    }

    /**
     * Helper: Terapkan pricing strategy ke semua kamar
     */
    private function applyPricingStrategy(array $rooms, string $strategy): array
    {
        return array_map(function ($room) use ($strategy) {
            $room['displayPrice'] = PricingStrategyManager::calculatePrice(
                $strategy,
                $room['price']
            );
            return $room;
        }, $rooms);
    }
}
