import React, { useState, useMemo } from 'react';
import { Search, MapPin, Bed, Star, ArrowRight, Filter, ChevronRight, Check } from 'lucide-react';
import { Kamar, PricingStrategyType, RoomType } from '../../types';
import { PricingStrategy } from '../../lib/patterns';
import { KamarCard } from '../../components/shared/KamarCard';
import { Button, Modal } from '../../components/shared/UI';
import { formatRupiah, cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface LandingPageProps {
  kamars: Kamar[];
  activeStrategy: PricingStrategyType;
  onBook: (kamar: Kamar) => void;
  dispatch: React.Dispatch<any>;
  activeView?: string;
  hasActiveBooking?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ kamars, activeStrategy, onBook, dispatch, activeView, hasActiveBooking }) => {
  const [filterType, setFilterType] = useState<RoomType | 'All'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(2500000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKamar, setSelectedKamar] = useState<Kamar | null>(null);

  React.useEffect(() => {
    if (activeView === 'landing-rooms') {
      document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeView === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView]);

  const filteredKamars = useMemo(() => {
    return kamars.filter(k => {
      const matchesType = filterType === 'All' || k.tipe === filterType;
      const matchesPrice = (k.harga_aktif || k.harga_dasar) <= maxPrice;
      const matchesSearch = k.nomor.includes(searchQuery) || k.tipe.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesPrice && matchesSearch && k.status === 'TERSEDIA';
    });
  }, [kamars, filterType, maxPrice, searchQuery, activeStrategy]);

  const stats = [
    { label: 'Total Kamar', value: kamars.length },
    { label: 'Tersedia', value: kamars.filter(k => k.status === 'TERSEDIA').length },
    { label: 'Tenant Aktif', value: kamars.filter(k => k.status === 'DIHUNI').length },
  ];

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto flex flex-col justify-center min-h-[70vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="label-upper">
               Available Spaces
            </div>
            <h1 className="display-text">
              Experience a minimalist <br />
              <span>approach to boarding living.</span>
            </h1>
            
            <div className="flex flex-wrap gap-16 pt-4">
               {stats.map(s => (
                 <div key={s.label} className="metric-item flex flex-col gap-2">
                    <div className="text-2xl font-medium text-slate-900">{s.value}</div>
                    <div className="text-[13px] text-slate-500">{s.label}</div>
                 </div>
               ))}
            </div>
          </div>

          {/* Room Images Gallery */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[480px]">
              {/* Main large image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-0 right-0 w-[75%] h-[340px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100"
              >
                <img 
                  src="/images/room_hero.png" 
                  alt="Modern minimalist room" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              
              {/* Secondary smaller image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute bottom-0 left-0 w-[55%] h-[240px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-300 border-4 border-white z-10"
              >
                <img 
                  src="/images/room_secondary.png" 
                  alt="Luxury boarding room" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>

              {/* Decorative floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -bottom-2 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 z-20"
              >
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Mulai dari</p>
                <p className="text-lg font-bold font-mono">Rp 800.000</p>
              </motion.div>

              {/* Decorative circle */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-50 rounded-full -z-10" />
              <div className="absolute bottom-20 right-[30%] w-16 h-16 bg-slate-100 rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* About NestIn Section */}
      <section className="px-6 md:px-12 py-24 bg-emerald-900 text-emerald-50 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3" />
         
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
             <div className="space-y-6">
                <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-300">Tentang NestIn</div>
                <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                   Mendefinisikan ulang<br/>standar hidup modern.
                </h2>
                <div className="space-y-4 text-emerald-100/80 text-lg leading-relaxed">
                   <p>
                      NestIn bukan sekadar aplikasi manajemen kos. Kami adalah platform inovatif yang dirancang untuk menghubungkan pencari hunian dengan ruang hidup berkualitas tinggi secara transparan, mudah, dan sepenuhnya digital.
                   </p>
                   <p>
                      Setiap properti yang terdaftar di NestIn telah melalui proses kurasi yang ketat. Mulai dari kebersihan, kelengkapan fasilitas, hingga keamanan lingkungan, kami memastikan setiap tenant mendapatkan pengalaman kos idaman tanpa pusing dengan urusan administrasi tradisional.
                   </p>
                </div>
                <Button 
                   variant="secondary" 
                   className="mt-4 border-emerald-700 bg-emerald-800/50 hover:bg-emerald-700 text-white"
                   onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                >
                   Eksplorasi Kamar Kami
                </Button>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                 <div className="bg-emerald-800/40 p-8 rounded-[2rem] border border-emerald-700/50 backdrop-blur-sm">
                    <h3 className="text-4xl font-bold text-white font-mono mb-3">100%</h3>
                    <p className="text-sm text-emerald-200">Verifikasi properti secara langsung oleh tim surveyor independen.</p>
                 </div>
                 <div className="bg-emerald-800/40 p-8 rounded-[2rem] border border-emerald-700/50 backdrop-blur-sm mt-12">
                    <h3 className="text-4xl font-bold text-white font-mono mb-3">24/7</h3>
                    <p className="text-sm text-emerald-200">Dukungan layanan pelanggan & sistem pelaporan keluhan cerdas.</p>
                 </div>
                 <div className="bg-emerald-800/40 p-8 rounded-[2rem] border border-emerald-700/50 backdrop-blur-sm -mt-12">
                    <h3 className="text-4xl font-bold text-white font-mono mb-3 text-sm flex items-center h-[40px]">CASHLESS</h3>
                    <p className="text-sm text-emerald-200">Sistem pembayaran QRIS otomatis terintegrasi langsung.</p>
                 </div>
                 <div className="bg-emerald-800/40 p-8 rounded-[2rem] border border-emerald-700/50 backdrop-blur-sm">
                    <h3 className="text-4xl font-bold text-white font-mono mb-3 text-sm flex items-center h-[40px]">SMART</h3>
                    <p className="text-sm text-emerald-200">Pemantauan tagihan dan arsip riwayat sewa dalam satu genggaman.</p>
                 </div>
             </div>
         </div>
      </section>

      {/* Rooms Listing */}
      <section className="px-6 md:px-12 py-24 bg-white border-t border-slate-200" id="rooms">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="space-y-4">
                 <div className="label-upper">Room Listing</div>
                 <h2 className="text-3xl font-normal tracking-tight">Available Rooms</h2>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pricing Strategy:</span>
                    <select 
                      value={activeStrategy}
                      onChange={e => dispatch({ type: 'SET_STRATEGY', payload: e.target.value })}
                      className="text-xs font-bold text-slate-900 bg-transparent outline-hidden border-b border-slate-200"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Seasonal">Seasonal (+20%)</option>
                      <option value="Discount">Daily Discount (-15%)</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Max Price:</span>
                    <input 
                      type="range" 
                      min="500000" 
                      max="3000000" 
                      step="100000"
                      value={maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="accent-emerald-600"
                    />
                    <span className="text-sm font-bold text-emerald-600 font-mono w-24 text-right">{formatRupiah(maxPrice)}</span>
                 </div>
              </div>
           </div>

           <div className="w-full">
             <div className="bg-slate-50 p-2 border border-slate-200 flex flex-col md:flex-row gap-2 rounded-2xl">
               <div className="flex-1 flex items-center gap-4 px-6 py-3">
                 <Search className="w-5 h-5 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Seach by room number or type..." 
                   className="w-full bg-transparent outline-hidden text-sm"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
               </div>
               <div className="md:w-56 flex items-center gap-4 px-6 py-3 border-t md:border-t-0 md:border-l border-slate-200">
                 <Filter className="w-5 h-5 text-slate-400" />
                 <select 
                    className="w-full bg-transparent outline-hidden text-sm appearance-none font-medium text-slate-700"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as any)}
                 >
                   <option value="All">Semua Tipe</option>
                   <option value="Standard">Standard</option>
                   <option value="Deluxe">Deluxe</option>
                   <option value="Suite">Suite</option>
                 </select>
               </div>
               <Button className="rounded-xl px-12 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors border-none shadow-md shadow-emerald-200">Cari</Button>
             </div>
           </div>

           {filteredKamars.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredKamars.map(k => (
                 <motion.div
                   key={k.id}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                 >
                   <KamarCard 
                     kamar={k} 
                     strategy={activeStrategy} 
                     onBook={onBook}
                     onSelect={setSelectedKamar}
                     hasActiveBooking={hasActiveBooking}
                   />
                 </motion.div>
               ))}
             </div>
           ) : (
             <div className="text-center py-24 space-y-4">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold">Tidak ada kamar yang cocok</h3>
               <p className="text-slate-500">Coba ubah filter atau pencarian Anda</p>
               <Button variant="secondary" onClick={() => { setFilterType('All'); setMaxPrice(2500000); setSearchQuery(''); }}>Reset Semua Filter</Button>
             </div>
           )}
        </div>
      </section>

      {/* How it Works */}
      <section className="px-6 md:px-12 py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center space-y-16">
           <h2 className="text-4xl font-serif">Cara Booking di NestIn</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Pilih Kamar', desc: 'Jelajahi berbagai tipe kamar yang tersedia sesuai budget Anda.', icon: Bed },
                { title: 'Isi Data', desc: 'Lengkapi formulir pendaftaran dan tentukan durasi sewa Anda.', icon: FileText },
                { title: 'Konfirmasi Bayar', desc: 'Bayar melalui berbagai metode dan konfirmasi untuk aktifkan kamar.', icon: Check },
              ].map((step, idx) => (
                <div key={idx} className="space-y-4">
                   <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-emerald-200">
                      {idx + 1}
                   </div>
                   <h3 className="text-xl font-bold">{step.title}</h3>
                   <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedKamar} 
        onClose={() => setSelectedKamar(null)} 
        title={`Detail Kamar ${selectedKamar?.nomor}`}
        size="lg"
      >
        {selectedKamar && (
          <div className="space-y-8 p-8 pt-4">
            <img 
               src={selectedKamar.foto_url} 
               className="w-full h-72 object-cover rounded-xl shadow-xs" 
               referrerPolicy="no-referrer"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-bold">Informasi Kamar</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Tipe</p>
                      <p className="text-sm font-bold">{selectedKamar.tipe}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Lantai</p>
                      <p className="text-sm font-bold">{selectedKamar.lantai}</p>
                   </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fasilitas:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedKamar.fasilitas.map(f => (
                      <span key={f} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                         {f}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedKamar.deskripsi}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-between">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Harga Sewa Bulanan</p>
                    <p className="text-3xl font-bold text-emerald-600 font-mono">
                      {formatRupiah(selectedKamar.harga_aktif || selectedKamar.harga_dasar)}
                    </p>
                 </div>
                 <div className="space-y-3">
                    <Button className="w-full py-4 text-lg" onClick={() => { onBook(selectedKamar); setSelectedKamar(null); }}>
                       Pesan Sekarang <ArrowRight className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold justify-center">
                       <Check className="w-3 h-3 text-emerald-500" /> Tersedia hari ini
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 md:px-12 py-20 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="text-2xl font-bold font-serif">NestIn</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Platform manajemen kosan digital terdepan di Indonesia. Menghubungkan tenant dan pemilik dengan sistem yang cerdas.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Navigasi</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Cari Kamar</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Tentang Kami</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Syarat & Ketentuan</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Kebijakan Privasi</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Kontak</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>Jl. Merdeka No. 123, Bandung</li>
              <li>+62 812 3456 7890</li>
              <li>hello@nestin.id</li>
            </ul>
          </div>
          <div>
             <h4 className="text-lg font-bold mb-6">Ikuti Kami</h4>
             <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer"><Star className="w-5 h-5" /></div>
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer"><MapPin className="w-5 h-5" /></div>
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer"><ArrowRight className="w-5 h-5" /></div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
           &copy; 2025 NestIn Indonesia. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FileText = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
