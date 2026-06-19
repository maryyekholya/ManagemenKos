<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Services\Patterns\State\BookingContext;
use App\Services\Patterns\State\TersediaState;
use App\Services\Patterns\State\DipesanState;
use App\Services\Patterns\State\MenungguPembayaranState;
use App\Services\Patterns\State\DikonfirmasiState;
use App\Services\Patterns\State\DihuniState;

/**
 * Model Booking
 * Menyimpan data pemesanan kamar oleh tenant.
 */
class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'kamar_id',
        'user_id',
        'user_name',
        'tgl_masuk',
        'tgl_keluar',
        'durasi_bulan',
        'status',
        'total',
        'metode_bayar',
        'catatan',
    ];

    protected $casts = [
        'tgl_masuk'   => 'date',
        'tgl_keluar'  => 'date',
        'total'       => 'integer',
        'durasi_bulan' => 'integer',
    ];

    // Relasi
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kamar(): BelongsTo
    {
        return $this->belongsTo(Kamar::class);
    }

    // Helper
    public function isActive(): bool
    {
        return in_array($this->status, ['DIPESAN', 'DIKONFIRMASI', 'DIHUNI']);
    }

    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total, 0, ',', '.');
    }

    public function getStateContext(): BookingContext
    {
        $state = match($this->status) {
            'DIPESAN' => new DipesanState(),
            'MENUNGGU PEMBAYARAN' => new MenungguPembayaranState(),
            'DIKONFIRMASI' => new DikonfirmasiState(),
            'DIHUNI' => new DihuniState(),
            default => new TersediaState(), // TERSEDIA or null
        };

        return new BookingContext($state);
    }
}
