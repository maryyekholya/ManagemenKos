<?php

namespace App\Services\Patterns\Singleton;

class TransactionHistoryManager
{
    private static ?TransactionHistoryManager $instance = null;
    private array $transactions = [];

    private function __construct() {}

    public static function getInstance(): TransactionHistoryManager
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function recordTransaction(string $bookingId, float $amount, string $status): void
    {
        $this->transactions[] = [
            'booking_id' => $bookingId,
            'amount' => $amount,
            'status' => $status,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    public function getHistory(): array
    {
        return $this->transactions;
    }
}
