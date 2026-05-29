@extends('layouts.admin')
@section('title', 'Admin Dashboard')
@section('panel-label', 'Admin Panel')

@section('sidebar')
    @php $menu = [
        ['route' => 'admin.dashboard',     'label' => 'Dashboard', 'icon' => 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],
        ['route' => 'admin.kamar.index',   'label' => 'Kamar',     'icon' => 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'],
        ['route' => 'admin.booking.index', 'label' => 'Booking',   'icon' => 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'],
    ]; @endphp
    @foreach($menu as $item)
        <a href="{{ route($item['route']) }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all {{ request()->routeIs($item['route']) ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $item['icon'] }}"/></svg>
            {{ $item['label'] }}
        </a>
    @endforeach
@endsection

@section('content')
<div class="space-y-8 max-w-5xl">

    <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Admin</p>
        <h1 class="text-3xl font-normal text-slate-900 mt-1" style="font-family: 'Playfair Display', serif">Dashboard</h1>
    </div>

    {{-- Stat Cards --}}
    <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
        @php $cards = [
            ['label' => 'Total Kamar',   'value' => $stats['total_kamar'],    'sub' => $stats['kamar_tersedia'] . ' tersedia'],
            ['label' => 'Kamar Dihuni',  'value' => $stats['kamar_dihuni'],   'sub' => 'Unit aktif'],
            ['label' => 'Booking Aktif', 'value' => $stats['booking_aktif'],  'sub' => 'Dari ' . $stats['total_booking'] . ' total'],
        ]; @endphp
        @foreach($cards as $card)
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ $card['label'] }}</p>
            <p class="text-4xl font-bold text-slate-900">{{ $card['value'] }}</p>
            <p class="text-xs text-slate-500">{{ $card['sub'] }}</p>
        </div>
        @endforeach
    </div>

    {{-- Booking Terbaru --}}
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <h2 class="font-bold text-slate-900">Booking Terbaru</h2>
            <a href="{{ route('admin.booking.index') }}" class="text-xs font-bold text-emerald-600 hover:text-emerald-800">Lihat Semua →</a>
        </div>
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th class="px-6 py-3 text-left">Tenant</th>
                    <th class="px-6 py-3 text-left">Kamar</th>
                    <th class="px-6 py-3 text-left">Total</th>
                    <th class="px-6 py-3 text-left">Status</th>
                    <th class="px-6 py-3 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                @forelse($recentBookings as $b)
                <tr class="hover:bg-slate-50/50">
                    <td class="px-6 py-4 font-semibold text-slate-900">{{ $b->user_name }}</td>
                    <td class="px-6 py-4 text-slate-600">Kamar {{ $b->kamar->nomor }}</td>
                    <td class="px-6 py-4 font-mono font-bold text-emerald-600">{{ $b->formatted_total }}</td>
                    <td class="px-6 py-4"><x-status-badge :status="$b->status" /></td>
                    <td class="px-6 py-4 text-right">
                        <a href="{{ route('admin.booking.show', $b->id) }}" class="text-xs font-bold text-slate-500 hover:text-slate-900">Detail</a>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 text-sm">Belum ada booking.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

</div>
@endsection
