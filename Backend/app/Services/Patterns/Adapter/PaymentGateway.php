<?php

namespace App\Services\Patterns\Adapter;

/**
 * Target interface yang diharapkan oleh sistem lokal kita.
 */
interface PaymentGateway
{
    public function pay(string $orderId, float $amount): bool;
}
