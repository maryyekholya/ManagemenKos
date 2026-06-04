<?php

/*
 * ROUTING DESIGN PATTERN SUMMARY
 * 
 * Pola routing yang digunakan pada arsitektur MVC ini mengikuti prinsip RESTful Resource Routing
 * dengan pengelompokan (Grouping) berdasarkan domain entitas.
 * 
 * Karakteristik Routing Design Pattern yang diterapkan:
 * 1. Prefix Grouping: Menggunakan prefix API `/api/v1/` untuk versioning yang rapi.
 * 2. Controller Mapping: Setiap rute di-map secara langsung ke method spesifik dalam Controller.
 * 3. Middleware Injection: Proteksi endpoint dengan middleware auth dapat dipasang pada level group (disederhanakan dalam contoh ini).
 * 4. Named Routes: Penggunaan `name()` untuk mempermudah reverse routing di internal Laravel.
 */

use App\Http\Controllers\BookingController;
use App\Http\Controllers\RoomController;

Route::group(['prefix' => 'api/v1', 'as' => 'api.v1.'], function () {

    // --- Singleton & Strategy (Kamar) ---
    Route::get('/rooms', [RoomController::class, 'getAllRooms'])->name('rooms.index');
    Route::get('/rooms/{id}', [RoomController::class, 'getRoomById'])->name('rooms.show');
    Route::get('/rooms/search', [RoomController::class, 'filterRooms'])->name('rooms.search');

    // --- State, Observer & Singleton (Booking) ---
    Route::post('/bookings', [BookingController::class, 'createBooking'])->name('bookings.store');
    Route::put('/bookings/{id}/proceed', [BookingController::class, 'proceedBooking'])->name('bookings.proceed');

    // --- Contoh Endpoints lainnya dapat ditambahkan sesuai entitas (Payment, Complaint) ---
});
