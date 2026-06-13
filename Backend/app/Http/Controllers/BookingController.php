<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\Patterns\State\BookingContext;
use App\Services\Patterns\State\PendingState;
use App\Services\Patterns\Observer\NotificationManager;
use App\Services\Patterns\Observer\EmailObserver;
use App\Services\Patterns\Observer\SMSObserver;
use App\Services\Patterns\Singleton\TransactionHistoryManager;

class BookingController extends Controller
{
    private NotificationManager $notifier;

    public function __construct()
    {
        $this->notifier = new NotificationManager();
        $this->notifier->attach(new EmailObserver());
        $this->notifier->attach(new SMSObserver());
    }

    /**
     * CREATE Booking (State: Pending)
     */
    public function createBooking(Request $request): JsonResponse
    {
        $context = new BookingContext(new PendingState());
        $status = $context->getStatus();

        // Observer pattern in action
        $this->notifier->notify("New booking created with status: $status");

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'status' => $status
        ]);
    }

    /**
     * UPDATE Booking (Proceed State)
     */
    public function proceedBooking(string $id): JsonResponse
    {
        $context = new BookingContext(new PendingState());
        $context->proceed(); // Transisi ke ConfirmedState
        $newStatus = $context->getStatus();

        $this->notifier->notify("Booking $id status updated to: $newStatus");
        
        // Singleton pattern in action
        TransactionHistoryManager::getInstance()->recordTransaction($id, 500000, $newStatus);

        return response()->json([
            'success' => true,
            'message' => 'Booking proceeded successfully',
            'new_status' => $newStatus
        ]);
    }

    /**
     * EXTEND RENT (Perpanjang Masa Sewa)
     */
    public function extendRent(Request $request, string $id): JsonResponse
    {
        // Dalam implementasi nyata, akan mengambil dari database berdasarkan $id
        // Simulasi logika bisnis perpanjangan durasi sewa
        
        $months = $request->input('months', 1);
        $amount = $request->input('amount', 0); // Harga per bulan * months
        
        // Asumsi State masih Occupied/Confirmed, maka kita buat Payment Record baru
        TransactionHistoryManager::getInstance()->recordTransaction($id, $amount, 'EXTEND_RENT_SUCCESS');
        $this->notifier->notify("Booking $id diperpanjang selama $months bulan.");

        return response()->json([
            'success' => true,
            'message' => 'Durasi sewa berhasil diperpanjang',
            'data' => [
                'booking_id' => $id,
                'added_months' => $months,
                'total_amount_paid' => $amount,
                // tgl_keluar yang baru dikalkulasikan di frontend dan direflect di DB nyata
            ]
        ]);
    }
}
