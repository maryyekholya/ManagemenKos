<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use Illuminate\Http\Request;

/**
 * Admin\KamarController
 * CRUD manajemen data kamar kos.
 */
class KamarController extends Controller
{
    public function index()
    {
        $kamars = Kamar::orderBy('nomor')->get();
        return view('admin.kamar.index', compact('kamars'));
    }

    public function create()
    {
        return view('admin.kamar.form', ['kamar' => null, 'action' => route('admin.kamar.store')]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor'       => 'required|string|unique:kamars,nomor',
            'tipe'        => 'required|in:Standard,Deluxe,Suite',
            'harga_dasar' => 'required|integer|min:100000',
            'lantai'      => 'required|integer|min:1|max:20',
            'fasilitas'   => 'nullable|string',
            'foto_url'    => 'nullable|url',
            'deskripsi'   => 'nullable|string|max:500',
            'status'      => 'required|in:TERSEDIA,DIPESAN,DIHUNI',
        ]);

        // Konversi fasilitas dari textarea (satu per baris) ke array
        $validated['fasilitas'] = $this->parseFasilitas($request->fasilitas);

        Kamar::create($validated);

        return redirect()->route('admin.kamar.index')
                         ->with('success', "Kamar {$validated['nomor']} berhasil ditambahkan.");
    }

    public function edit(Kamar $kamar)
    {
        return view('admin.kamar.form', [
            'kamar'  => $kamar,
            'action' => route('admin.kamar.update', $kamar->id),
        ]);
    }

    public function update(Request $request, Kamar $kamar)
    {
        $validated = $request->validate([
            'nomor'       => "required|string|unique:kamars,nomor,{$kamar->id}",
            'tipe'        => 'required|in:Standard,Deluxe,Suite',
            'harga_dasar' => 'required|integer|min:100000',
            'lantai'      => 'required|integer|min:1|max:20',
            'fasilitas'   => 'nullable|string',
            'foto_url'    => 'nullable|url',
            'deskripsi'   => 'nullable|string|max:500',
            'status'      => 'required|in:TERSEDIA,DIPESAN,DIHUNI',
        ]);

        $validated['fasilitas'] = $this->parseFasilitas($request->fasilitas);

        $kamar->update($validated);

        return redirect()->route('admin.kamar.index')
                         ->with('success', "Kamar {$kamar->nomor} berhasil diperbarui.");
    }

    public function destroy(Kamar $kamar)
    {
        $nomor = $kamar->nomor;
        $kamar->delete();

        return redirect()->route('admin.kamar.index')
                         ->with('success', "Kamar {$nomor} berhasil dihapus.");
    }

    /**
     * Parse fasilitas dari textarea menjadi array.
     * Input: "WiFi\nAC\nKamar Mandi Dalam"
     * Output: ["WiFi", "AC", "Kamar Mandi Dalam"]
     */
    private function parseFasilitas(?string $raw): array
    {
        if (!$raw) return [];
        return array_filter(array_map('trim', explode("\n", $raw)));
    }
}
