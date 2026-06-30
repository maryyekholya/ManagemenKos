<?php

/*
 * ROUTING DESIGN PATTERN SUMMARY
 * 
 * Pengaturan rute pada aplikasi ini menggunakan prinsip RESTful Resource Routing, 
 * dikelompokkan berdasarkan entitas agar lebih rapi dan mudah dikelola.
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\ComplaintAttachmentController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\Admin\ReportController;

Route::group(['prefix' => 'v1', 'as' => 'api.v1.'], function () {

    // --- Singleton & Strategy (Kamar) ---
    Route::get('/rooms', [RoomController::class, 'getAllRooms'])->name('rooms.index');
    Route::get('/rooms/{id}', [RoomController::class, 'getRoomById'])->name('rooms.show');
    Route::get('/rooms/search', [RoomController::class, 'filterRooms'])->name('rooms.search');

    // --- Auth & Identity ---
    Route::post('/auth/login', [ApiAuthController::class, 'login'])->name('auth.login');
    Route::post('/auth/register', [ApiAuthController::class, 'register'])->name('auth.register');
    Route::post('/auth/google', [ApiAuthController::class, 'googleLogin'])->name('auth.google');
    Route::post('/auth/forgot-password', [ApiAuthController::class, 'forgotPassword'])->name('auth.forgot-password');
    Route::post('/auth/reset-password', [ApiAuthController::class, 'resetPassword'])->name('auth.reset-password');
    Route::post('/auth/verify-email', [ApiAuthController::class, 'verifyEmail'])->name('auth.verify-email');

    // --- Protected Routes ---
    Route::middleware('auth:sanctum')->group(function () {
        
        // --- Auth User ---
        Route::get('/auth/me', [ApiAuthController::class, 'me'])->name('auth.me');
        Route::post('/auth/logout', [ApiAuthController::class, 'logout'])->name('auth.logout');
        Route::post('/auth/profile', [ApiAuthController::class, 'updateProfile'])->name('auth.profile.update');

        
        // --- State, Observer & Singleton (Booking) - General Users ---
        Route::get('/bookings', [BookingController::class, 'getUserBookings'])->name('bookings.index');
        Route::post('/bookings', [BookingController::class, 'createBooking'])->name('bookings.store');
        Route::put('/bookings/{id}/proceed', [BookingController::class, 'proceedBooking'])->name('bookings.proceed');
        Route::put('/bookings/{id}/pay', [BookingController::class, 'payBooking'])->name('bookings.pay');
        Route::put('/bookings/{id}/checkout', [BookingController::class, 'checkOutBooking'])->name('bookings.checkout');
        Route::post('/bookings/{id}/extend', [BookingController::class, 'extendBooking'])->name('bookings.extend');
        Route::get('/bookings/{id}/receipt/pdf', [BookingController::class, 'receiptPdf'])->name('bookings.receipt');

        // --- Complaint (User) ---
        Route::post('/complaints', [ComplaintController::class, 'store'])->name('complaints.store');
        Route::post('/complaints/upload-attachment', [ComplaintAttachmentController::class, 'upload'])->name('complaints.upload');

        // --- Admin/Manager Only Routes ---
        Route::middleware('role:manager,admin')->group(function () {
            
            Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
            Route::apiResource('/admin/users', AccountController::class);
            Route::put('/admin/users/{id}/toggle-active', [AccountController::class, 'toggleActive'])->name('admin.users.toggle-active');

            // Admin Booking
            Route::put('/admin/bookings/{id}/approve', [BookingController::class, 'approveBooking'])->name('admin.bookings.approve');
            Route::put('/admin/bookings/{id}/reject', [BookingController::class, 'rejectBooking'])->name('admin.bookings.reject');
            Route::put('/admin/rooms/{id}/evict', [BookingController::class, 'evictByRoom'])->name('admin.rooms.evict');
            Route::get('/admin/bookings', [DashboardController::class, 'getAllBookings'])->name('admin.bookings.index');

            // Admin Rooms (Manajemen Kamar)
            Route::post('/admin/rooms/upload-image', [RoomController::class, 'uploadImage'])->name('admin.rooms.upload');
            Route::post('/admin/rooms', [RoomController::class, 'store'])->name('admin.rooms.store');
            Route::put('/admin/rooms/{id}', [RoomController::class, 'update'])->name('admin.rooms.update');
            Route::delete('/admin/rooms/{id}', [RoomController::class, 'destroy'])->name('admin.rooms.destroy');

            // Admin Complaints
            Route::get('/admin/complaints', [ComplaintController::class, 'index'])->name('admin.complaints.index');
            Route::put('/admin/complaints/{id}/respond', [ComplaintController::class, 'respond'])->name('admin.complaints.respond');

            // Manager Reports (Builder Pattern)
            Route::get('/manager/reports/financial', [ReportController::class, 'financial'])->name('manager.reports.financial');
            Route::get('/manager/reports/export-csv', [ReportController::class, 'exportCsv'])->name('manager.reports.export-csv');

        });
    });
});
