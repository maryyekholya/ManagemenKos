<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * ComplaintAttachmentController
 *
 * MVC Role: Controller
 * Menangani upload file lampiran untuk laporan keluhan pengguna.
 * File disimpan di storage/app/public/complaints/ dan dapat diakses
 * secara publik melalui symlink (php artisan storage:link).
 */
class ComplaintAttachmentController extends Controller
{
    /**
     * Upload attachment file untuk keluhan.
     *
     * POST /api/v1/complaints/upload-attachment
     * Body: multipart/form-data dengan field 'attachment'
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        // Validasi file: hanya gambar dan PDF, maksimal 5MB
        $request->validate([
            'attachment' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,gif,webp,pdf',
                'max:5120', // 5MB dalam kilobytes
            ],
        ], [
            'attachment.required'  => 'File lampiran wajib disertakan.',
            'attachment.file'      => 'Input harus berupa file.',
            'attachment.mimes'     => 'Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, atau PDF.',
            'attachment.max'       => 'Ukuran file maksimal adalah 5MB.',
        ]);

        $file = $request->file('attachment');

        // Generate nama file unik agar tidak bentrok
        $extension = $file->getClientOriginalExtension();
        $filename  = 'complaint_' . now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $extension;

        // Simpan ke storage/app/public/complaints/
        $path = $file->storeAs('complaints', $filename, 'public');

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan file. Coba lagi.',
            ], 500);
        }

        // URL publik (memerlukan: php artisan storage:link)
        $publicUrl = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'message' => 'File berhasil diupload.',
            'data'    => [
                'url'          => $publicUrl,
                'filename'     => $filename,
                'original_name'=> $file->getClientOriginalName(),
                'size'         => $file->getSize(),
                'mime_type'    => $file->getMimeType(),
            ],
        ], 201);
    }
}
