@extends('layouts.admin')
@section('title', 'Manajemen Kamar')
@section('panel-label', 'Admin Panel')

@section('sidebar')
    @php $menu = [
        ['route' => 'admin.dashboard',     'label' => 'Dashboard', 'icon' => 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],
        ['route' => 'admin.kamar.index',   'label' => 'Kamar',     'icon' => 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'],
        ['route' => 'admin.booking.index', 'label' => 'Booking',   'icon' => 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'],
    ]; @endphp
    @foreach($menu as $item)
        <a href="{{ route($item['route']) }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all {{ request()->routeIs($item['route']) ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50' }}">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['icon'] }}"/></svg>
            {{ $item['label'] }}
        </a>
    @endforeach
@endsection

@section('content')
<div class="space-y-6 max-w-2xl">

    <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Admin / Kamar</p>
        <h1 class="text-3xl font-normal text-slate-900 mt-1" style="font-family: 'Playfair Display', serif">
            {{ $kamar ? 'Edit Kamar ' . $kamar->nomor : 'Tambah Kamar Baru' }}
        </h1>
    </div>

    <form method="POST" action="{{ $action }}" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
        @csrf
        @if($kamar) @method('PUT') @endif

        {{-- Nomor & Tipe --}}
        <div class="grid grid-cols-2 gap-5">
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nomor Kamar</label>
                <input type="text" name="nomor" value="{{ old('nomor', $kamar?->nomor) }}" required class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200" placeholder="101">
                @error('nomor')<p class="text-xs text-red-500 mt-1">{{ $message }}</p>@enderror
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Tipe</label>
                <select name="tipe" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 bg-white">
                    @foreach(['Standard','Deluxe','Suite'] as $t)
                        <option value="{{ $t }}" {{ old('tipe', $kamar?->tipe) === $t ? 'selected' : '' }}>{{ $t }}</option>
                    @endforeach
                </select>
            </div>
        </div>

        {{-- Harga & Lantai --}}
        <div class="grid grid-cols-2 gap-5">
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Harga Dasar (Rp/bulan)</label>
                <input type="number" name="harga_dasar" value="{{ old('harga_dasar', $kamar?->harga_dasar) }}" required min="100000" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200" placeholder="1500000">
                @error('harga_dasar')<p class="text-xs text-red-500 mt-1">{{ $message }}</p>@enderror
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Lantai</label>
                <input type="number" name="lantai" value="{{ old('lantai', $kamar?->lantai ?? 1) }}" required min="1" max="20" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200">
            </div>
        </div>

        {{-- Status --}}
        <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Status</label>
            <select name="status" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 bg-white">
                @foreach(['TERSEDIA','DIPESAN','DIHUNI'] as $s)
                    <option value="{{ $s }}" {{ old('status', $kamar?->status ?? 'TERSEDIA') === $s ? 'selected' : '' }}>{{ $s }}</option>
                @endforeach
            </select>
        </div>

        {{-- Foto URL --}}
        <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">URL Foto (opsional)</label>
            <input type="url" name="foto_url" value="{{ old('foto_url', $kamar?->foto_url) }}" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200" placeholder="https://...">
        </div>

        {{-- Fasilitas --}}
        <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fasilitas (satu per baris)</label>
            <textarea name="fasilitas" rows="4" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-none" placeholder="WiFi&#10;AC&#10;Kamar Mandi Dalam">{{ old('fasilitas', $kamar ? implode("\n", $kamar->fasilitas ?? []) : '') }}</textarea>
        </div>

        {{-- Deskripsi --}}
        <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Deskripsi (opsional)</label>
            <textarea name="deskripsi" rows="3" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-none" maxlength="500" placeholder="Deskripsi singkat kamar...">{{ old('deskripsi', $kamar?->deskripsi) }}</textarea>
        </div>

        {{-- Actions --}}
        <div class="flex gap-3 pt-2">
            <button type="submit" class="flex-1 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                {{ $kamar ? 'Simpan Perubahan' : 'Tambah Kamar' }}
            </button>
            <a href="{{ route('admin.kamar.index') }}" class="px-6 py-3 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors text-center">
                Batal
            </a>
        </div>
    </form>

</div>
@endsection
