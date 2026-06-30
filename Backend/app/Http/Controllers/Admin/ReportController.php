<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Patterns\Builder\FinancialReportBuilder;

class ReportController extends Controller
{
    public function financial(Request $request)
    {
        $builder = new FinancialReportBuilder();
        $report = $builder->setMonth($request->get('month'))
            ->setYear($request->get('year'))
            ->setRoomType($request->get('roomType'))
            ->build();

        return response()->json([
            'success' => true,
            'data' => $report['data'],
            'total_revenue' => $report['total_revenue'],
            'total_transactions' => $report['total_transactions']
        ]);
    }

    public function exportCsv(Request $request)
    {
        $builder = new FinancialReportBuilder();
        $report = $builder->setMonth($request->get('month'))
            ->setYear($request->get('year'))
            ->setRoomType($request->get('roomType'))
            ->build();

        $filename = "laporan-keuangan-" . date('Y-m-d') . ".csv";
        
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($report) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID Transaksi', 'Tanggal', 'Penyewa', 'Kamar', 'Metode', 'Nominal', 'Midtrans ID']);

            foreach ($report['data'] as $row) {
                fputcsv($file, [
                    $row->payment_id,
                    $row->tanggal,
                    $row->user_name ?? 'System',
                    "Kamar " . $row->kamar_nomor,
                    $row->metode,
                    $row->jumlah,
                    $row->midtrans_id ?? 'MANUAL'
                ]);
            }
            
            fputcsv($file, []);
            fputcsv($file, ['', '', '', '', 'TOTAL PENDAPATAN', $report['total_revenue'], '']);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
