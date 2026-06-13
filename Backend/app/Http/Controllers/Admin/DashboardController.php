<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Kamar;

/**
 * Admin\DashboardController
 * Halaman utama admin — statistik dasar.
 */
class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_kamar'    => Kamar::count(),
            'kamar_tersedia' => Kamar::where('status', 'TERSEDIA')->count(),
            'kamar_dihuni'   => Kamar::where('status', 'DIHUNI')->count(),
            'total_booking'  => Booking::count(),
            'booking_aktif'  => Booking::whereIn('status', ['DIPESAN', 'DIKONFIRMASI', 'DIHUNI'])->count(),
            // Mocking for frontend
            'monthly_revenue' => 16800000,
            'open_complaints' => 1,
        ];

        $recentBookings = Booking::with(['kamar', 'user'])
            ->latest()
            ->take(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_bookings' => $recentBookings,
                'occupancy_chart' => [60, 80, 75, 90, 85, 95]
            ]
        ]);
    }
}
