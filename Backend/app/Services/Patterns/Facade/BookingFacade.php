<?php

namespace App\Services\Patterns\Facade;

use App\Services\Patterns\State\BookingContext;
use App\Services\Patterns\State\PendingState;
use App\Services\Patterns\Observer\NotificationManager;
use App\Services\Patterns\Observer\EmailObserver;
use App\Services\Patterns\Observer\SMSObserver;

class BookingFacade
{
    protected NotificationManager $notifier;

    public function __construct()
    {
        $this->notifier = new NotificationManager();
        $this->notifier->attach(new EmailObserver());
        $this->notifier->attach(new SMSObserver());
    }

    /**
     * Menyederhanakan proses kompleks pembuatan booking ke dalam satu pemanggilan (Facade Pattern).
     * Melibatkan State Pattern (Context) dan Observer (Notifier).
     */
    public function createNewBooking(array $bookingData): string
    {
        // 1. Inisialisasi State Awal
        $context = new BookingContext(new PendingState());
        $status = $context->getStatus();

        // 2. Logika Database Booking 
        // Aslinya: $booking = Booking::create($bookingData);
        $bookingId = 'BK-' . time();
        
        // 3. Trigger Observer Notifikasi ke berbagai channel (Email, SMS)
        $this->notifier->notify("Booking baru ($bookingId) telah dibuat dengan status: $status");

        return $status;
    }
}
