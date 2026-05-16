<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use Illuminate\Http\Request;

/**
 * LandingController
 * Mengelola halaman utama — menampilkan daftar kamar tersedia.
 */
class LandingController extends Controller
{
    public function index(Request $request)
    {
        $tipe   = $request->get('tipe', 'Semua');
        $search = $request->get('search', '');

        $query = Kamar::where('status', 'TERSEDIA');

        if ($tipe !== 'Semua') {
            $query->where('tipe', $tipe);
        }

        if ($search) {
            $query->where('nomor', 'like', "%{$search}%");
        }

        $kamars = $query->orderBy('nomor')->get();

        $stats = [
            'total'    => Kamar::count(),
            'tersedia' => Kamar::where('status', 'TERSEDIA')->count(),
            'dihuni'   => Kamar::where('status', 'DIHUNI')->count(),
        ];

        return view('guest.landing', compact('kamars', 'stats', 'tipe', 'search'));
    }
}
