<?php

namespace App\Services\Patterns\Singleton;

class FinanceReportManager
{
    private static ?FinanceReportManager $instance = null;
    private array $reports = [];

    private function __construct() {}

    public static function getInstance(): FinanceReportManager
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function generateMonthlyReport(string $month, string $year): array
    {
        // Simulasi pembuatan laporan
        $reportId = "REP-{$year}-{$month}";
        $this->reports[$reportId] = [
            'id' => $reportId,
            'period' => "{$month}/{$year}",
            'total_income' => 15000000,
            'status' => 'Generated'
        ];
        return $this->reports[$reportId];
    }
}
