<?php

use App\Http\Controllers\Guest\LandingController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\KamarController as AdminKamarController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// ─── PUBLIC ─────────────────────────────────────────────
Route::get('/', [LandingController::class, 'index'])->name('landing');

// Auth (login, register, logout)
require __DIR__ . '/auth.php';

// ─── ADMIN ──────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Kamar CRUD
        Route::resource('kamar', AdminKamarController::class);

        // Booking — lihat & ubah status
        Route::get('/booking', [AdminBookingController::class, 'index'])->name('booking.index');
        Route::get('/booking/{booking}', [AdminBookingController::class, 'show'])->name('booking.show');
        Route::post('/booking/{booking}/confirm',  [AdminBookingController::class, 'confirm'])->name('booking.confirm');
        Route::post('/booking/{booking}/checkin',  [AdminBookingController::class, 'checkIn'])->name('booking.checkin');
        Route::post('/booking/{booking}/complete', [AdminBookingController::class, 'complete'])->name('booking.complete');
        Route::post('/booking/{booking}/cancel',   [AdminBookingController::class, 'cancel'])->name('booking.cancel');
    });

// ─── MANAGER (placeholder sederhana) ────────────────────
Route::middleware(['auth', 'role:manager'])
    ->prefix('manager')
    ->name('manager.')
    ->group(function () {
        Route::get('/dashboard', function () {
            $kamars = \App\Models\Kamar::all()->groupBy('status');
            return view('manager.dashboard', compact('kamars'));
        })->name('dashboard');
    });

// ─── USER (placeholder sederhana) ───────────────────────
Route::middleware(['auth', 'role:user'])
    ->prefix('user')
    ->name('user.')
    ->group(function () {
        Route::get('/dashboard', function () {
            $bookings = \App\Models\Booking::with('kamar')
                ->where('user_id', auth()->id())
                ->latest()->get();
            return view('user.dashboard', compact('bookings'));
        })->name('dashboard');
    });

// ─── REDIRECT SETELAH LOGIN (berdasarkan role) ──────────
Route::get('/dashboard', function () {
    return redirect(auth()->user()->getDashboardRoute());
})->middleware('auth')->name('dashboard');
