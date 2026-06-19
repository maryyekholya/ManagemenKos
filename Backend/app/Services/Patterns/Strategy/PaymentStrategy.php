<?php

namespace App\Services\Patterns\Strategy;

interface PaymentStrategy
{
    public function pay(float $amount, array $bookingData): array;
}

/**
 * Strategy untuk Transfer Bank Manual
 */
class TransferBankStrategy implements PaymentStrategy
{
    public function pay(float $amount, array $bookingData): array
    {
        // Generate nomor rekening & instruksi transfer manual (serta kode unik jika ada)
        $kodeUnik = rand(100, 999);
        $totalBayar = $amount + $kodeUnik;

        return [
            'status' => 'success',
            'method' => 'TRANSFER_BANK',
            'total_amount' => $totalBayar,
            'instructions' => "Silakan transfer sebesar Rp" . number_format($totalBayar, 0, ',', '.') . " ke Rekening BCA 123456789 a/n Kos Pintar.",
            'requires_upload' => true // Membutuhkan konfirmasi/upload bukti transfer manual
        ];
    }
}

/**
 * Strategy untuk Dompet Digital (GoPay, OVO, dll)
 */
class DompetDigitalStrategy implements PaymentStrategy
{
    public function pay(float $amount, array $bookingData): array
    {
        // Membuat link pembayaran untuk di-redirect ke aplikasi GoPay/OVO
        // Disimulasikan dengan deep link
        $paymentLink = "https://payment-gateway.dummy/ewallet/pay?amount=" . $amount . "&ref=" . uniqid();

        return [
            'status' => 'success',
            'method' => 'DOMPET_DIGITAL',
            'total_amount' => $amount,
            'redirect_url' => $paymentLink,
            'instructions' => "Klik link pembayaran untuk membuka aplikasi GoPay/OVO Anda.",
            'requires_upload' => false // Gateway akan memberi callback otomatis
        ];
    }
}

/**
 * Strategy untuk Pembayaran via QRIS
 */
class QRISStrategy implements PaymentStrategy
{
    public function pay(float $amount, array $bookingData): array
    {
        // Generate kode QRIS dinamis untuk dipindai
        $qrCodeData = "00020101021126570011ID.CO.QRIS...[DUMMY_QR_PAYLOAD]...540" . strlen($amount) . $amount;

        return [
            'status' => 'success',
            'method' => 'QRIS',
            'total_amount' => $amount,
            'qr_code_string' => $qrCodeData,
            'instructions' => "Silakan scan kode QRIS berikut menggunakan aplikasi m-Banking atau E-Wallet Anda.",
            'requires_upload' => false // Gateway akan memberi callback otomatis
        ];
    }
}
