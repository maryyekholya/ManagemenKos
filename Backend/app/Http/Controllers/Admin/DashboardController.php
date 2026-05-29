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
        ];

        $recentBookings = Booking::with(['kamar', 'user'])
            ->latest()
            ->take(5)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentBookings'));
    }
}
