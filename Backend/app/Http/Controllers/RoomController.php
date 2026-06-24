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
    private function applyPricingStrategy(iterable $rooms, string $strategy): array
    {
        $result = [];
        foreach ($rooms as $room) {
            // Because $room could be an Eloquent model, we can use array access or convert it
            $roomArray = $room instanceof \Illuminate\Database\Eloquent\Model ? $room->toArray() : (array) $room;
            $roomArray['displayPrice'] = PricingStrategyManager::calculatePrice(
                $strategy,
                $roomArray['harga_dasar'] ?? $roomArray['price'] ?? 0
            );
            $result[] = $roomArray;
        }
        return $result;
    }

    /**
     * POST /api/v1/admin/rooms
     * Menambah kamar baru
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nomor' => 'required|string|unique:kamars,nomor',
            'tipe' => 'required|string',
            'harga_dasar' => 'required|integer',
            'status' => 'required|string',
        ]);

        $kamar = \App\Models\Kamar::create($request->all());
        $this->kamarRepository->clearCache();

        return response()->json(['success' => true, 'message' => 'Kamar berhasil ditambahkan', 'data' => $kamar]);
    }

    /**
     * PUT /api/v1/admin/rooms/{id}
     * Mengubah data kamar
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $kamar = \App\Models\Kamar::findOrFail($id);

        $request->validate([
            'nomor' => 'string|unique:kamars,nomor,' . $kamar->id,
            'tipe' => 'string',
            'harga_dasar' => 'integer',
            'status' => 'string',
        ]);

        $kamar->update($request->all());
        $this->kamarRepository->clearCache();

        return response()->json(['success' => true, 'message' => 'Kamar berhasil diupdate', 'data' => $kamar]);
    }

    /**
     * DELETE /api/v1/admin/rooms/{id}
     * Menghapus kamar
     */
    public function destroy(int $id): JsonResponse
    {
        $kamar = \App\Models\Kamar::findOrFail($id);
        $kamar->delete();
        $this->kamarRepository->clearCache();

        return response()->json(['success' => true, 'message' => 'Kamar berhasil dihapus']);
    }

    /**
     * POST /api/v1/admin/rooms/upload-image
     * Mengupload gambar kamar
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
        ]);

        $file = $request->file('image');
        $filename = 'room_' . now()->format('Ymd_His') . '_' . \Illuminate\Support\Str::random(8) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('rooms', $filename, 'public');

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload gambar.',
            ], 500);
        }

        $publicUrl = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'message' => 'Gambar berhasil diupload.',
            'data' => [
                'url' => $publicUrl
            ]
        ], 201);
    }
}
