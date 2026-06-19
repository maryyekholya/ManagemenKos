<?php

namespace App\Services\Patterns\Adapter;

use Illuminate\Support\Facades\Log;

/**
 * Adapter Pattern untuk mengonversi antarmuka SDK Midtrans eksternal 
 * menjadi PaymentGateway lokal yang dimengerti oleh sistem kita.
 */
class MidtransAdapter implements PaymentGateway
{
    protected $midtransClient;

    public function __construct()
    {
        // Simulasi inisialisasi SDK Midtrans asli
        // $this->midtransClient = new \Midtrans\Snap();
        $this->midtransClient = new \stdClass(); 
    }

    public function pay(string $orderId, float $amount): bool
    {
        // Simulasi pemetaan parameter dari format lokal ke format spesifik Midtrans
        // $params = [
        //     'transaction_details' => [
        //         'order_id' => $orderId,
        //         'gross_amount' => $amount,
        //     ]
        // ];
        // return $this->midtransClient->createTransaction($params);
        
        Log::info("Pembayaran sebesar {$amount} untuk transaksi {$orderId} diproses via Midtrans Adapter.");
        return true;
    }
}
