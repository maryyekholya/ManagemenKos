import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, Bed, FileText, Settings, 
  CheckCircle2, XCircle, Clock, Search, Filter, MessageSquare, AlertTriangle, ArrowRight,
  TrendingUp, CreditCard, DollarSign, ChevronRight, Download,
  Eye, ImageIcon, ExternalLink, Shield
} from 'lucide-react';
import { useApp } from '../../App';
import { Booking, Kamar, Keluhan, RoomStatus, Payment } from '../../types';
import { BookingMachine } from '../../lib/patterns';
import { formatRupiah, cn } from '../../lib/utils';
import { StatusBadge, Button, Modal } from '../../components/shared/UI';
import { motion, AnimatePresence } from 'motion/react';

import { ChatWidget } from '../../components/shared/ChatWidget';
import { SidebarUserActions } from '../../components/shared/SidebarUserActions';

export const ManagerDashboard: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
    const { state, dispatch } = useApp();
    const activeTab = state.currentView.startsWith('manager-') && state.currentView !== 'manager-dashboard' 
      ? state.currentView.replace('manager-', '') 
      : 'kanban';

    const setActiveTab = (tab: string) => {
      if (tab === 'kanban') onNavigate('manager-dashboard');
      else onNavigate(`manager-${tab}`);
    };

    // Realtime polling system untuk notifikasi keluhan
    useEffect(() => {
        const pollKeluhan = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/v1/admin/complaints');
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    dispatch({ type: 'SET_KELUHANS', payload: json.data });
                }
            } catch (error) {
                // Ignore silent errors during polling
            }
        };

        pollKeluhan(); // Fetch initial data
        const intervalId = setInterval(pollKeluhan, 3000); // Polling setiap 3 detik untuk efek realtime
        return () => clearInterval(intervalId);
    }, [dispatch]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 relative">
            {/* Sidebar Nav */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 space-y-8">
                <SidebarUserActions onNavigate={onNavigate} />
                <div>
                   <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Management Menu</h2>
                   <div className="space-y-2">
                        {[
                            { id: 'kanban', label: 'Overview Unit', icon: Bed },
                            { id: 'keluhan', label: 'Daftar Keluhan', icon: FileText, badge: state.keluhans.filter(k => k.status !== 'RESOLVED').length },
                            { id: 'verifikasi', label: 'Verifikasi Bayar', icon: CheckCircle2, badge: state.bookings.filter(b => b.status === 'MENUNGGU_PEMBAYARAN' && b.paymentClaimTimestamp).length },
                            { id: 'transaksi', label: 'Riwayat Bayar', icon: CreditCard },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all",
                                    activeTab === item.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                   <item.icon className="w-5 h-5" /> {item.label}
                                </div>
                                {item.badge && item.badge > 0 && activeTab !== item.id && (
                                   <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">{item.badge}</span>
                                )}
                            </button>
                        ))}
                   </div>
                </div>

                <div className="mt-auto bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
                   <p className="text-xl font-bold text-slate-900 font-mono">
                      {formatRupiah(state.payments.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + p.jumlah, 0))}
                   </p>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-12">
                {activeTab === 'kanban' && <KanbanBoard />}
                {activeTab === 'keluhan' && <KeluhanList />}
                {activeTab === 'verifikasi' && <PaymentVerification />}
                {activeTab === 'transaksi' && <FinancialHistory />}
            </main>
            <ChatWidget />
        </div>
    );
};

const FinancialHistory = () => {
   const { state } = useApp();
   const [search, setSearch] = useState('');
   const [sortBy, setSortBy] = useState<'date_desc'|'date_asc'|'amount_desc'|'amount_asc'>('date_desc');
   const [apiPayments, setApiPayments] = useState<Payment[]>([]);
   const [apiBookings, setApiBookings] = useState<Booking[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchData = async () => {
       try {
         const [pRes, bRes] = await Promise.all([
           fetch('http://127.0.0.1:8000/api/v1/admin/payments'),
           fetch('http://127.0.0.1:8000/api/v1/admin/bookings'),
         ]);
         const [pJson, bJson] = await Promise.all([pRes.json(), bRes.json()]);
         if (pJson.success) setApiPayments(pJson.data);
         if (bJson.success) setApiBookings(bJson.data);
       } catch {
         // fallback: gunakan state lokal
       } finally {
         setLoading(false);
       }
     };
     fetchData();
   }, []);

   // Gabungkan data API + lokal (API diprioritaskan jika tersedia)
   const allPayments = apiPayments.length > 0 ? apiPayments : state.payments;
   const allBookings = apiBookings.length > 0 ? apiBookings : state.bookings;

   let successPayments = allPayments.filter(p => p.status === 'SUCCESS');

   const [filterMonth, setFilterMonth] = useState<string>('all');
   const [filterYear, setFilterYear] = useState<string>('all');
   const [filterType, setFilterType] = useState<string>('all');
   const [filterRoom, setFilterRoom] = useState<string>('all');

   if (search) {
       const lowerSearch = search.toLowerCase();
       successPayments = successPayments.filter(p => {
           const booking = allBookings.find(b => b.id === p.booking_id);
           return p.id.toLowerCase().includes(lowerSearch) || 
                  (booking?.user_name || '').toLowerCase().includes(lowerSearch) ||
                  p.metode.toLowerCase().includes(lowerSearch);
       });
   }

   // Terapkan Filter Pembayaran
   successPayments = successPayments.filter(p => {
       const date = new Date(p.tanggal);
       const pMonth = (date.getMonth() + 1).toString();
       const pYear = date.getFullYear().toString();
       const booking = allBookings.find(b => b.id === p.booking_id);
       const kamar = state.kamars.find(k => k.id === booking?.kamar_id);

       let match = true;
       if (filterMonth !== 'all' && pMonth !== filterMonth) match = false;
       if (filterYear !== 'all' && pYear !== filterYear) match = false;
       if (filterType !== 'all' && kamar?.tipe !== filterType) match = false;
       if (filterRoom !== 'all' && kamar?.id !== filterRoom) match = false;

       return match;
   });

   successPayments.sort((a, b) => {
       if (sortBy === 'date_desc') return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
       if (sortBy === 'date_asc') return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
       if (sortBy === 'amount_desc') return b.jumlah - a.jumlah;
       if (sortBy === 'amount_asc') return a.jumlah - b.jumlah;
       return 0;
   });

   const totalRevenue = successPayments.reduce((acc, p) => acc + p.jumlah, 0);

   // ── Download CSV ─────────────────────────────────────────────
   const handleDownload = () => {
     const rows = [
       ['ID Transaksi', 'Tanggal', 'Penyewa', 'Kamar', 'Metode', 'Nominal', 'Midtrans ID'],
       ...successPayments.map(p => {
         const booking = allBookings.find(b => b.id === p.booking_id);
         const kamar = state.kamars.find(k => k.id === booking?.kamar_id);
         return [
           p.id,
           p.tanggal,
           booking?.user_name || 'System',
           kamar ? `Kamar ${kamar.nomor}` : '-',
           p.metode,
           p.jumlah.toString(),
           p.midtrans_id || 'MANUAL',
         ];
       }),
       [],
       ['', '', '', '', 'TOTAL PENDAPATAN', totalRevenue.toString(), ''],
     ];

     const csvContent = rows
       .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
       .join('\n');

     const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `laporan-keuangan-${new Date().toISOString().split('T')[0]}.csv`;
     link.click();
     URL.revokeObjectURL(url);
   };

   return (
      <div className="space-y-8 max-w-5xl">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-serif">Riwayat Pembayaran</h1>
               <p className="text-slate-500 text-sm mt-1">Laporan arus kas masuk dari seluruh tenant.</p>
            </div>
            <Button variant="secondary" className="gap-2" onClick={handleDownload}>
               <Download className="w-4 h-4" /> Download Laporan
            </Button>
         </div>

         <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Cari transaksi..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            {/* Filter Bulan */}
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500">
               <option value="all">Bulan: Semua</option>
               {Array.from({length: 12}).map((_, i) => (
                  <option key={i+1} value={String(i+1)}>Bulan: {i+1}</option>
               ))}
            </select>

            {/* Filter Tahun */}
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500">
               <option value="all">Tahun: Semua</option>
               <option value="2024">2024</option>
               <option value="2025">2025</option>
               <option value="2026">2026</option>
            </select>

            {/* Filter Tipe Kamar */}
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500">
               <option value="all">Tipe: Semua</option>
               {Array.from(new Set(state.kamars.map(k => k.tipe))).map(tipe => (
                  <option key={tipe} value={tipe}>{tipe}</option>
               ))}
            </select>

            {/* Filter Kamar Spesifik */}
            <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500">
               <option value="all">Kamar: Semua</option>
               {state.kamars.map(k => (
                  <option key={k.id} value={k.id}>Kamar {k.nomor}</option>
               ))}
            </select>

            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
                <option value="date_desc">Terbaru</option>
                <option value="date_asc">Terlama</option>
                <option value="amount_desc">Tertinggi</option>
                <option value="amount_asc">Terendah</option>
            </select>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Transaksi</p>
                  <p className="text-lg font-bold">{loading ? '...' : successPayments.length}</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pendapatan</p>
                  <p className="text-lg font-bold font-mono text-emerald-600">{loading ? '...' : formatRupiah(totalRevenue)}</p>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-left">
            {loading ? (
              <div className="py-20 text-center text-slate-400">Memuat data pembayaran...</div>
            ) : successPayments.length === 0 ? (
              <div className="py-20 text-center text-slate-400">Tidak ada data pembayaran.</div>
            ) : (
            <table className="w-full text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">ID / Tanggal</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Penyewa / Kamar</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Metode</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Nominal</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {successPayments.map(p => {
                     const booking = allBookings.find(b => b.id === p.booking_id);
                     const kamar = state.kamars.find(k => k.id == booking?.kamar_id);
                     return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                           <td className="px-8 py-6">
                              <p className="font-mono text-xs font-bold text-slate-900 mb-1">#{p.id.slice(0,8)}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{p.tanggal}</p>
                           </td>
                           <td className="px-8 py-6">
                              <p className="font-bold text-slate-900">{booking?.user_name || 'System'}</p>
                              <p className="text-[10px] text-emerald-600 font-bold uppercase">Room {kamar?.nomor || '-'}</p>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                 {p.metode}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <p className="text-base font-bold font-mono text-emerald-600">{formatRupiah(p.jumlah)}</p>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
            )}
         </div>
      </div>
   );
};

const KanbanBoard = () => {
    const { state, dispatch } = useApp();
    const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedKamar, setSelectedKamar] = useState<Kamar | null>(null);
    const columns: RoomStatus[] = ['TERSEDIA', 'DIPESAN', 'MENUNGGU_PEMBAYARAN', 'DIKONFIRMASI', 'DIHUNI'];
    
    // Ambil daftar lantai unik
    const availableFloors = Array.from(new Set(state.kamars.map(k => k.lantai))).sort();

    const openRoomDetail = (k: Kamar) => {
        setSelectedKamar(k);
        setDetailModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-8">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-4xl font-serif text-slate-900">Overview Hunian</h1>
                    <p className="text-slate-500 mt-1">Pantau status seluruh unit kamar NestIn.</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                        className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="ALL">Semua Lantai</option>
                        {availableFloors.map(floor => (
                            <option key={floor} value={floor}>Lantai {floor}</option>
                        ))}
                    </select>

                    <div className="flex -space-x-4">
                        {DEMO_ADMIN_AVATARS.map((av, i) => (
                            <div key={i} className="w-12 h-12 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
                               <img src={av} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-x-auto pb-12 items-start scrollbar-hide">
               {columns.map(col => {
                   let kamarsInCol = state.kamars.filter(k => k.status === col);
                   if (selectedFloor !== 'ALL') {
                       kamarsInCol = kamarsInCol.filter(k => k.lantai === selectedFloor);
                   }
                   return (
                       <div key={col} className="w-80 shrink-0 flex flex-col gap-6">
                           <div className="flex items-center justify-between px-4 bg-slate-100/50 py-3 rounded-2xl">
                               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{col.replace(/_/g, ' ')}</h3>
                               <span className="w-6 h-6 bg-white text-slate-600 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm">{kamarsInCol.length}</span>
                           </div>
                           <div className="flex-1 space-y-5">
                               {kamarsInCol.map(k => (
                                   <div key={k.id} onClick={() => openRoomDetail(k)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer group active:scale-[0.98]">
                                       <div className="flex justify-between items-start">
                                          <div className="space-y-1">
                                             <h4 className="font-bold text-xl text-slate-900 group-hover:text-emerald-600 transition-colors">Unit {k.nomor}</h4>
                                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{k.tipe} • Lantai {k.lantai}</p>
                                          </div>
                                          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 flex items-center justify-center transition-all">
                                             <ChevronRight className="w-5 h-5" />
                                          </div>
                                       </div>
                                       {k.status !== 'TERSEDIA' && (
                                           <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                                                    {k.nomor[0]}
                                                 </div>
                                                 <span className="text-xs font-bold text-slate-700">Occupied</span>
                                              </div>
                                              <Clock className="w-4 h-4 text-slate-300" />
                                           </div>
                                       )}
                                   </div>
                               ))}
                               {kamarsInCol.length === 0 && (
                                   <div className="h-40 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 gap-2 grayscale opacity-50">
                                       <Bed className="w-8 h-8" />
                                       <p className="text-[10px] font-bold uppercase">No Units</p>
                                   </div>
                               )}
                           </div>
                       </div>
                   );
               })}
            </div>
            <RoomDetailModal 
               isOpen={detailModalOpen} 
               onClose={() => { setDetailModalOpen(false); setSelectedKamar(null); }} 
               kamar={selectedKamar} 
            />
        </div>
    );
};

const RoomDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    kamar: Kamar | null;
}> = ({ isOpen, onClose, kamar }) => {
    const { state } = useApp();
    if (!kamar) return null;

    // Cari booking aktif untuk kamar ini
    const activeBooking = state.bookings.find(b => b.kamar_id === kamar.id && (b.status === 'DIKONFIRMASI' || b.status === 'DIHUNI' || b.status === 'MENUNGGU_PEMBAYARAN'));
    const tenant = activeBooking ? state.users.find(u => u.id === activeBooking.user_id) : null;
    const roomKeluhans = state.keluhans.filter(k => k.kamar_nomor === kamar.nomor);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detail Unit ${kamar.nomor}`}>
            <div className="p-6 space-y-8">
               <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Saat Ini</p>
                     <p className="text-lg font-bold text-slate-900">{kamar.status.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe</p>
                     <p className="text-sm font-bold text-emerald-600">{kamar.tipe}</p>
                  </div>
               </div>

               {activeBooking && (
                   <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Data Penghuni</h4>
                      <div className="flex gap-4 items-center">
                         <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold">
                            {activeBooking.user_name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold">{activeBooking.user_name}</p>
                            <p className="text-xs text-slate-500">{tenant?.email || 'N/A'} • {activeBooking.user_phone}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                         <div className="bg-white p-3 border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mulai Sewa</p>
                            <p className="font-mono text-sm font-bold">{activeBooking.tgl_masuk}</p>
                         </div>
                         <div className="bg-white p-3 border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batas Sewa</p>
                            <p className="font-mono text-sm font-bold text-amber-600">{activeBooking.tgl_keluar}</p>
                         </div>
                      </div>
                   </div>
               )}

               <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Riwayat Keluhan ({roomKeluhans.length})</h4>
                  {roomKeluhans.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                         {roomKeluhans.map(keluhan => (
                             <div key={keluhan.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                   <p className="text-xs font-bold">{keluhan.deskripsi}</p>
                                   <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest", keluhan.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700")}>
                                      {keluhan.status}
                                   </span>
                                </div>
                                <p className="text-[10px] text-slate-400">{new Date(keluhan.created_at).toLocaleDateString()}</p>
                             </div>
                         ))}
                      </div>
                  ) : (
                      <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                         <p className="text-xs font-bold uppercase tracking-widest">Tidak ada riwayat keluhan</p>
                      </div>
                  )}
               </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-[2rem]">
               <Button className="w-full" onClick={onClose}>Tutup Detail</Button>
            </div>
        </Modal>
    );
};

const KeluhanList = () => {
    const { state, dispatch } = useApp();
    const [keluhans, setKeluhans] = useState<Keluhan[]>([]);
    const [loadingKeluhan, setLoadingKeluhan] = useState(true);

    const fetchKeluhans = useCallback(async () => {
      setLoadingKeluhan(true);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/admin/complaints');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setKeluhans(json.data);
          dispatch({ type: 'SET_KELUHANS', payload: json.data });
        } else {
          setKeluhans(state.keluhans);
        }
      } catch {
        setKeluhans(state.keluhans);
      } finally {
        setLoadingKeluhan(false);
      }
    }, [state.keluhans]);

    useEffect(() => { fetchKeluhans(); }, []);

    useEffect(() => {
      if (!loadingKeluhan && keluhans.length === 0) {
        setKeluhans(state.keluhans);
      }
    }, [state.keluhans]);
    
    const handleStatusUpdate = async (id: string, newStatus: string) => {
       try {
         await fetch(`http://127.0.0.1:8000/api/v1/admin/complaints/${id}`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status: newStatus }),
         });
       } catch {}
       dispatch({
          type: 'UPDATE_KELUHAN',
          payload: { id, data: { status: newStatus } }
       });
       setKeluhans(prev => prev.map(k => k.id === id ? { ...k, status: newStatus as any } : k));
    };

    const displayKeluhans = (keluhans.length > 0 ? keluhans : state.keluhans).filter(k => k.status !== 'RESOLVED');

    // State untuk Review Modal
    const [reviewKeluhan, setReviewKeluhan] = useState<Keluhan | null>(null);

    return (
        <div className="space-y-10 max-w-6xl">
            <div>
               <h1 className="text-4xl font-serif">Pusat Keluhan</h1>
               <p className="text-slate-500 mt-1">Tangani permintaan perbaikan dan laporan gangguan dari tenant.</p>
            </div>

            {loadingKeluhan ? (
              <div className="py-20 text-center text-slate-400">Memuat data keluhan...</div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {displayKeluhans.map(k => {
                   return (
                       <div key={k.id} className={cn(
                          "bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 relative transition-all hover:shadow-xl",
                          k.status === 'RESOLVED' && "opacity-60 grayscale hover:grayscale-0"
                       )}>
                           {/* Header card */}
                           <div className="flex justify-between items-start gap-4">
                               <div className="space-y-3 min-w-0 flex-1">
                                  <div className="flex items-center gap-3 flex-wrap">
                                     <span className={cn(
                                       "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-sm shrink-0",
                                       k.priority === 'HIGH' ? "bg-red-500 text-white" : "bg-orange-400 text-white"
                                     )}>
                                        {k.priority} Priority
                                     </span>
                                     <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border shrink-0",
                                        k.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                     )}>
                                        {k.status}
                                     </span>
                                  </div>
                                  <div>
                                     <h3 className="text-xl font-serif text-slate-900">Unit {k.kamar_nomor}</h3>
                                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{k.id} • {k.user_name}</p>
                                  </div>
                               </div>
                               <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center shrink-0">
                                  <MessageSquare className="w-7 h-7" />
                               </div>
                           </div>

                           {/* Deskripsi keluhan (preview 3 baris) */}
                           <div className="p-5 bg-slate-50/80 rounded-[1.5rem] border border-slate-100/50 text-slate-700 leading-relaxed font-medium text-sm break-words line-clamp-3">
                              "{k.deskripsi}"
                           </div>

                           {/* Indikator foto lampiran */}
                           {k.attachment_url && (
                             <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                               <ImageIcon className="w-4 h-4" />
                               <span>Foto bukti tersedia</span>
                             </div>
                           )}

                           {/* Action buttons */}
                           <div className="flex gap-3 pt-1">
                              <Button
                                 variant="secondary"
                                 className="flex-1 py-3 text-sm gap-2"
                                 onClick={() => setReviewKeluhan(k)}
                              >
                                 <Eye className="w-4 h-4" /> Review Keluhan
                              </Button>

                              {k.status !== 'RESOLVED' && (
                                 <Button
                                    className="flex-1 py-3 text-sm"
                                    onClick={() => handleStatusUpdate(k.id, 'RESOLVED')}
                                 >
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Tandai Selesai
                                 </Button>
                              )}
                           </div>
                       </div>
                   );
               })}
               {displayKeluhans.length === 0 && (
                  <div className="md:col-span-2 py-40 border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-slate-300 gap-4">
                     <FileText className="w-16 h-16" />
                     <p className="font-serif text-xl">Belum ada laporan keluhan masuk.</p>
                  </div>
               )}
            </div>
            )}

            {/* Riwayat Keluhan Selesai */}
            {keluhans.filter(k => k.status === 'RESOLVED').length > 0 && (
               <div className="mt-12">
                  <h3 className="text-xl font-serif text-slate-400 mb-6 flex items-center gap-2">
                     <CheckCircle2 className="w-5 h-5" /> Riwayat Keluhan Selesai
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
                     {keluhans.filter(k => k.status === 'RESOLVED').map(k => (
                        <div key={k.id} className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6 relative transition-all hover:opacity-100">
                           <div className="flex justify-between items-start gap-4">
                               <div className="space-y-3 min-w-0 flex-1">
                                  <div className="flex items-center gap-3 flex-wrap">
                                     <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-emerald-100 text-emerald-700 shrink-0">
                                        SELESAI
                                     </span>
                                  </div>
                                  <div>
                                     <h3 className="text-xl font-serif text-slate-600">Unit {k.kamar_nomor}</h3>
                                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{k.id} • {k.user_name}</p>
                                  </div>
                               </div>
                               <div className="w-14 h-14 bg-white text-emerald-300 rounded-3xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                  <CheckCircle2 className="w-7 h-7" />
                               </div>
                           </div>

                           <div className="p-5 bg-white rounded-[1.5rem] border border-slate-100/50 text-slate-500 leading-relaxed font-medium text-sm break-words line-clamp-2">
                              "{k.deskripsi}"
                           </div>
                           
                           <div className="flex gap-3 pt-1">
                              <Button
                                 variant="secondary"
                                 className="flex-1 py-3 text-sm gap-2 bg-white"
                                 onClick={() => setReviewKeluhan(k)}
                              >
                                 <Eye className="w-4 h-4" /> Lihat Detail
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* ── Review Keluhan Modal ───────────────────────────── */}
            <Modal
              isOpen={!!reviewKeluhan}
              onClose={() => setReviewKeluhan(null)}
              title="Detail Keluhan"
              size="lg"
            >
              {reviewKeluhan && (
                <div className="px-8 pb-8 pt-2 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {reviewKeluhan.id} · {new Date(reviewKeluhan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h2 className="text-xl font-bold text-slate-900">Unit {reviewKeluhan.kamar_nomor}</h2>
                      <p className="text-sm text-slate-500">{reviewKeluhan.user_name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        reviewKeluhan.priority === 'HIGH' ? "bg-red-500 text-white" : "bg-orange-400 text-white"
                      )}>
                        {reviewKeluhan.priority} Priority
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        reviewKeluhan.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
                      )}>
                        {reviewKeluhan.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deskripsi Keluhan</p>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap break-words">
                      {reviewKeluhan.deskripsi}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Foto Bukti</p>
                    {reviewKeluhan.attachment_url ? (
                      <div className="space-y-3">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                          <img
                            src={reviewKeluhan.attachment_url}
                            alt="Foto bukti keluhan"
                            className="w-full max-h-72 object-contain bg-slate-100"
                          />
                        </div>
                        <a
                          href={reviewKeluhan.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-emerald-600 font-bold hover:underline w-fit"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka foto di tab baru
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 gap-2">
                        <ImageIcon className="w-10 h-10 opacity-30" />
                        <p className="text-xs font-bold uppercase tracking-widest">Tidak ada foto yang dilampirkan</p>
                      </div>
                    )}
                  </div>

                  {reviewKeluhan.assigned_to && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ditugaskan ke</p>
                        <p className="text-sm font-bold text-slate-700">{reviewKeluhan.assigned_to}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setReviewKeluhan(null)}>
                      Tutup
                    </Button>
                    {reviewKeluhan.status !== 'RESOLVED' && (
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => {
                          handleStatusUpdate(reviewKeluhan.id, 'RESOLVED');
                          setReviewKeluhan(null);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Modal>
        </div>
    );
};

const Download_old = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const PaymentVerification = () => {
    const { state, dispatch } = useApp();
    const [apiBookings, setApiBookings] = useState<Booking[]>([]);
    
    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/admin/bookings');
            const json = await res.json();
            if (json.success) setApiBookings(json.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Cari booking CASH yang DIKONFIRMASI, ATAU metode lain yang diunggah bukti tapi masih MENUNGGU_PEMBAYARAN
    const allBookings = apiBookings.length > 0 ? apiBookings : state.bookings;
    const pendingVerifications = allBookings.filter(b => 
        (b.status === 'DIKONFIRMASI' && b.metode_bayar === 'CASH') ||
        (b.status === 'MENUNGGU_PEMBAYARAN' && b.paymentClaimTimestamp)
    );

    const handleVerify = async (booking: Booking, isValid: boolean) => {
        if (isValid) {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/bookings/${booking.id}/approve`, {
                    method: 'PUT',
                    headers: { 'Accept': 'application/json' }
                });
                const data = await res.json();
                if (data.success) {
                    alert('Pembayaran divalidasi dan kamar resmi dihuni!');
                    fetchBookings();
                } else {
                    alert(data.message || 'Gagal memvalidasi.');
                }
            } catch {
                alert('Error koneksi.');
            }
        } else {
            // For reject, maybe call reject endpoint if it exists
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/bookings/${booking.id}/reject`, {
                    method: 'PUT',
                    headers: { 'Accept': 'application/json' }
                });
                const data = await res.json();
                if (data.success) {
                    alert('Pembayaran ditolak!');
                    fetchBookings();
                } else {
                    alert(data.message || 'Gagal menolak.');
                }
            } catch {
                alert('Error koneksi.');
            }
        }
    };

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
               <h1 className="text-4xl font-serif">Verifikasi Pembayaran</h1>
               <p className="text-slate-500 mt-1">Validasi pembayaran tenant yang menunggu konfirmasi manual.</p>
            </div>

            <div className="space-y-6">
                {pendingVerifications.map(b => {
                    const kamar = state.kamars.find(k => k.id == b.kamar_id);
                    return (
                        <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex gap-6 items-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Kamar {kamar?.nomor}</h3>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{b.user_name} • {b.metode_bayar}</p>
                                    <p className="text-xl font-mono font-bold text-emerald-600 mt-2">{formatRupiah(b.total)}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="secondary" className="px-6 py-3 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleVerify(b, false)}>
                                    <XCircle className="w-5 h-5 mr-2" /> Tolak
                                </Button>
                                <Button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleVerify(b, true)}>
                                    <CheckCircle2 className="w-5 h-5 mr-2" /> Validasi Sah
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {pendingVerifications.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
                        <CheckCircle2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">Semua pembayaran telah diverifikasi.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DEMO_ADMIN_AVATARS = [
   "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
];
;
