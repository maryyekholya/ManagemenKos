<?php

namespace App\Services\Patterns\ChainOfResponsibility;

class AdminApprovalHandler extends Handler
{
    public function handle(array $request)
    {
        // Jika request tipe normal/perpanjang standar, Admin bisa langsung approve
        if (isset($request['type']) && $request['type'] === 'standard_approval') {
            return [
                'status' => 'approved_by_admin',
                'message' => 'Disetujui oleh Admin.',
                'handled_by' => 'admin'
            ];
        }

        // Jika request tipe kompleks (refund, diskon, komplain mayor), lempar ke Manager
        if (isset($request['type']) && in_array($request['type'], ['refund', 'discount', 'major_complaint'])) {
            return parent::handle($request);
        }

        return parent::handle($request);
    }
}
