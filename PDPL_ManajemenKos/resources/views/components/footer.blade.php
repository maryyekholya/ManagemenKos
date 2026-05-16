<footer class="bg-slate-900 px-6 md:px-12 py-20 text-white">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div class="space-y-6">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span class="text-2xl font-bold" style="font-family: 'Playfair Display', serif">NestIn</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed">Platform manajemen kosan digital terdepan di Indonesia. Menghubungkan tenant dan pemilik dengan sistem yang cerdas.</p>
        </div>
        <div>
            <h4 class="text-lg font-bold mb-6">Navigasi</h4>
            <ul class="space-y-3 text-slate-400 text-sm">
                <li><a href="{{ route('landing') }}" class="hover:text-emerald-400 transition-colors">Cari Kamar</a></li>
                <li><a href="{{ route('status.checker') }}" class="hover:text-emerald-400 transition-colors">Cek Status Booking</a></li>
                @guest
                    <li><a href="{{ route('register') }}" class="hover:text-emerald-400 transition-colors">Daftar Sekarang</a></li>
                @endguest
            </ul>
        </div>
        <div>
            <h4 class="text-lg font-bold mb-6">Kontak</h4>
            <ul class="space-y-3 text-slate-400 text-sm">
                <li>Jl. Merdeka No. 123, Bandung</li>
                <li>+62 812 3456 7890</li>
                <li>hello@nestin.id</li>
            </ul>
        </div>
        <div>
            <h4 class="text-lg font-bold mb-6">Jam Operasional</h4>
            <ul class="space-y-2 text-slate-400 text-sm">
                <li>Senin – Jumat: 08.00 – 17.00</li>
                <li>Sabtu: 09.00 – 14.00</li>
                <li class="text-emerald-400 font-medium">Sistem online 24/7</li>
            </ul>
        </div>
    </div>
    <div class="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
        &copy; {{ date('Y') }} NestIn Indonesia. All rights reserved.
    </div>
</footer>
