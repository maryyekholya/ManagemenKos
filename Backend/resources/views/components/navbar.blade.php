<nav class="border-b border-slate-100 bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 h-16 flex items-center">
    <div class="max-w-7xl mx-auto px-6 w-full flex items-center gap-8">

        {{-- Logo --}}
        <a href="{{ route('landing') }}" class="text-2xl font-bold lowercase tracking-tight text-slate-900">nestin</a>

        {{-- Nav Links (Desktop) --}}
        <div class="hidden md:flex items-center gap-6 ml-8">
            <a href="{{ route('landing') }}" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors {{ request()->routeIs('landing') ? 'text-slate-900' : '' }}">Beranda</a>
            <a href="{{ route('status.checker') }}" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Cek Status</a>
        </div>

        {{-- Right Side --}}
        <div class="ml-auto flex items-center gap-4">
            @auth
                {{-- Notif Bell --}}
                <div class="relative" x-data="{ open: false }">
                    <button @click="open = !open" class="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                        @php
                            $unreadCount = auth()->user()->notifications()->where('is_read', false)->count();
                        @endphp
                        @if($unreadCount > 0)
                            <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ $unreadCount > 9 ? '9+' : $unreadCount }}</span>
                        @endif
                    </button>
                </div>

                {{-- User Menu --}}
                <div class="relative" x-data="{ open: false }">
                    <button @click="open = !open" class="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div class="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{{ substr(auth()->user()->name, 0, 1) }}</div>
                        <span class="text-sm font-medium hidden md:block">{{ auth()->user()->name }}</span>
                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>

                    <div x-show="open" @click.away="open = false" x-transition class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                        <div class="px-4 py-3 border-b border-slate-50">
                            <p class="text-xs font-bold uppercase tracking-widest text-slate-400">{{ auth()->user()->role }}</p>
                            <p class="text-sm font-semibold text-slate-900 mt-0.5">{{ auth()->user()->email }}</p>
                        </div>
                        <a href="{{ auth()->user()->getDashboardRoute() }}" class="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                            Dashboard
                        </a>
                        @if(auth()->user()->role === 'user')
                        <a href="{{ route('user.profil') }}" class="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            Profil Saya
                        </a>
                        @endif
                        <form method="POST" action="{{ route('logout') }}" class="border-t border-slate-50 mt-1 pt-1">
                            @csrf
                            <button type="submit" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                Keluar
                            </button>
                        </form>
                    </div>
                </div>
            @else
                <a href="{{ route('login') }}" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Masuk</a>
                <a href="{{ route('register') }}" class="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors">Daftar</a>
            @endauth
        </div>
    </div>
</nav>
