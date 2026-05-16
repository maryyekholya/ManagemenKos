import React, { useState } from 'react';
import { 
  Home, Bed, FileText, Settings, 
  CheckCircle2, XCircle, Clock, Search, Filter, MessageSquare, AlertTriangle, ArrowRight,
  TrendingUp, CreditCard, DollarSign, ChevronRight
} from 'lucide-react';
import { useApp } from '../../App';
import { Booking, Kamar, Keluhan, RoomStatus, Payment } from '../../types';
import { BookingMachine, ComplaintStrategy } from '../../lib/patterns';
import { formatRupiah, cn } from '../../lib/utils';
import { StatusBadge, Button, Modal } from '../../components/shared/UI';
import { motion, AnimatePresence } from 'motion/react';

import { ChatWidget } from '../../components/shared/ChatWidget';

export const ManagerDashboard: React.FC = () => {
    const { state, dispatch } = useApp();
    const [activeTab, setActiveTab] = useState('kanban');
    const [selectedTenant, setSelectedTenant] = useState<{id: string, name: string} | null>(null);

    return (
        <div className="flex pt-20 h-screen overflow-hidden bg-slate-50 relative">
            {/* Sidebar Nav */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 space-y-8">
                <div>
                   <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Management Menu</h2>
                   <div className="space-y-2">
                        {[
                            { id: 'kanban', label: 'Overview Unit', icon: Bed },
                            { id: 'keluhan', label: 'Daftar Keluhan', icon: FileText, badge: state.keluhans.filter(k => k.status !== 'RESOLVED').length },
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
                {activeTab === 'transaksi' && <FinancialHistory />}
            </main>
            <ChatWidget />
        </div>
    );
};

const FinancialHistory = () => {
   const { state } = useApp();
   const successPayments = state.payments.filter(p => p.status === 'SUCCESS');

   return (
      <div className="space-y-8 max-w-5xl">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-serif">Riwayat Pembayaran</h1>
               <p className="text-slate-500 text-sm mt-1">Laporan arus kas masuk dari seluruh tenant.</p>
            </div>
            <Button variant="secondary" className="gap-2">
               <Download className="w-4 h-4" /> Download Laporan
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Transaksi</p>
                  <p className="text-lg font-bold">{successPayments.length}</p>
               </div>
            </div>
            {/* Add more stats if needed */}
         </div>

         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-left">
            <table className="w-full text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / Tanggal</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penyewa / Kamar</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metode</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Nominal</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {successPayments.map(p => {
                     const booking = state.bookings.find(b => b.id === p.booking_id);
                     const kamar = state.kamars.find(k => k.id === booking?.kamar_id);
                     return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                           <td className="px-8 py-6">
                              <p className="font-mono text-xs font-bold text-slate-900 mb-1">#{p.id.slice(0,8)}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{p.tanggal}</p>
                           </td>
                           <td className="px-8 py-6">
                              <p className="font-bold text-slate-900">{booking?.user_name || 'System'}</p>
                              <p className="text-[10px] text-emerald-600 font-bold uppercase">Room {kamar?.nomor}</p>
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
         </div>
      </div>
   );
};

const KanbanBoard = () => {
    const { state, dispatch } = useApp();
    const columns: RoomStatus[] = ['TERSEDIA', 'DIPESAN', 'MENUNGGU_PEMBAYARAN', 'DIKONFIRMASI', 'DIHUNI'];
    
    return (
        <div className="h-full flex flex-col space-y-8">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-4xl font-serif text-slate-900">Overview Hunian</h1>
                    <p className="text-slate-500 mt-1">Pantau status seluruh unit kamar NestIn.</p>
                 </div>
                 <div className="flex -space-x-4">
                    {DEMO_ADMIN_AVATARS.map((av, i) => (
                        <div key={i} className="w-12 h-12 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
                           <img src={av} className="w-full h-full object-cover" />
                        </div>
                    ))}
                 </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-x-auto pb-12 items-start scrollbar-hide">
               {columns.map(col => {
                   const kamarsInCol = state.kamars.filter(k => k.status === col);
                   return (
                       <div key={col} className="w-80 shrink-0 flex flex-col gap-6">
                           <div className="flex items-center justify-between px-4 bg-slate-100/50 py-3 rounded-2xl">
                               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{col.replace(/_/g, ' ')}</h3>
                               <span className="w-6 h-6 bg-white text-slate-600 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm">{kamarsInCol.length}</span>
                           </div>
                           <div className="flex-1 space-y-5">
                               {kamarsInCol.map(k => (
                                   <div key={k.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer group active:scale-[0.98]">
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
        </div>
    );
};

const KeluhanList = () => {
    const { state, dispatch } = useApp();
    
    const handleStatusUpdate = (id: string, newStatus: string) => {
       dispatch({
          type: 'UPDATE_KELUHAN',
          payload: { id, data: { status: newStatus } }
       });
    };

    return (
        <div className="space-y-10 max-w-6xl">
            <div>
               <h1 className="text-4xl font-serif">Pusat Keluhan</h1>
               <p className="text-slate-500 mt-1">Tangani permintaan perbaikan dan laporan gangguan dari tenant.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {state.keluhans.map(k => {
                   const routing = ComplaintStrategy.route(k.deskripsi);
                   return (
                       <div key={k.id} className={cn(
                          "bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative transition-all hover:shadow-xl",
                          k.status === 'RESOLVED' && "opacity-60 grayscale hover:grayscale-0"
                       )}>
                           <div className="flex justify-between items-start">
                               <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                     <span className={cn(
                                       "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm",
                                       k.priority === 'HIGH' ? "bg-red-500 text-white" : "bg-orange-400 text-white"
                                     )}>
                                        {k.priority} Priority
                                     </span>
                                     <span className={cn(
                                        "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border",
                                        k.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                     )}>
                                        {k.status}
                                     </span>
                                  </div>
                                  <div>
                                     <h3 className="text-2xl font-serif text-slate-900">Unit {k.kamar_nomor}</h3>
                                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{k.id} • {k.user_name}</p>
                                  </div>
                               </div>
                               <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                                  <MessageSquare className="w-8 h-8" />
                               </div>
                           </div>

                           <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100/50 text-slate-700 leading-relaxed font-medium">
                              "{k.deskripsi}"
                           </div>

                           <div className="flex items-center justify-between p-5 bg-emerald-600 text-white rounded-[2rem] shadow-lg shadow-emerald-100">
                              <div className="flex items-center gap-4">
                                 <AlertTriangle className="w-6 h-6 opacity-60" />
                                 <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Delegasi Otomatis</p>
                                    <p className="text-sm font-bold">{routing.assignee}</p>
                                 </div>
                              </div>
                              <ArrowRight className="w-5 h-5 opacity-40" />
                           </div>

                           {k.status !== 'RESOLVED' && (
                              <div className="flex gap-4 pt-4">
                                 <Button 
                                    className="flex-1 py-4 text-sm shadow-xl shadow-emerald-100"
                                    onClick={() => handleStatusUpdate(k.id, 'RESOLVED')}
                                 >
                                    Tandai Selesai
                                 </Button>
                                 <Button 
                                    variant="secondary" 
                                    className="flex-1 py-4 text-sm"
                                    onClick={() => handleStatusUpdate(k.id, 'IN_PROGRESS')}
                                 >
                                    Proses Perbaikan
                                 </Button>
                              </div>
                           )}
                       </div>
                   );
               })}
               {state.keluhans.length === 0 && (
                  <div className="md:col-span-2 py-40 border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-slate-300 gap-4">
                     <FileText className="w-16 h-16" />
                     <p className="font-serif text-xl">Belum ada laporan keluhan masuk.</p>
                  </div>
               )}
            </div>
        </div>
    );
};

const Download = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const DEMO_ADMIN_AVATARS = [
   "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
];
;
