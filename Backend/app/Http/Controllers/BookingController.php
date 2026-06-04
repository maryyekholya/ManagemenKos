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
}
