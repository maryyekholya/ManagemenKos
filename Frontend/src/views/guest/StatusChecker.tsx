import React, { useState } from 'react';
import { Search, ClipboardList, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../App';
import { Booking } from '../../types';
import { BookingMachine } from '../../lib/patterns';
import { formatRupiah, cn } from '../../lib/utils';
import { StatusBadge, Button, FormInput } from '../../components/shared/UI';
import { motion, AnimatePresence } from 'motion/react';

export const StatusChecker: React.FC = () => {
    const { state } = useApp();
    const [searchId, setSearchId] = useState('');
    const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = () => {
        setIsSearching(true);
        setTimeout(() => {
            const booking = state.bookings.find(b => b.id.toLowerCase() === searchId.toLowerCase());
            setFoundBooking(booking || null);
            setIsSearching(false);
        }, 800);
    };

    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-2xl mx-auto px-6 space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-serif">Lacak Booking Anda</h1>
                    <p className="text-slate-500">Masukkan ID Booking Anda (contoh: BK001) untuk melihat status terbaru.</p>
                </div>

                <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100 flex gap-4">
                    <div className="flex-1 flex items-center gap-4 px-6">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Contoh: BK001" 
                            className="w-full bg-transparent outline-hidden font-bold"
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSearch} isLoading={isSearching} className="rounded-full px-8">Cek Status</Button>
                </div>

                <AnimatePresence mode="wait">
                    {foundBooking ? (
                        <motion.div 
                            key="found"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status Saat Ini</p>
                                   <StatusBadge status={foundBooking.status} className="text-sm px-4 py-2" />
                                </div>
                                <div className="text-right">
                                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                                   <p className="text-xl font-mono font-bold text-slate-900">{foundBooking.id}</p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            <div className="space-y-6">
                               <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Timeline Pemesanan</p>
                               <div className="space-y-8 relative">
                                  <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-slate-100" />
                                  <TimelineItem 
                                    label="Booking Dibuat" 
                                    desc={`Pemesanan diajukan pada ${foundBooking.created_at.split('T')[0]}`} 
                                    isDone 
                                  />
                                  <TimelineItem 
                                    label="Verifikasi Admin" 
                                    desc="Admin sedang meninjau pesanan Anda." 
                                    isDone={foundBooking.status !== 'DIPESAN'} 
                                    isActive={foundBooking.status === 'DIPESAN'} 
                                  />
                                  <TimelineItem 
                                    label="Pembayaran" 
                                    desc="Selesaikan pembayaran untuk konfirmasi kamar." 
                                    isDone={['DIKONFIRMASI', 'DIHUNI', 'SELESAI'].includes(foundBooking.status)} 
                                    isActive={foundBooking.status === 'MENUNGGU_PEMBAYARAN'}
                                  />
                                  <TimelineItem 
                                    label="Check-in" 
                                    desc="Silakan datang ke lokasi pada tanggal mulai sewa." 
                                    isDone={['DIHUNI', 'SELESAI'].includes(foundBooking.status)}
                                    isActive={foundBooking.status === 'DIKONFIRMASI'}
                                  />
                               </div>
                            </div>

                            {foundBooking.status === 'MENUNGGU_PEMBAYARAN' && (
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-4">
                                   <p className="text-sm font-bold text-emerald-800">Menunggu Pembayaran</p>
                                   <p className="text-xs text-emerald-600 leading-relaxed">Silakan lakukan pembayaran sebesar <span className="font-bold">{formatRupiah(foundBooking.total)}</span> melalui metode {foundBooking.metode_bayar}.</p>
                                   <Button className="w-full">Bayar Sekarang</Button>
                                </div>
                            )}
                        </motion.div>
                    ) : searchId && !isSearching ? (
                        <motion.div 
                            key="not-found"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 space-y-4"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto">
                               <XCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold">Booking Tidak Ditemukan</h3>
                            <p className="text-slate-500">Pastikan ID yang Anda masukkan sudah benar.</p>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TimelineItem = ({ label, desc, isDone, isActive }: { label: string; desc: string; isDone: boolean; isActive?: boolean }) => (
    <div className="flex gap-6 relative z-10">
        <div className={cn(
            "w-10 h-10 rounded-full border-4 border-slate-50 flex items-center justify-center shrink-0 transition-all",
            isDone ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : isActive ? "bg-emerald-100 text-emerald-600 animate-pulse" : "bg-white text-slate-200 border-slate-100"
        )}>
            {isDone ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
        </div>
        <div className="pt-1">
            <h4 className={cn("font-bold text-sm", isDone ? "text-slate-900" : isActive ? "text-emerald-700" : "text-slate-400")}>{label}</h4>
            <p className="text-xs text-slate-400 mt-1">{desc}</p>
        </div>
    </div>
);
