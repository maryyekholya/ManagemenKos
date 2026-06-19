<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Complaint;
use App\Services\Patterns\Strategy\KeluhanFasilitasStrategy;
use App\Services\Patterns\Strategy\KeluhanAdministrasiStrategy;
use App\Services\Patterns\Strategy\KeluhanLingkunganStrategy;

class ComplaintController extends Controller
{
    /**
     * User: Menyampaikan keluhan baru
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'kategori' => 'required|in:FASILITAS,ADMINISTRASI,LINGKUNGAN',
            'deskripsi' => 'required|string',
        ]);

        $user = Auth::user();

        // Simpan ke database
        $complaint = Complaint::create([
            'user_id' => $user->id,
            'kategori' => $request->kategori,
            'deskripsi' => $request->deskripsi,
            'status' => 'TERBUKA',
        ]);

        // Gunakan Strategy Pattern untuk menangani keluhan sesuai kategori
        $strategy = match($request->kategori) {
            'FASILITAS' => new KeluhanFasilitasStrategy(),
            'ADMINISTRASI' => new KeluhanAdministrasiStrategy(),
            'LINGKUNGAN' => new KeluhanLingkunganStrategy(),
        };

        $strategy->handle((string)$complaint->id, $complaint->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Keluhan berhasil disampaikan dan sedang diproses.',
            'data' => $complaint
        ]);
    }

    /**
     * Admin/Manager: Melihat semua keluhan
     */
    public function index(): JsonResponse
    {
        $complaints = Complaint::with('user:id,name,email')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $complaints
        ]);
    }

    /**
     * Admin/Manager: Merespons keluhan
     */
    public function respond(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'respon_manager' => 'required|string'
        ]);

        $complaint = Complaint::findOrFail($id);
        $complaint->respon_manager = $request->respon_manager;
        $complaint->status = 'SELESAI';
        $complaint->save();

        return response()->json([
            'success' => true,
            'message' => 'Keluhan berhasil direspons.',
            'data' => $complaint
        ]);
    }
}
