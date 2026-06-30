<?php

namespace App\Services\Patterns\Command;

use App\Models\Booking;

class ApproveBookingCommand implements CommandInterface
{
    protected Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function execute(): mixed
    {
        if ($this->booking->status === 'MENUNGGU_PEMBAYARAN') {
            $this->booking->status = 'DIKONFIRMASI';
        } else if ($this->booking->status === 'DIKONFIRMASI') {
            $this->booking->status = 'DIHUNI';
            $kamar = \App\Models\Kamar::find($this->booking->kamar_id);
            if ($kamar) {
                $kamar->status = 'DIHUNI';
                $kamar->save();
            }
        }

        $this->booking->save();

        // Observer pattern usage
        $notifier = new \App\Services\Patterns\Observer\NotificationManager();
        $notifier->attach(new \App\Services\Patterns\Observer\EmailObserver());
        $notifier->attach(new \App\Services\Patterns\Observer\WhatsAppObserver());
        $notifier->attach(new \App\Services\Patterns\Observer\PushNotifObserver());
        $notifier->notify('Pembayaran Anda telah divalidasi dan booking disetujui.');

        return $this->booking;
    }
}
