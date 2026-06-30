<?php

namespace App\Services\Patterns\Builder;

interface ReportBuilderInterface
{
    public function setMonth(?string $month): self;
    public function setYear(?string $year): self;
    public function setRoomType(?string $roomType): self;
    public function build(): array;
}
