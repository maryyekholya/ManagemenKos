@extends('layouts.app')
@section('title', 'Dashboard Saya')

@section('content')
<div class="pt-24 px-6 max-w-4xl mx-auto pb-16">
    <h1 class="text-3xl font-normal text-slate-900 mb-8" style="font-family: 'Playfair Display', serif">
        Selamat datang, {{ auth()->user()->name }}.
    </h1>

    <div class="space-y-4">
        <h2 class="text-lg font-bold text-slate-700">Booking Saya</h2>

        @forelse($bookings as $booking)
        <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-6">
            <div>
                <p class="font-bold text-slate-900">Kamar {{ $booking->kamar->nomor }} — {{ $booking->kamar->tipe }}</p>
                <p class="text-sm text-slate-500 mt-1">{{ $booking->tgl_masuk->format('d M Y') }} s.d. {{ $booking->tgl_keluar->format('d M Y') }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ $booking->durasi_bulan }} bulan · {{ $booking->metode_bayar }}</p>
            </div>
            <div class="text-right space-y-2 shrink-0">
                <x-status-badge :status="$booking->status" />
                <p class="font-bold font-mono text-emerald-600 text-sm">{{ $booking->formatted_total }}</p>
            </div>
        </div>
        @empty
        <div class="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <p class="font-semibold">Belum ada booking.</p>
            <a href="{{ route('landing') }}#rooms" class="inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                Cari Kamar →
            </a>
        </div>
        @endforelse
    </div>
</div>
@endsection
