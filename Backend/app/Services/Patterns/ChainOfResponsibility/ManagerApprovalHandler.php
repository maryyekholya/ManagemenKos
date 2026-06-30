<?php

namespace App\Services\Patterns\ChainOfResponsibility;

class ManagerApprovalHandler extends Handler
{
    public function handle(array $request)
    {
        if (isset($request['type']) && in_array($request['type'], ['refund', 'discount', 'major_complaint'])) {
            // Logika spesifik manager (contoh: mengecek limit budget refund, dsb)
            // Di sini diasumsikan manager selalu approve
            return [
                'status' => 'approved_by_manager',
                'message' => 'Disetujui secara khusus oleh Manager.',
                'handled_by' => 'manager'
            ];
        }

        // Default handler
        return [
            'status' => 'rejected',
            'message' => 'Tidak ada handler yang bisa memproses tipe request ini.',
            'handled_by' => 'system'
        ];
    }
}
