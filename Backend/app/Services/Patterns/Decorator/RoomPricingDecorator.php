<?php

namespace App\Services\Patterns\Decorator;

/**
 * Base Decorator
 */
abstract class RoomPricingDecorator implements RoomPricing
{
    protected RoomPricing $roomPricing;

    public function __construct(RoomPricing $roomPricing)
    {
        $this->roomPricing = $roomPricing;
    }

    public function getPrice(): float
    {
        return $this->roomPricing->getPrice();
    }

    public function getDescription(): string
    {
        return $this->roomPricing->getDescription();
    }
}
