@extends('layouts.app')
@section('title', 'Dashboard Manager')

@section('content')
<div class="pt-24 px-6 max-w-5xl mx-auto pb-16">
    <h1 class="text-3xl font-normal text-slate-900 mb-8" style="font-family: 'Playfair Display', serif">
        Overview Unit Kamar
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @foreach(['TERSEDIA', 'DIPESAN', 'DIHUNI'] as $status)
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
                <x-status-badge :status="$status" />
                <span class="text-2xl font-bold text-slate-900">{{ isset($kamars[$status]) ? $kamars[$status]->count() : 0 }}</span>
            </div>
            <div class="space-y-2">
                @foreach(($kamars[$status] ?? collect()) as $kamar)
                <div class="flex justify-between items-center text-sm">
                    <span class="font-semibold text-slate-700">Kamar {{ $kamar->nomor }}</span>
                    <span class="text-slate-400 text-xs">{{ $kamar->tipe }}</span>
                </div>
                @endforeach
            </div>
        </div>
        @endforeach
    </div>
</div>
@endsection
