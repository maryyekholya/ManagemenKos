<?php

namespace App\Services\Patterns\Observer;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Mail\TransactionReceipt;

interface Observer
{
    public function update(string $message): void;
}

interface Subject
{
    public function attach(Observer $observer): void;
    public function detach(Observer $observer): void;
    public function notify(string $message): void;
}

class NotificationManager implements Subject
{
    private array $observers = [];

    public function attach(Observer $observer): void
    {
        // Hindari duplikasi observer
        if (!in_array($observer, $this->observers, true)) {
            $this->observers[] = $observer;
        }
    }

    public function detach(Observer $observer): void
    {
        $this->observers = array_filter($this->observers, fn($obs) => $obs !== $observer);
    }

    public function notify(string $message): void
    {
        foreach ($this->observers as $observer) {
            $observer->update($message);
        }
    }
}

class EmailObserver implements Observer
{
    public function update(string $message): void
    {
        $email = Auth::user()?->email ?? 'guest@example.com';
        
        try {
            Mail::to($email)->send(new TransactionReceipt($message));
            Log::info("Email sent to {$email}: " . $message);
        } catch (\Exception $e) {
            Log::error("Failed to send email to {$email}: " . $e->getMessage());
        }
    }
}

class WhatsAppObserver implements Observer
{
    public function update(string $message): void
    {
        // Simulasi integrasi API WhatsApp (misal: Twilio atau Watzap)
        $phone = Auth::user()?->phone ?? '080000000000';
        error_log("[WhatsApp API] Mengirim pesan ke {$phone}: " . $message);
    }
}

class PushNotifObserver implements Observer
{
    public function update(string $message): void
    {
        // Simulasi integrasi Push Notification (misal: Firebase Cloud Messaging / OneSignal)
        $userId = Auth::id() ?? 'guest';
        error_log("[Push Notification] Mengirim notifikasi ke device user {$userId}: " . $message);
    }
}
