<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

/**
 * Admin\BookingController
 * Melihat dan mengubah status booking dari sisi admin.
 */
class BookingController extends Controller
{
    public function index(Request $request)
    {
        $status   = $request->get('status');
        $query    = Booking::with(['kamar', 'user'])->latest();

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->paginate(15);
        $statuses = ['DIPESAN', 'DIKONFIRMASI', 'DIHUNI', 'SELESAI', 'DIBATALKAN'];

        return view('admin.booking.index', compact('bookings', 'status', 'statuses'));
    }

    public function show(Booking $booking)
    {
        $booking->load(['kamar', 'user']);
        return view('admin.booking.show', compact('booking'));
    }

    /** Konfirmasi booking (DIPESAN → DIKONFIRMASI) */
    public function confirm(Booking $booking)
    {
        if ($booking->status !== 'DIPESAN') {
            return back()->with('error', 'Hanya booking berstatus DIPESAN yang dapat dikonfirmasi.');
        }

        $booking->update(['status' => 'DIKONFIRMASI']);
        $booking->kamar->update(['status' => 'DIPESAN']);

        return back()->with('success', "Booking #{$booking->id} berhasil dikonfirmasi.");
    }

    /** Check-in tenant (DIKONFIRMASI → DIHUNI) */
    public function checkIn(Booking $booking)
    {
        if ($booking->status !== 'DIKONFIRMASI') {
            return back()->with('error', 'Hanya booking berstatus DIKONFIRMASI yang bisa check-in.');
        }

        $booking->update(['status' => 'DIHUNI']);
        $booking->kamar->update(['status' => 'DIHUNI']);

        return back()->with('success', "Booking #{$booking->id} berhasil check-in.");
    }

    /** Selesaikan booking (DIHUNI → SELESAI) */
    public function complete(Booking $booking)
    {
        if ($booking->status !== 'DIHUNI') {
            return back()->with('error', 'Hanya booking berstatus DIHUNI yang dapat diselesaikan.');
        }

        $booking->update(['status' => 'SELESAI']);
        $booking->kamar->update(['status' => 'TERSEDIA']);

        return back()->with('success', "Booking #{$booking->id} berhasil diselesaikan.");
    }

    /** Batalkan booking */
    public function cancel(Booking $booking)
    {
        if (in_array($booking->status, ['SELESAI', 'DIBATALKAN'])) {
            return back()->with('error', 'Booking sudah selesai atau dibatalkan.');
        }

        $booking->update(['status' => 'DIBATALKAN']);
        $booking->kamar->update(['status' => 'TERSEDIA']);

        return back()->with('success', "Booking #{$booking->id} berhasil dibatalkan.");
    }
}
