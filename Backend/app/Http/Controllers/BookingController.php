<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use App\Models\Booking;
use App\Models\Kamar;
use App\Services\Patterns\Observer\NotificationManager;
use App\Services\Patterns\Observer\EmailObserver;
use App\Services\Patterns\Observer\WhatsAppObserver;
use App\Services\Patterns\Observer\PushNotifObserver;
use App\Services\Patterns\Singleton\TransactionHistoryManager;

use App\Services\Patterns\Strategy\TransferBankStrategy;
use App\Services\Patterns\Strategy\DompetDigitalStrategy;
use App\Services\Patterns\Strategy\QRISStrategy;

class BookingController extends Controller
{
    private NotificationManager $notifier;

    public function __construct()
    {
        $this->notifier = new NotificationManager();
        $this->notifier->attach(new EmailObserver());
        $this->notifier->attach(new WhatsAppObserver());
        $this->notifier->attach(new PushNotifObserver());
    }

    /**
     * CREATE Booking (State: TERSEDIA -> DIPESAN)
     */
    public function createBooking(Request $request): JsonResponse
    {
        $request->validate([
            'kamar_id' => 'required|exists:kamars,id',
            'durasi_bulan' => 'required|integer|min:1',
        ]);

        $kamar = Kamar::findOrFail($request->kamar_id);
        $user = Auth::user();

        // 1. Cek aturan: 1 user hanya boleh punya 1 kamar aktif
        $activeBooking = Booking::where('user_id', $user->id)
            ->whereIn('status', ['DIPESAN', 'MENUNGGU_PEMBAYARAN', 'DIKONFIRMASI', 'DIHUNI'])
            ->first();

        if ($activeBooking) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki pesanan kamar yang aktif. Anda hanya dapat memesan maksimal 1 kamar.'
            ], 400);
        }

        // 1. Buat record Booking baru
        $booking = new Booking();
        $booking->user_id = $user->id;
        $booking->user_name = $user->name;
        $booking->kamar_id = $kamar->id;
        $booking->durasi_bulan = $request->durasi_bulan;
        $booking->total = $kamar->price * $request->durasi_bulan;
        $booking->status = 'TERSEDIA'; // State awal
        $booking->save();

        try {
            // 2. Ambil state context dan jalankan transisi
            $context = $booking->getStateContext();
            $context->pesan();

            // 3. Simpan state baru
            $booking->status = $context->getStatus();
            $booking->save();

            $this->notifier->notify("Booking #{$booking->id} dibuat dengan status: {$booking->status}");

            return response()->json([
                'success' => true,
                'message' => 'Kamar berhasil dipesan.',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * UPDATE Booking (Proceed State: DIPESAN -> MENUNGGU PEMBAYARAN)
     */
    public function proceedBooking(string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        try {
            $context = $booking->getStateContext();
            $context->konfirmasiPesanan();

            $booking->status = $context->getStatus();
            $booking->save();

            $this->notifier->notify("Booking #{$booking->id} dikonfirmasi, menunggu pembayaran.");

            return response()->json([
                'success' => true,
                'message' => 'Pesanan dikonfirmasi.',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * PAY Booking (State: MENUNGGU PEMBAYARAN -> DIKONFIRMASI)
     */
    public function payBooking(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'metode_pembayaran' => 'required|in:TRANSFER,DOMPET_DIGITAL,QRIS,CASH'
        ]);

        $booking = Booking::findOrFail($id);

        try {
            // 1. Validasi State
            $context = $booking->getStateContext();
            $context->bayar(); // Jika belum 'MENUNGGU PEMBAYARAN', akan throw Exception

            // 2. Terapkan Payment Strategy
            $strategy = match($request->metode_pembayaran) {
                'TRANSFER' => new TransferBankStrategy(),
                'DOMPET_DIGITAL' => new DompetDigitalStrategy(),
                'QRIS' => new QRISStrategy(),
                'CASH' => new \App\Services\Patterns\Strategy\CashStrategy(),
            };

            $paymentResult = $strategy->pay($booking->total, $booking->toArray());

            // 3. Simpan State dan Informasi Pembayaran
            $booking->status = $context->getStatus();
            $booking->metode_bayar = $request->metode_pembayaran;
            $booking->catatan = $request->metode_pembayaran === 'CASH' 
                ? 'Menunggu verifikasi pembayaran tunai dari Manager.' 
                : 'Otomatis disetujui sistem.';
            $booking->save();

            TransactionHistoryManager::getInstance()->recordTransaction($id, $booking->total, $booking->status);
            $this->notifier->notify("Pembayaran untuk Booking #{$booking->id} telah diterima.");

            // 4. OTOMATIS TERIMA (APPROVE) KAMAR JIKA BUKAN CASH
            if ($request->metode_pembayaran !== 'CASH') {
                $context = $booking->getStateContext();
                $context->approve(); // Transisi DIKONFIRMASI -> DIHUNI

                $booking->status = $context->getStatus();
                $booking->tgl_masuk = now();
                $booking->tgl_keluar = now()->addMonths($booking->durasi_bulan);
                $booking->save();

                // Ubah status kamar di master data
                $kamar = Kamar::findOrFail($booking->kamar_id);
                $kamar->status = 'Dihuni';
                $kamar->save();

                $this->notifier->notify("Booking #{$booking->id} disetujui. Selamat datang!");
            } else {
                $this->notifier->notify("Booking #{$booking->id} menunggu verifikasi tunai.");
            }

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil dan kamar langsung dihuni.',
                'data' => $booking,
                'payment_info' => $paymentResult
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * APPROVE Booking (State: DIKONFIRMASI -> DIHUNI) - Admin Only
     */
    public function approveBooking(string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        try {
            $context = $booking->getStateContext();
            $context->approve();

            $booking->status = $context->getStatus();
            // Set tanggal masuk = sekarang, tgl keluar = skrg + durasi bulan
            $booking->tgl_masuk = now();
            $booking->tgl_keluar = now()->addMonths($booking->durasi_bulan);
            $booking->save();

            // Ubah status kamar di master data
            $kamar = Kamar::findOrFail($booking->kamar_id);
            $kamar->status = 'Dihuni';
            $kamar->save();

            $this->notifier->notify("Booking #{$booking->id} disetujui. Selamat datang!");

            return response()->json([
                'success' => true,
                'message' => 'Booking disetujui.',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * REJECT Booking (State: DIKONFIRMASI -> TERSEDIA) - Admin Only
     */
    public function rejectBooking(string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        try {
            $context = $booking->getStateContext();
            $context->tolak();

            $booking->status = $context->getStatus();
            $booking->save();

            $this->notifier->notify("Booking #{$booking->id} ditolak karena pembayaran tidak valid.");

            return response()->json([
                'success' => true,
                'message' => 'Booking ditolak.',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * EVICT/KOSONGKAN Kamar oleh Admin berdasarkan Kamar ID
     */
    public function evictByRoom(string $kamarId): JsonResponse
    {
        // Cari booking aktif untuk kamar ini
        $booking = Booking::where('kamar_id', $kamarId)
            ->where('status', 'DIHUNI')
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Tidak ada tenant aktif di kamar ini.'], 404);
        }

        try {
            $context = $booking->getStateContext();
            $context->checkOut();

            $booking->status = $context->getStatus();
            $booking->tgl_keluar = now(); // Catat waktu keluar riil
            $booking->save();

            // Ubah status kamar di master data kembali tersedia
            $kamar = Kamar::findOrFail($booking->kamar_id);
            $kamar->status = 'TERSEDIA'; // Pastikan uppercase sesuai model
            $kamar->save();

            $this->notifier->notify("Booking #{$booking->id} telah diakhiri oleh Admin.");

            return response()->json([
                'success' => true,
                'message' => 'Tenant berhasil dikeluarkan dan kamar tersedia kembali.',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * CHECKOUT Booking (State: DIHUNI -> TERSEDIA)
     */
    public function checkOutBooking(string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        try {
            $context = $booking->getStateContext();
            $context->checkOut();

            $booking->status = $context->getStatus();
            $booking->save();

            // Ubah status kamar di master data kembali tersedia
            $kamar = Kamar::findOrFail($booking->kamar_id);
            $kamar->status = 'TERSEDIA'; // Pastikan uppercase
            $kamar->save();

            $this->notifier->notify("Booking #{$booking->id} telah selesai. Terima kasih!");

            return response()->json([
                'success' => true,
                'message' => 'Checkout berhasil.',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * GET User Bookings
     */
    public function getUserBookings(Request $request): JsonResponse
    {
        $user = Auth::user();
        $bookings = Booking::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }
}
