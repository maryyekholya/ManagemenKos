@extends('layouts.admin')
@section('title', 'Manajemen Booking')
@section('panel-label', 'Admin Panel')

@section('sidebar')
    @php
        $menu = [
            ['route' => 'admin.dashboard',       'label' => 'Dashboard',  'icon' => 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],
            ['route' => 'admin.kamar.index',     'label' => 'Kamar',      'icon' => 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'],
            ['route' => 'admin.booking.index',   'label' => 'Booking',    'icon' => 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'],
            ['route' => 'admin.pembayaran.index','label' => 'Pembayaran', 'icon' => 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'],
            ['route' => 'admin.keluhan.index',   'label' => 'Keluhan',    'icon' => 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'],
            ['route' => 'admin.laporan.index',   'label' => 'Laporan',    'icon' => 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'],
        ];
    @endphp
    @foreach($menu as $item)
        <a href="{{ route($item['route']) }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all {{ request()->routeIs($item['route']) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['icon'] }}"/></svg>
            {{ $item['label'] }}
        </a>
    @endforeach
@endsection

@section('content')
<div class="space-y-8 max-w-7xl">
    {{-- Header + Filter --}}
    <div class="flex items-end justify-between gap-4">
        <div>
            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Admin Panel</p>
            <h1 class="text-4xl font-normal text-slate-900" style="font-family: 'Playfair Display', serif">Manajemen Booking</h1>
        </div>
        {{-- Filter Status --}}
        <div class="flex flex-wrap gap-2">
            <a href="{{ route('admin.booking.index') }}" class="px-4 py-2 text-xs font-bold rounded-full transition-all {{ !$status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200' }}">Semua</a>
            @foreach($statuses as $s)
                <a href="{{ route('admin.booking.index', ['status' => $s]) }}" class="px-4 py-2 text-xs font-bold rounded-full transition-all {{ $status === $s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200' }}">
                    {{ str_replace('_', ' ', $s) }}
                </a>
            @endforeach
        </div>
    </div>

    {{-- Tabel Booking --}}
    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / Tenant</th>
                    <th class="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kamar</th>
                    <th class="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode</th>
                    <th class="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                    <th class="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @forelse($bookings as $booking)
                <tr class="hover:bg-slate-50/50 transition-all">
                    <td class="px-6 py-5">
                        <p class="font-mono text-xs font-bold text-slate-500">#{{ $booking->id }}</p>
                        <p class="font-bold text-slate-900 mt-0.5">{{ $booking->user_name }}</p>
                    </td>
                    <td class="px-6 py-5">
                        <p class="font-bold text-slate-900">Kamar {{ $booking->kamar->nomor }}</p>
                        <p class="text-xs text-emerald-600 font-bold uppercase mt-0.5">{{ $booking->kamar->tipe }}</p>
                    </td>
                    <td class="px-6 py-5">
                        <p class="text-slate-900 text-xs">{{ $booking->tgl_masuk->format('d M Y') }}</p>
                        <p class="text-slate-400 text-xs">s.d. {{ $booking->tgl_keluar->format('d M Y') }}</p>
                    </td>
                    <td class="px-6 py-5">
                        <p class="font-bold font-mono text-slate-900">Rp {{ number_format($booking->total, 0, ',', '.') }}</p>
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded-full">{{ $booking->metode_bayar }}</span>
                    </td>
                    <td class="px-6 py-5">
                        <x-status-badge :status="$booking->status" />
                        @if($booking->payment_claim_timestamp && $booking->status === 'MENUNGGU_PEMBAYARAN')
                            <p class="text-[9px] text-amber-600 font-bold uppercase tracking-widest mt-1.5">Klaim masuk!</p>
                        @endif
                    </td>
                    <td class="px-6 py-5 text-right">
                        <div class="flex items-center justify-end gap-2">
                            {{-- Aksi berdasarkan status --}}
                            @if($booking->status === 'MENUNGGU_PEMBAYARAN' && $booking->payment_claim_timestamp)
                                <form method="POST" action="{{ route('admin.booking.verify', $booking->id) }}" class="inline">
                                    @csrf
                                    <button class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-200">Konfirmasi</button>
                                </form>
                                <button x-data x-on:click="$dispatch('open-reject-modal', { id: {{ $booking->id }} })" class="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-xl hover:bg-red-200">Tolak</button>
                            @elseif($booking->status === 'DIKONFIRMASI')
                                <form method="POST" action="{{ route('admin.booking.checkin', $booking->id) }}" class="inline">
                                    @csrf
                                    <button class="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700">Check-in</button>
                                </form>
                            @elseif($booking->status === 'DIHUNI')
                                <form method="POST" action="{{ route('admin.booking.complete', $booking->id) }}" class="inline">
                                    @csrf
                                    <button class="px-3 py-1.5 bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-800">Selesai</button>
                                </form>
                            @endif
                            <a href="{{ route('admin.booking.show', $booking->id) }}" class="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200">Detail</a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="px-6 py-20 text-center text-slate-400 text-sm">Tidak ada booking ditemukan.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{ $bookings->links() }}
</div>

{{-- Modal Reject --}}
<div x-data="{ open: false, bookingId: null }" @open-reject-modal.window="open = true; bookingId = $event.detail.id">
    <div x-show="open" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" x-transition>
        <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" @click.stop>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Tolak Pembayaran</h3>
            <p class="text-sm text-slate-500 mb-6">Berikan alasan penolakan yang jelas kepada tenant.</p>
            <form :action="'/admin/booking/' + bookingId + '/reject'" method="POST">
                @csrf
                <textarea name="reason" required rows="3" placeholder="Contoh: Bukti transfer tidak valid, nominal tidak sesuai..." class="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 resize-none"></textarea>
                <div class="flex gap-3 mt-4">
                    <button type="submit" class="flex-1 py-3 bg-red-600 text-white text-sm font-bold rounded-2xl hover:bg-red-700">Tolak Pembayaran</button>
                    <button type="button" @click="open = false" class="flex-1 py-3 bg-slate-100 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-200">Batal</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
