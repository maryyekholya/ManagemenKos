@extends('layouts.admin')
@section('title', 'Kanban Unit')
@section('panel-label', 'Manager Panel')

@section('sidebar')
    @php
        $menu = [
            ['route' => 'manager.kanban',   'label' => 'Overview Unit',    'icon' => 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'],
            ['route' => 'manager.keluhan',  'label' => 'Daftar Keluhan',   'icon' => 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'],
            ['route' => 'manager.transaksi','label' => 'Riwayat Bayar',    'icon' => 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'],
        ];
    @endphp
    @foreach($menu as $item)
        <a href="{{ route($item['route']) }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all {{ request()->routeIs($item['route']) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['icon'] }}"/></svg>
            {{ $item['label'] }}
        </a>
    @endforeach

    {{-- Total Pendapatan --}}
    <div class="mt-auto pt-6">
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
            <p class="text-lg font-bold text-slate-900 font-mono">Rp {{ number_format($totalPendapatan, 0, ',', '.') }}</p>
        </div>
    </div>
@endsection

@section('content')
<div class="space-y-8 h-full flex flex-col">

    <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Manager Dashboard</p>
        <h1 class="text-4xl font-normal text-slate-900" style="font-family: 'Playfair Display', serif">Overview Hunian</h1>
        <p class="text-slate-500 mt-1 text-sm">Pantau status seluruh unit kamar NestIn secara real-time.</p>
    </div>

    {{-- Kanban Board --}}
    <div class="flex gap-6 overflow-x-auto pb-6 items-start flex-1">
        @php
            $columnLabels = [
                'TERSEDIA'            => 'Tersedia',
                'DIPESAN'             => 'Dipesan',
                'MENUNGGU_PEMBAYARAN' => 'Menunggu Bayar',
                'DIKONFIRMASI'        => 'Dikonfirmasi',
                'DIHUNI'              => 'Dihuni',
            ];
        @endphp

        @foreach($columns as $status)
            @php
                $kamars = $kamarsByStatus[$status] ?? collect();
            @endphp
            <div class="w-72 shrink-0 flex flex-col gap-4">
                {{-- Column Header --}}
                <div class="flex items-center justify-between px-4 py-3 bg-slate-100/50 rounded-2xl">
                    <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{{ $columnLabels[$status] }}</h3>
                    <span class="w-6 h-6 bg-white text-slate-600 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm">{{ $kamars->count() }}</span>
                </div>

                {{-- Cards --}}
                @forelse($kamars as $kamar)
                    @php
                        $activeBooking = $kamar->bookings->first();
                    @endphp
                    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer group">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-xl text-slate-900 group-hover:text-emerald-600 transition-colors">Unit {{ $kamar->nomor }}</h4>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{{ $kamar->tipe }} · Lantai {{ $kamar->lantai }}</p>
                            </div>
                            <svg class="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </div>

                        @if($activeBooking)
                        <div class="border-t border-slate-50 pt-4 space-y-1">
                            <div class="flex items-center gap-2">
                                <div class="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">{{ substr($activeBooking->user_name, 0, 1) }}</div>
                                <span class="text-xs font-bold text-slate-700">{{ $activeBooking->user_name }}</span>
                            </div>
                            <p class="text-[10px] text-slate-400 font-bold uppercase pl-9">s.d. {{ $activeBooking->tgl_keluar->format('d M Y') }}</p>
                        </div>
                        @endif

                        <div class="flex justify-between items-center">
                            <x-status-badge :status="$kamar->status" />
                            <p class="text-xs font-bold text-emerald-600 font-mono">Rp {{ number_format($kamar->harga_dasar, 0, ',', '.') }}</p>
                        </div>
                    </div>
                @empty
                    <div class="h-36 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300 gap-2">
                        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                        <p class="text-[10px] font-bold uppercase">Kosong</p>
                    </div>
                @endforelse
            </div>
        @endforeach
    </div>

</div>
@endsection
