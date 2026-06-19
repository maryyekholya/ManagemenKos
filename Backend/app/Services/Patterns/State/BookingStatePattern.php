<?php

namespace App\Services\Patterns\State;

use Exception;

/**
 * Interface untuk State Pattern
 * Menjamin hanya aksi tertentu yang valid di setiap state
 */
interface BookingState
{
    public function pesan(BookingContext $context): void;
    public function konfirmasiPesanan(BookingContext $context): void;
    public function batal(BookingContext $context): void;
    public function bayar(BookingContext $context): void;
    public function approve(BookingContext $context): void;
    public function tolak(BookingContext $context): void;
    public function checkOut(BookingContext $context): void;
    public function getStatus(): string;
}

class BookingContext
{
    private BookingState $state;

    public function __construct(BookingState $state = null)
    {
        // Default awal jika tidak ada adalah TERSEDIA
        $this->state = $state ?? new TersediaState();
    }

    public function setState(BookingState $state): void
    {
        $this->state = $state;
    }

    public function getState(): BookingState
    {
        return $this->state;
    }

    public function pesan(): void
    {
        $this->state->pesan($this);
    }

    public function konfirmasiPesanan(): void
    {
        $this->state->konfirmasiPesanan($this);
    }

    public function batal(): void
    {
        $this->state->batal($this);
    }

    public function bayar(): void
    {
        $this->state->bayar($this);
    }

    public function approve(): void
    {
        $this->state->approve($this);
    }

    public function tolak(): void
    {
        $this->state->tolak($this);
    }

    public function checkOut(): void
    {
        $this->state->checkOut($this);
    }

    public function getStatus(): string
    {
        return $this->state->getStatus();
    }
}

/**
 * [STATE 1] TERSEDIA
 */
class TersediaState implements BookingState
{
    public function pesan(BookingContext $context): void
    {
        $context->setState(new DipesanState());
    }

    public function konfirmasiPesanan(BookingContext $context): void { throw new Exception("Kamar belum dipesan, tidak bisa konfirmasi."); }
    public function batal(BookingContext $context): void { throw new Exception("Tidak ada pesanan yang bisa dibatalkan."); }
    public function bayar(BookingContext $context): void { throw new Exception("Belum ada pesanan untuk dibayar."); }
    public function approve(BookingContext $context): void { throw new Exception("Belum ada pembayaran yang perlu diapprove."); }
    public function tolak(BookingContext $context): void { throw new Exception("Belum ada pembayaran yang perlu ditolak."); }
    public function checkOut(BookingContext $context): void { throw new Exception("Kamar sedang kosong, tidak bisa check-out."); }

    public function getStatus(): string
    {
        return 'TERSEDIA';
    }
}

/**
 * [STATE 2] DIPESAN
 */
class DipesanState implements BookingState
{
    public function pesan(BookingContext $context): void { throw new Exception("Kamar sudah dipesan orang lain."); }
    
    public function konfirmasiPesanan(BookingContext $context): void
    {
        $context->setState(new MenungguPembayaranState());
    }

    public function batal(BookingContext $context): void
    {
        $context->setState(new TersediaState());
    }

    public function bayar(BookingContext $context): void { throw new Exception("Harap konfirmasi data pesanan terlebih dahulu."); }
    public function approve(BookingContext $context): void { throw new Exception("Belum ada pembayaran."); }
    public function tolak(BookingContext $context): void { throw new Exception("Belum ada pembayaran."); }
    public function checkOut(BookingContext $context): void { throw new Exception("Kamar belum dihuni."); }

    public function getStatus(): string
    {
        return 'DIPESAN';
    }
}

/**
 * [STATE 3] MENUNGGU PEMBAYARAN
 */
class MenungguPembayaranState implements BookingState
{
    public function pesan(BookingContext $context): void { throw new Exception("Kamar sudah dipesan."); }
    public function konfirmasiPesanan(BookingContext $context): void { throw new Exception("Pesanan sudah dikonfirmasi, menunggu pembayaran."); }
    
    public function batal(BookingContext $context): void
    {
        $context->setState(new TersediaState());
    }

    public function bayar(BookingContext $context): void
    {
        $context->setState(new DikonfirmasiState());
    }

    public function approve(BookingContext $context): void { throw new Exception("Penghuni belum membayar."); }
    public function tolak(BookingContext $context): void { throw new Exception("Penghuni belum membayar."); }
    public function checkOut(BookingContext $context): void { throw new Exception("Kamar belum dihuni."); }

    public function getStatus(): string
    {
        return 'MENUNGGU PEMBAYARAN';
    }
}

/**
 * [STATE 4] DIKONFIRMASI (Menunggu Approval Admin)
 */
class DikonfirmasiState implements BookingState
{
    public function pesan(BookingContext $context): void { throw new Exception("Kamar sudah dibayar."); }
    public function konfirmasiPesanan(BookingContext $context): void { throw new Exception("Kamar sudah dibayar."); }
    public function batal(BookingContext $context): void { throw new Exception("Pembayaran sudah masuk, tidak bisa batal otomatis (harus refund admin)."); }
    public function bayar(BookingContext $context): void { throw new Exception("Kamar sudah dibayar, menunggu admin approve."); }

    public function approve(BookingContext $context): void
    {
        $context->setState(new DihuniState());
    }

    public function tolak(BookingContext $context): void
    {
        // Jika ditolak, kamar kembali tersedia (refund dilakukan di luar state pattern ini)
        $context->setState(new TersediaState());
    }

    public function checkOut(BookingContext $context): void { throw new Exception("Kamar belum dihuni (baru tahap konfirmasi)."); }

    public function getStatus(): string
    {
        return 'DIKONFIRMASI';
    }
}

/**
 * [STATE 5] DIHUNI
 */
class DihuniState implements BookingState
{
    public function pesan(BookingContext $context): void { throw new Exception("Kamar sedang dihuni."); }
    public function konfirmasiPesanan(BookingContext $context): void { throw new Exception("Kamar sedang dihuni."); }
    public function batal(BookingContext $context): void { throw new Exception("Kamar sedang dihuni."); }
    public function bayar(BookingContext $context): void { throw new Exception("Kamar sedang dihuni."); }
    public function approve(BookingContext $context): void { throw new Exception("Kamar sedang dihuni."); }
    public function tolak(BookingContext $context): void { throw new Exception("Kamar sedang dihuni."); }

    public function checkOut(BookingContext $context): void
    {
        $context->setState(new TersediaState());
    }

    public function getStatus(): string
    {
        return 'DIHUNI';
    }
}
