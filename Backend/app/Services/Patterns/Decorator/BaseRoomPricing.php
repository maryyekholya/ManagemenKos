<?php

namespace App\Services\Patterns\Decorator;

use App\Models\Kamar;

/**
 * Konkret Komponen (Concrete Component)
 */
class BaseRoomPricing implements RoomPricing
{
    protected Kamar $kamar;

    public function __construct(Kamar $kamar)
    {
        $this->kamar = $kamar;
    }

    public function getPrice(): float
    {
        return (float) $this->kamar->harga_per_bulan;
    }

    public function getDescription(): string
    {
        return "Sewa Kamar Dasar ({$this->kamar->nomor})";
    }
}
