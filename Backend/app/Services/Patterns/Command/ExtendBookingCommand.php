<?php

namespace App\Services\Patterns\Command;

use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;

class ExtendBookingCommand implements CommandInterface
{
    protected Booking $booking;
    protected int $tambahanBulan;

    public function __construct(Booking $booking, int $tambahanBulan = 1)
    {
        $this->booking = $booking;
        $this->tambahanBulan = $tambahanBulan;
    }

    public function execute(): mixed
    {
        $hargaPerBulan = $this->booking->kamar->harga_per_bulan ?? $this->booking->kamar->harga_dasar;
        $totalTambahan = $hargaPerBulan * $this->tambahanBulan;

        // Update tgl keluar
        $tglKeluarBaru = Carbon::parse($this->booking->tgl_keluar)->addMonths($this->tambahanBulan);
        
        $this->booking->tgl_keluar = $tglKeluarBaru;
        $this->booking->durasi_bulan += $this->tambahanBulan;
        $this->booking->total += $totalTambahan;
        $this->booking->save();

        // Buat tagihan payment baru
        $payment = Payment::create([
            'booking_id' => $this->booking->id,
            'jumlah' => $totalTambahan,
            'metode' => 'TRANSFER_BANK',
            'status' => 'PENDING',
            'tanggal' => now()
        ]);

        return [
            'booking' => $this->booking,
            'payment' => $payment
        ];
    }
}
