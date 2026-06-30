@extends('layouts.app')
@section('title', 'Cek Status Booking — NestIn')

@section('content')
<div class="pt-24 px-6 max-w-3xl mx-auto min-h-screen">
    <h1 class="text-3xl font-bold text-slate-900 mb-6">Cek Status Booking</h1>
    <div class="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <p class="text-slate-600 mb-4">Fitur cek status booking sedang dalam tahap pengembangan.</p>
        <a href="{{ route('landing') }}" class="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            &larr; Kembali ke Beranda
        </a>
    </div>
</div>
@endsection
