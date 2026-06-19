<?php

namespace App\Services\Patterns\Strategy;

interface ComplaintHandlingStrategy
{
    public function handle(string $complaintId, array $complaintData): void;
}

/**
 * Strategy untuk Keluhan Fasilitas (Kamar bocor, AC rusak, dll)
 * Prioritas Tinggi, notifikasi ke teknisi, target respon 1x24 jam
 */
class KeluhanFasilitasStrategy implements ComplaintHandlingStrategy
{
    public function handle(string $complaintId, array $complaintData): void
    {
        // 1. Beri label PRIORITAS TINGGI
        // 2. Set target respon 1x24 jam
        // 3. Kirim notifikasi langsung ke Tim Teknisi
        error_log("[FASILITAS - TINGGI] Keluhan {$complaintId} ditangani. Menghubungi teknisi. Target: 1x24 Jam");
    }
}

/**
 * Strategy untuk Keluhan Administrasi (Tagihan salah, pembayaran gagal)
 * Label Keuangan, notifikasi ke admin keuangan, target respon 2x24 jam
 */
class KeluhanAdministrasiStrategy implements ComplaintHandlingStrategy
{
    public function handle(string $complaintId, array $complaintData): void
    {
        // 1. Beri label KEUANGAN
        // 2. Set target respon 2x24 jam
        // 3. Kirim notifikasi langsung ke Admin Keuangan
        error_log("[ADMINISTRASI - KEUANGAN] Keluhan {$complaintId} ditangani. Diteruskan ke Admin Keuangan. Target: 2x24 Jam");
    }
}

/**
 * Strategy untuk Keluhan Lingkungan (Tetangga berisik, parkir sembarangan)
 * Label Umum, masuk antrean standar, target respon 3x24 jam
 */
class KeluhanLingkunganStrategy implements ComplaintHandlingStrategy
{
    public function handle(string $complaintId, array $complaintData): void
    {
        // 1. Beri label UMUM
        // 2. Set target respon 3x24 jam
        // 3. Masuk antrean standar untuk di-review admin/pengelola
        error_log("[LINGKUNGAN - UMUM] Keluhan {$complaintId} ditangani. Masuk antrean standar. Target: 3x24 Jam");
    }
}
