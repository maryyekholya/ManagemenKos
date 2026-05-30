@extends('layouts.app')
@section('title', 'Cari Kamar Kos — NestIn')
@section('description', 'Temukan kamar kos nyaman di NestIn.')

@section('content')
<div class="pt-16">

    {{-- HERO --}}
    <section class="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div class="space-y-8">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Platform Kos Digital</p>
            <h1 class="text-5xl md:text-7xl font-normal leading-tight text-slate-900" style="font-family: 'Playfair Display', serif">
                Temukan kamar kos<br>
                <em class="not-italic text-emerald-600">impian Anda.</em>
            </h1>

            <div class="flex gap-12 pt-2">
                <div><p class="text-3xl font-bold text-slate-900">{{ $stats['total'] }}</p><p class="text-sm text-slate-500 mt-1">Total Unit</p></div>
                <div><p class="text-3xl font-bold text-emerald-600">{{ $stats['tersedia'] }}</p><p class="text-sm text-slate-500 mt-1">Tersedia</p></div>
                <div><p class="text-3xl font-bold text-slate-900">{{ $stats['dihuni'] }}</p><p class="text-sm text-slate-500 mt-1">Dihuni</p></div>
            </div>
        </div>
    </section>

    {{-- FILTER + LISTING --}}
    <section class="px-6 md:px-12 py-16 bg-white border-t border-slate-100" id="rooms">
        <div class="max-w-7xl mx-auto space-y-10">

            {{-- Filter Form --}}
            <form method="GET" action="{{ route('landing') }}" class="flex flex-wrap items-center gap-4">
                <input type="text" name="search" value="{{ $search }}" placeholder="Cari nomor kamar..." class="px-5 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 min-w-[200px]">

                <select name="tipe" class="px-5 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 bg-white">
                    <option value="Semua" {{ $tipe === 'Semua' ? 'selected' : '' }}>Semua Tipe</option>
                    <option value="Standard" {{ $tipe === 'Standard' ? 'selected' : '' }}>Standard</option>
                    <option value="Deluxe" {{ $tipe === 'Deluxe' ? 'selected' : '' }}>Deluxe</option>
                    <option value="Suite" {{ $tipe === 'Suite' ? 'selected' : '' }}>Suite</option>
                </select>

                <button type="submit" class="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors">
                    Cari
                </button>
                @if($search || $tipe !== 'Semua')
                    <a href="{{ route('landing') }}" class="px-4 py-3 text-sm text-slate-500 hover:text-slate-900 transition-colors">Reset</a>
                @endif
            </form>

            {{-- Grid Kamar --}}
            @if($kamars->count() > 0)
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                @foreach($kamars as $kamar)
                <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">

                    {{-- Foto --}}
                    <div class="h-48 bg-slate-100 overflow-hidden relative">
                        @if($kamar->foto_url)
                            <img src="{{ $kamar->foto_url }}" alt="Kamar {{ $kamar->nomor }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                        @else
                            <div class="w-full h-full flex items-center justify-center text-slate-300">
                                <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                            </div>
                        @endif
                        <div class="absolute top-3 left-3">
                            <x-status-badge :status="$kamar->status" />
                        </div>
                    </div>

                    {{-- Info --}}
                    <div class="p-6 space-y-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-xl font-bold text-slate-900">Kamar {{ $kamar->nomor }}</h3>
                                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{{ $kamar->tipe }} · Lantai {{ $kamar->lantai }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-slate-400">per bulan</p>
                                <p class="text-lg font-bold text-emerald-600">{{ $kamar->formatted_harga }}</p>
                            </div>
                        </div>

                        {{-- Fasilitas --}}
                        @if($kamar->fasilitas)
                        <div class="flex flex-wrap gap-2">
                            @foreach(array_slice($kamar->fasilitas, 0, 3) as $f)
                                <span class="px-3 py-1 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-100">{{ $f }}</span>
                            @endforeach
                            @if(count($kamar->fasilitas) > 3)
                                <span class="px-3 py-1 bg-slate-50 text-slate-400 text-xs rounded-lg">+{{ count($kamar->fasilitas) - 3 }}</span>
                            @endif
                        </div>
                        @endif

                        {{-- Deskripsi --}}
                        @if($kamar->deskripsi)
                            <p class="text-sm text-slate-500 leading-relaxed">{{ $kamar->deskripsi }}</p>
                        @endif

                        {{-- Tombol --}}
                        @if($kamar->status === 'TERSEDIA')
                            @auth
                                @if(auth()->user()->role === 'user')
                                    <a href="#" class="block w-full py-3 bg-emerald-600 text-white text-sm font-semibold text-center rounded-2xl hover:bg-emerald-700 transition-colors">
                                        Pesan Kamar →
                                    </a>
                                @else
                                    <div class="py-3 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl">Login sebagai tenant untuk memesan</div>
                                @endif
                            @else
                                <a href="{{ route('register') }}" class="block w-full py-3 bg-slate-900 text-white text-sm font-semibold text-center rounded-2xl hover:bg-slate-700 transition-colors">
                                    Daftar & Pesan
                                </a>
                            @endauth
                        @else
                            <div class="py-3 text-center text-sm font-semibold text-slate-400 bg-slate-50 rounded-2xl">
                                Tidak Tersedia
                            </div>
                        @endif
                    </div>
                </div>
                @endforeach
            </div>
            @else
            <div class="text-center py-24 text-slate-400 space-y-3">
                <svg class="w-12 h-12 mx-auto text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <p class="font-semibold">Tidak ada kamar yang ditemukan.</p>
                <a href="{{ route('landing') }}" class="text-sm text-emerald-600 hover:underline">Reset pencarian</a>
            </div>
            @endif
        </div>
    </section>

</div>
@endsection
