<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
