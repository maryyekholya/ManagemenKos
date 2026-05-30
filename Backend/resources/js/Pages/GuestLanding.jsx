import React, { useEffect } from 'react';
import useRooms from '../Hooks/useRooms';

/**
 * [DESIGN PATTERN IMPLEMENTATION]
 * GuestLanding: Halaman landing untuk tamu mencari kamar
 *
 * Karakteristik Desain & Pattern:
 * 1. ASYMMETRY: Judul hero menggunakan perpaduan Serif Display (Italic) dengan Sans Serif
 *    yang kontras, diletakkan condong ke kiri untuk visual yang dinamis
 *
 * 2. SINGLETON PATTERN: KamarRepository di-akses melalui API endpoint yang dijamin
 *    return konsisten tanpa melakukan re-fetch yang tidak perlu
 *
 * 3. STRATEGY PATTERN:
 *    - Pricing: Meskipun UI menampilkan harga, logika perhitungannya terpisah.
 *      Admin bisa mengaktifkan "Diskon Akhir Tahun" secara global tanpa mengubah komponen kartu.
 *    - Filter: Memungkinkan penambahan filter baru (misal: fasilitas) tanpa merusak struktur.
 *
 * 4. STATE LOGIC: Status badge (TERSEDIA, DIPESAN) mengontrol apakah tombol CTA aktif,
 *    mencerminkan transisi State Pattern.
 *
 * 5. VISUAL: Space luas (padding px-6, gap-8) dan shadow halus (shadow-sm) untuk kesan premium
 */
const GuestLanding = () => {
  // [CUSTOM HOOK] Mengenkapsulasi semua logika kamar
  const {
    rooms,
    loading,
    error,
    currentStrategy,
    statistics,
    fetchRooms,
    filterByType,
    changePricingStrategy,
  } = useRooms('NORMAL');

  // Load data kamar saat komponen mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // State lokal untuk filter tipe kamar
  const [activeType, setActiveType] = React.useState('ALL');

  const handleTypeFilter = (type) => {
    setActiveType(type);
    filterByType(type);
  };

  const handleStrategyChange = (strategy) => {
    changePricingStrategy(strategy);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] text-[#0f172a]">
      {/* ============ NAVBAR ============ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#059669] tracking-tight">NestIn.</h1>
            {/* [STATE VISUALIZATION] - Statistik kamar */}
            <div className="hidden sm:flex gap-4 ml-8 text-sm">
              <div className="px-3 py-1 bg-[#d1fae5] text-[#059669] rounded-full font-medium">
                {statistics.available} Tersedia
              </div>
              <div className="px-3 py-1 bg-[#fef3c7] text-[#d97706] rounded-full font-medium">
                {statistics.booked} Dipesan
              </div>
            </div>
          </div>
          <button className="text-sm font-semibold px-5 py-2 rounded-lg border border-[#e2e8f0] hover:bg-slate-50 transition-all duration-200">
            Cek Booking Saya
          </button>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      {/* [ASYMMETRY] Judul hero dengan perpaduan Serif + Sans Serif, diletakkan condong ke kiri */}
      <header className="px-6 pt-16 pb-12 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h2 className="text-5xl md:text-6xl font-['DM_Serif_Display'] leading-[1.1] mb-6">
            Temukan <span className="italic text-[#059669]">kenyamanan</span> hunian yang tepat untuk produktivitasmu.
          </h2>
          <p className="text-[#64748b] text-lg max-w-md leading-relaxed">
            Proses booking transparan, manajemen modern, dan fasilitas terkurasi di satu lokasi eksklusif.
          </p>
        </div>
      </header>

      {/* ============ STRATEGY SELECTOR ============ */}
      {/* [STRATEGY PATTERN] - Opsi untuk memilih strategi pricing */}
      <section className="px-6 mb-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
          <p className="text-sm font-semibold text-[#64748b] mb-3">Strategi Harga:</p>
          <div className="flex gap-2 flex-wrap">
            {['NORMAL', 'SEASONAL', 'DISCOUNT'].map((strategy) => (
              <button
                key={strategy}
                onClick={() => handleStrategyChange(strategy)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentStrategy === strategy
                    ? 'bg-[#059669] text-white shadow-md'
                    : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                {strategy === 'NORMAL' && '💰 Normal'}
                {strategy === 'SEASONAL' && '📈 Musiman'}
                {strategy === 'DISCOUNT' && '🏷️ Diskon'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FILTER BAR ============ */}
      {/* [STRATEGY PATTERN] FilterStrategy - Tipe kamar filter yang modular */}
      <section className="px-6 mb-12 max-w-7xl mx-auto">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {['ALL', 'Tunggal', 'Double', 'VIP'].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeFilter(type)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeType === type
                  ? 'bg-[#059669] text-white shadow-md shadow-emerald-200'
                  : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#059669] hover:bg-slate-50'
              }`}
            >
              {type === 'ALL' ? 'Semua Tipe' : type}
            </button>
          ))}
        </div>
      </section>

      {/* ============ LOADING STATE ============ */}
      {loading && (
        <div className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-[#e2e8f0]">
                <div className="h-64 bg-gradient-to-r from-[#e2e8f0] to-[#f1f5f9] animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-[#e2e8f0] rounded animate-pulse" />
                  <div className="h-4 bg-[#e2e8f0] rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ ERROR STATE ============ */}
      {error && (
        <div className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="bg-[#fee2e2] border border-[#fecaca] rounded-lg p-6 text-center">
            <p className="text-[#991b1b] font-medium">⚠️ Terjadi kesalahan: {error}</p>
          </div>
        </div>
      )}

      {/* ============ ROOM GRID ============ */}
      {/* [STATE LOGIC] Status badge mengontrol button CTA (TERSEDIA vs DIPESAN) */}
      {!loading && !error && (
        <main className="px-6 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} currentStrategy={currentStrategy} />
            ))}
          </div>

          {/* [EMPTY STATE] */}
          {rooms.length === 0 && (
            <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-[#e2e8f0]">
              <p className="text-[#64748b] text-lg font-medium">
                ✨ Tidak ada kamar yang sesuai kriteria pencarianmu.
              </p>
              <p className="text-[#94a3b8] text-sm mt-2">Coba ubah filter atau strategi harga</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

/**
 * [COMPONENT: RoomCard]
 * Kartu kamar individual dengan visual premium
 * [STATE] Badge status mengontrol state button (enabled/disabled)
 */
const RoomCard = ({ room, currentStrategy }) => {
  const isAvailable = room.status === 'TERSEDIA';

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
      {/* ========== IMAGE SECTION ========== */}
      <div className="relative h-64 overflow-hidden bg-[#f1f5f9]">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* [STATE VISUALIZATION] - Status Badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-sm ${
            isAvailable
              ? 'bg-[#d1fae5] text-[#059669]'
              : room.status === 'DIPESAN'
                ? 'bg-[#fef3c7] text-[#d97706]'
                : 'bg-[#f1f5f9] text-[#64748b]'
          }`}
        >
          {room.status}
        </div>

        {/* Pricing Strategy Badge */}
        <div className="absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-mono bg-white/90 text-[#64748b] shadow-sm">
          {currentStrategy}
        </div>
      </div>

      {/* ========== CONTENT SECTION ========== */}
      {/* [VISUAL] Spacing luas dan premium feel dengan padding dan gap */}
      <div className="p-6">
        {/* Title & Type Badge */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-[#0f172a] group-hover:text-[#059669] transition-colors">
            {room.name}
          </h3>
          <span className="text-[12px] font-mono text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded font-semibold">
            {room.type}
          </span>
        </div>

        {/* Features Grid */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {room.features.map((feature) => (
            <span
              key={feature}
              className="text-[11px] text-[#64748b] border border-[#e2e8f0] px-2.5 py-1 rounded-full bg-[#f8fafc] hover:border-[#059669] transition-colors"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Divider & Footer */}
        <div className="flex items-end justify-between border-t border-[#f1f5f9] pt-6">
          {/* Price Section */}
          <div>
            <p className="text-[12px] text-[#64748b] leading-none mb-1 font-medium">Mulai dari</p>
            <div className="flex items-baseline gap-1">
              <p className="font-['JetBrains_Mono'] text-lg font-bold text-[#0f172a]">
                Rp {room.displayPrice.toLocaleString('id-ID')}
              </p>
              <span className="text-sm font-normal text-[#64748b]">/bln</span>
            </div>
            {room.displayPrice !== room.price && (
              <p className="text-[10px] text-[#059669] font-semibold mt-1">
                Hemat: Rp {(room.price - room.displayPrice).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* CTA Button - [STATE LOGIC] Disabled jika tidak tersedia */}
          <button
            disabled={!isAvailable}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 whitespace-nowrap ml-4 ${
              isAvailable
                ? 'bg-[#059669] text-white hover:bg-[#047857] active:scale-95 shadow-sm hover:shadow-md'
                : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Pesan Sekarang' : 'Tidak Tersedia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestLanding;
