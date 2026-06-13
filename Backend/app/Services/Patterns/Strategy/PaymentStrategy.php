<?php

namespace App\Services\Patterns\Strategy;

interface PaymentStrategy
{
    public function pay(float $amount): bool;
}

class CashPaymentStrategy implements PaymentStrategy
{
    public function pay(float $amount): bool
    {
        // Proses pembayaran cash
        return true;
    }
}

class TransferPaymentStrategy implements PaymentStrategy
{
    public function pay(float $amount): bool
    {
        // Proses pembayaran transfer
        return true;
    }
}

class QRISPaymentStrategy implements PaymentStrategy
{
    public function pay(float $amount): bool
    {
        // Proses pembayaran QRIS
        return true;
    }
}
