<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'NestIn') — Admin Panel</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;700&display=swap" rel="stylesheet">
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-slate-50 text-slate-900 antialiased overflow-hidden h-screen flex flex-col">

    {{-- Top Navbar Admin --}}
    <header class="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0 z-10">
        <a href="{{ route('landing') }}" class="text-xl font-bold lowercase tracking-tight text-slate-900">nestin</a>
        <span class="text-slate-200">|</span>
        <span class="text-xs font-bold uppercase tracking-widest text-slate-400">@yield('panel-label', 'Admin Panel')</span>
        <div class="ml-auto flex items-center gap-4">
            <span class="text-sm font-medium text-slate-600">{{ auth()->user()->name }}</span>
            <form method="POST" action="{{ route('logout') }}" class="inline">
                @csrf
                <button type="submit" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Keluar</button>
            </form>
        </div>
    </header>

    {{-- Body: Sidebar + Content --}}
    <div class="flex flex-1 overflow-hidden pt-0">

        {{-- Sidebar --}}
        <aside class="w-60 bg-white border-r border-slate-100 flex flex-col p-4 shrink-0 overflow-y-auto">
            <nav class="space-y-1 flex-1">
                @yield('sidebar')
            </nav>
            <div class="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                <p class="font-bold uppercase tracking-widest mb-1">NestIn</p>
                <p>Manajemen Kos Digital</p>
            </div>
        </aside>

        {{-- Content --}}
        <main class="flex-1 overflow-y-auto p-8">
            {{-- Flash --}}
            @if(session('success'))
                <div class="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold" x-data x-init="setTimeout(() => $el.remove(), 4000)">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    {{ session('success') }}
                </div>
            @endif
            @if(session('error'))
                <div class="mb-6 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold" x-data x-init="setTimeout(() => $el.remove(), 5000)">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    {{ session('error') }}
                </div>
            @endif

            @yield('content')
        </main>
    </div>
</body>
</html>
