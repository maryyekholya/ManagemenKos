<?php

namespace App\Services\Patterns\State;

interface BookingState
{
    public function proceed(BookingContext $context): void;
    public function cancel(BookingContext $context): void;
    public function getStatus(): string;
}

class BookingContext
{
    private BookingState $state;

    public function __construct(BookingState $state)
    {
        $this->state = $state;
    }

    public function setState(BookingState $state): void
    {
        $this->state = $state;
    }

    public function proceed(): void
    {
        $this->state->proceed($this);
    }

    public function cancel(): void
    {
        $this->state->cancel($this);
    }

    public function getStatus(): string
    {
        return $this->state->getStatus();
    }
}

class PendingState implements BookingState
{
    public function proceed(BookingContext $context): void
    {
        $context->setState(new ConfirmedState());
    }

    public function cancel(BookingContext $context): void
    {
        $context->setState(new CanceledState());
    }

    public function getStatus(): string
    {
        return 'PENDING';
    }
}

class ConfirmedState implements BookingState
{
    public function proceed(BookingContext $context): void
    {
        // Already confirmed, maybe proceed to completed
    }

    public function cancel(BookingContext $context): void
    {
        $context->setState(new CanceledState());
    }

    public function getStatus(): string
    {
        return 'CONFIRMED';
    }
}

class CanceledState implements BookingState
{
    public function proceed(BookingContext $context): void
    {
        throw new \Exception("Cannot proceed a canceled booking.");
    }

    public function cancel(BookingContext $context): void
    {
        // Already canceled
    }

    public function getStatus(): string
    {
        return 'CANCELED';
    }
}
