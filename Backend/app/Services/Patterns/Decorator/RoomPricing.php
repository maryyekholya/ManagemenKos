<?php

namespace App\Services\Patterns\Decorator;

/**
 * Komponen dasar antarmuka harga (Component dalam Decorator Pattern)
 */
interface RoomPricing
{
    public function getPrice(): float;
    public function getDescription(): string;
}
