<?php

namespace App\Services\Patterns\Decorator;

class ParkingAddon extends RoomPricingDecorator
{
    public function getPrice(): float
    {
        return $this->roomPricing->getPrice() + 50000; // Harga ekstra 50rb
    }

    public function getDescription(): string
    {
        return $this->roomPricing->getDescription() . ' + Akses Parkir Kendaraan';
    }
}
