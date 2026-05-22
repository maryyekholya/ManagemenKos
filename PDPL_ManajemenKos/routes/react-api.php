<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\AuthController;

// ─── API ROUTES FOR REACT FRONTEND ──────────────────────
// These routes serve the React frontend with API endpoints

Route::prefix('api')
    ->middleware('api')
    ->group(function () {
        
        // ─── PUBLIC API ENDPOINTS ──────────────────────────
        
        // Rooms/Kamars
        Route::get('/rooms', [RoomController::class, 'index']);
        Route::get('/rooms/{id}', [RoomController::class, 'show']);
        
        // Bookings
        Route::get('/bookings/check/{room_id}', [BookingController::class, 'checkAvailability']);
        
        // ─── AUTHENTICATED API ENDPOINTS ────────────────────
        Route::middleware(['auth:sanctum'])->group(function () {
            // User Bookings
            Route::get('/bookings', [BookingController::class, 'userBookings']);
            Route::post('/bookings', [BookingController::class, 'store']);
            Route::get('/bookings/{id}', [BookingController::class, 'show']);
            Route::put('/bookings/{id}', [BookingController::class, 'update']);
            Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
            
            // Auth
            Route::post('/auth/logout', [AuthController::class, 'logout']);
            Route::get('/auth/user', [AuthController::class, 'user']);
        });
        
        // ─── AUTH API ENDPOINTS ────────────────────────────
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    });
