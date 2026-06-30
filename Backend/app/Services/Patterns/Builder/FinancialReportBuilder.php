<?php

namespace App\Services\Patterns\Builder;

use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class FinancialReportBuilder implements ReportBuilderInterface
{
    protected $query;

    public function __construct()
    {
        $this->query = Payment::query()
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('kamars', 'bookings.kamar_id', '=', 'kamars.id')
            ->where('payments.status', 'SUCCESS')
            ->select(
                'payments.id as payment_id',
                'payments.tanggal',
                'payments.metode',
                'payments.jumlah',
                'payments.midtrans_id',
                'bookings.user_name',
                'kamars.nomor as kamar_nomor',
                'kamars.tipe as kamar_tipe'
            );
    }

    public function setMonth(?string $month): self
    {
        if ($month && $month !== 'all') {
            $this->query->whereMonth('payments.tanggal', $month);
        }
        return $this;
    }

    public function setYear(?string $year): self
    {
        if ($year && $year !== 'all') {
            $this->query->whereYear('payments.tanggal', $year);
        }
        return $this;
    }

    public function setRoomType(?string $roomType): self
    {
        if ($roomType && $roomType !== 'all') {
            $this->query->where('kamars.tipe', $roomType);
        }
        return $this;
    }

    public function build(): array
    {
        $data = $this->query->orderBy('payments.tanggal', 'desc')->get();
        $totalRevenue = $data->sum('jumlah');

        return [
            'total_revenue' => $totalRevenue,
            'total_transactions' => $data->count(),
            'data' => $data
        ];
    }
}
