<?php

namespace App\Services\Patterns\Command;

interface CommandInterface
{
    public function execute(): mixed;
}
