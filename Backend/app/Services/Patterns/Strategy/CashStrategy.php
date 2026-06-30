<?php

namespace App\Services\Patterns\Strategy;

class CashStrategy implements PaymentStrategyInterface
{
    public function pay(float $amount, array $bookingData): array
    {
        return [
            'status' => 'PENDING',
            'metode' => 'CASH',
            'pesan' => 'Silahkan lakukan pembayaran tunai kepada pengurus kos saat tiba di lokasi. Pembayaran Anda akan diverifikasi secara manual oleh Manager.',
            'amount_to_pay' => $amount
        ];
    }
}
