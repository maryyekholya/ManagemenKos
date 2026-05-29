<?php

/*
 * ROUTE CONFIGURATION untuk RoomController
 * Tambahkan di file routes/web.php atau routes/api.php
 */

use App\Http\Controllers\RoomController;

// API Routes untuk data kamar
Route::group(['prefix' => 'api', 'as' => 'api.'], function () {
    // [GET] Semua kamar dengan filter & pricing strategy
    // Query: ?type=VIP&pricing_strategy=SEASONAL
    // Response: { success: true, data: [...], count: 3, pricing_strategy: 'SEASONAL' }
    Route::get('/rooms', [RoomController::class, 'getAllRooms'])
        ->name('rooms.list');

    // [GET] Detail kamar berdasarkan ID
    // Query: ?pricing_strategy=DISCOUNT
    // Response: { success: true, data: {...} }
    Route::get('/rooms/{id}', [RoomController::class, 'getRoomById'])
        ->where('id', '[0-9]+')
        ->name('rooms.show');

    // [GET] Filter kamar dengan multiple kriteria
    // Query: ?type=VIP&max_price=3000000&features=WiFi&pricing_strategy=SEASONAL
    // Response: { success: true, data: [...], count: 1, filters_applied: {...} }
    Route::get('/rooms/filter/search', [RoomController::class, 'filterRooms'])
        ->name('rooms.filter');

    // [GET] List semua pricing strategies yang tersedia
    // Response: { success: true, data: [{key: 'NORMAL', name: 'NORMAL', description: '...'}, ...] }
    Route::get('/pricing-strategies', [RoomController::class, 'getPricingStrategies'])
        ->name('pricing.strategies');
});
