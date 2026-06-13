<?php

namespace App\Services\Patterns\Strategy;

interface ComplaintHandlingStrategy
{
    public function handle(string $complaintId): void;
}

class HighPriorityComplaintStrategy implements ComplaintHandlingStrategy
{
    public function handle(string $complaintId): void
    {
        // Segera notifikasi admin dan tim teknis
        error_log("Handling high priority complaint: $complaintId");
    }
}

class LowPriorityComplaintStrategy implements ComplaintHandlingStrategy
{
    public function handle(string $complaintId): void
    {
        // Masukkan ke antrean regular
        error_log("Handling low priority complaint: $complaintId");
    }
}
