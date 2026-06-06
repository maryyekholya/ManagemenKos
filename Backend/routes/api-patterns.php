<?php

/*
 * ROUTING DESIGN PATTERN SUMMARY
 * 
 * Pengaturan rute pada aplikasi ini menggunakan prinsip RESTful Resource Routing, 
 * dikelompokkan berdasarkan entitas agar lebih rapi dan mudah dikelola.
 * 
 * Konsep utama yang diterapkan:
 * 1. Prefix Grouping: Menggunakan `/api/v1/` untuk memudahkan manajemen versi API.
 * 2. Controller Mapping: Setiap rute terhubung langsung ke method di Controller yang sesuai.
 * 3. Middleware Injection: Proteksi endpoint dengan middleware auth dapat diatur per kelompok (group).
 * 4. Named Routes: Penamaan rute menggunakan `name()` untuk mempermudah pemanggilan rute di dalam aplikasi.
 */

use App\Http\Controllers\BookingController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\Auth\ApiAuthController;

Route::group(['prefix' => 'v1', 'as' => 'api.v1.'], function () {

    // --- Singleton & Strategy (Kamar) ---
    Route::get('/rooms', [RoomController::class, 'getAllRooms'])->name('rooms.index');
    Route::get('/rooms/{id}', [RoomController::class, 'getRoomById'])->name('rooms.show');
    Route::get('/rooms/search', [RoomController::class, 'filterRooms'])->name('rooms.search');

    // --- Auth & Identity ---
    Route::post('/auth/login', [ApiAuthController::class, 'login'])->name('auth.login');
    Route::post('/auth/register', [ApiAuthController::class, 'register'])->name('auth.register');
    Route::post('/auth/google', [ApiAuthController::class, 'googleLogin'])->name('auth.google');

    // --- State, Observer & Singleton (Booking) ---
    Route::post('/bookings', [BookingController::class, 'createBooking'])->name('bookings.store');
    Route::put('/bookings/{id}/proceed', [BookingController::class, 'proceedBooking'])->name('bookings.proceed');
    Route::put('/bookings/{id}/extend', [BookingController::class, 'extendRent'])->name('bookings.extend');

    // --- Contoh Endpoints lainnya dapat ditambahkan sesuai entitas (Payment, Complaint) ---
});
