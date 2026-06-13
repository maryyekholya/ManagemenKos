<?php

namespace App\Services\Patterns\Observer;

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
        $this->observers[] = $observer;
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
        // Simulasi kirim email
        error_log("Email sent: " . $message);
    }
}

class SMSObserver implements Observer
{
    public function update(string $message): void
    {
        // Simulasi kirim SMS
        error_log("SMS sent: " . $message);
    }
}
