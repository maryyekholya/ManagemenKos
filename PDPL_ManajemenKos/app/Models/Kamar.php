<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Kamar
 * Merepresentasikan unit kamar kos dalam sistem NestIn.
 */
class Kamar extends Model
{
    use HasFactory;

    protected $table = 'kamars';

    protected $fillable = [
        'nomor',
        'tipe',
        'harga_dasar',
        'fasilitas',
        'status',
        'foto_url',
        'lantai',
        'deskripsi',
    ];

    protected $casts = [
        'fasilitas'   => 'array',
        'harga_dasar' => 'integer',
        'lantai'      => 'integer',
    ];

    // Relasi
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Helper
    public function isTersedia(): bool
    {
        return $this->status === 'TERSEDIA';
    }

    // Formatted price untuk tampilan view
    public function getFormattedHargaAttribute(): string
    {
        return 'Rp ' . number_format($this->harga_dasar, 0, ',', '.');
    }
}
