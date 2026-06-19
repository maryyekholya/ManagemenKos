<?php

namespace App\Services\Patterns\Decorator;

/**
 * Concrete Decorator untuk layanan tambahan (Add-on)
 */
class LaundryAddon extends RoomPricingDecorator
{
    public function getPrice(): float
    {
        return $this->roomPricing->getPrice() + 150000; // Harga ekstra 150rb
    }

    public function getDescription(): string
    {
        return $this->roomPricing->getDescription() . ' + Layanan Laundry Bulanan';
    }
}
