import React, { useState } from 'react';
import { 
  Home, Bed, ClipboardList, CreditCard, FileText, Settings, 
  User as UserIcon, Phone, MapPin, CheckCircle2, AlertCircle, Clock, Plus, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../App';
import { Booking, Keluhan, RoomStatus, Payment, Kamar, ComplaintPriority } from '../../types';
import { BookingMachine } from '../../lib/patterns';
import { formatRupiah, cn } from '../../lib/utils';
import { StatusBadge, Button, FormInput, Modal } from '../../components/shared/UI';
import { QRPaymentModal } from '../../components/shared/QRPaymentModal';
import { ChatWidget } from '../../components/shared/ChatWidget';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { differenceInDays, addMonths, format } from 'date-fns';

// PART 6 — BOOKING STATUS TIMELINE (User View)
const BookingStatusTimeline: React.FC<{ status: RoomStatus, claimed: boolean }> = ({ status, claimed }) => {
  const steps = [
    { id: 'payment', label: 'Menunggu Pembayaran', description: 'Silakan bayar via QRIS', icon: CreditCard },
    { id: 'verification', label: 'Verifikasi Admin', description: 'Admin sedang mengecek dana', icon: Clock },
    { id: 'confirmed', label: 'Booking Dikonfirmasi', description: 'Kamar Anda sudah siap', icon: CheckCircle2 },
    { id: 'occupied', label: 'Dihuni', description: 'Selamat datang di unit Anda', icon: Bed },
    { id: 'completed', label: 'Selesai', description: 'Terima kasih telah bersama kami', icon: Home },
  ];

  let currentStep = 0;
  if (status === 'MENUNGGU_PEMBAYARAN') currentStep = claimed ? 1 : 0;
  else if (status === 'DIKONFIRMASI') currentStep = 2;
  else if (status === 'DIHUNI') currentStep = 3;
  else if (status === 'SELESAI') currentStep = 4;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex justify-between relative px-2">
         <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-100 -z-10" />
         {steps.map((s, idx) => (
           <div key={s.id} className="flex flex-col items-center gap-2 max-w-[80px] text-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                idx < currentStep ? "bg-emerald-600 text-white" : idx === currentStep ? "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50" : "bg-white border border-slate-200 text-slate-300"
              )}>
                 {idx < currentStep || (status === 'SELESAI' && idx === 4) ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
              </div>
              <p className={cn(
                "text-[9px] font-bold uppercase tracking-tight leading-tight",
                idx <= currentStep ? "text-slate-900" : "text-slate-300"
              )}>{s.label}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

const PaymentReminder: React.FC<{ booking: Booking, onPay: () => void }> = ({ booking, onPay }) => {
  const { state } = useApp();
  const [timeLeft, setTimeLeft] = useState('');

  React.useEffect(() => {
    const calculateTime = () => {
      const created = new Date(booking.created_at).getTime();
      const timeoutMs = state.config.payment_timeout * 60 * 60 * 1000;
      const now = Date.now();
      const diff = (created + timeoutMs) - now;

      if (diff <= 0) return 'Expired';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}j ${minutes}m`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000 * 60);
    return () => clearInterval(interval);
  }, [booking.created_at, state.config.payment_timeout]);

  const showNudge = !booking.paymentClaimTimestamp || 
    (new Date().getTime() - new Date(booking.paymentClaimTimestamp).getTime() > 60 * 60 * 1000);

  if (!showNudge) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 ring-4 ring-amber-50/50"
    >
       <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
             <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
             <h4 className="font-bold text-amber-900">Selesaikan Pembayaran!</h4>
             <p className="text-xs text-amber-700 leading-relaxed max-w-md">
                Pesanan Kamar {state.kamars.find(k => k.id === booking.kamar_id)?.nomor} Anda akan hangus jika tidak segera dibayar. 
                Sisa waktu: <span className="font-bold underline decoration-2">{timeLeft}</span>
             </p>
          </div>
       </div>
       <Button onClick={onPay} className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-200 px-8 py-3 whitespace-nowrap">
          Bayar Sekarang
       </Button>
    </motion.div>
  );
};

const PaymentReceipt: React.FC<{ isOpen: boolean, onClose: () => void, booking: Booking }> = ({ isOpen, onClose, booking }) => {
  const { state } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const kamar = state.kamars.find(k => k.id === booking.kamar_id);
  const payments = state.payments.filter(p => p.booking_id === booking.id && p.status === 'SUCCESS');
  const user = state.users.find(u => u.id === booking.user_id) || state.currentUser;
  const config = state.config;

  if (!isOpen || !kamar || payments.length === 0) return null;

  const totalPaid = payments.reduce((acc, p) => acc + p.jumlah, 0);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`KWITANSI-NEstin-${booking.id.toUpperCase()}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col max-h-[90vh]"
      >
        <div className="flex-1 overflow-y-auto">
          <div id="receipt-content" className="p-12 space-y-10 bg-white relative">
             {/* PAID Watermark */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] select-none">
                <p className="text-[200px] font-black border-[20px] border-emerald-600 text-emerald-600 px-12 py-4 rounded-[4rem]">LUNAS</p>
             </div>

             {/* Receipt Header */}
             <div className="flex justify-between items-start border-b border-slate-100 pb-10 relative z-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                         <Home className="w-7 h-7 text-white" />
                      </div>
                      <div>
                         <h2 className="text-2xl font-serif text-emerald-600 leading-none">{config.nama_kos}</h2>
                         <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic font-mono">Modern Housing Solution</p>
                      </div>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-500 font-medium">{config.alamat}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{config.telepon} • {config.email}</p>
                   </div>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2">Official Payment Receipt</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Booking Reference</p>
                   <p className="font-bold text-slate-900 text-lg">#{booking.id.toUpperCase()}</p>
                   <p className="text-xs text-slate-400 mt-2">Dihasilkan pada {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
             </div>

             {/* Content */}
             <div className="grid grid-cols-2 gap-12 text-left relative z-10">
                <div className="space-y-6">
                   <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Informasi Penyewa</h4>
                      <p className="font-bold text-slate-900 text-lg">{booking.user_name}</p>
                      <p className="text-sm text-slate-500">{booking.user_phone}</p>
                      {user?.address && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">{user.address}</p>
                      )}
                   </div>
                   <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Detail Hunian</h4>
                      <p className="font-bold text-slate-900 text-base">Kamar {kamar.nomor}</p>
                      <p className="text-xs text-slate-500">{kamar.tipe} • Lantai {kamar.lantai}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic">{kamar.fasilitas.slice(0, 3).join(', ')}</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Periode Hunian</h4>
                      <div className="flex items-center gap-2 text-slate-900">
                         <Clock className="w-4 h-4 text-slate-300" />
                         <p className="font-bold text-sm">{booking.tgl_masuk} s/d</p>
                      </div>
                      <p className="font-bold text-slate-900 text-sm ml-6">{booking.tgl_keluar}</p>
                      <p className="text-xs text-slate-500 ml-6 mt-1 tracking-tight italic">{booking.durasi_bulan} Bulan Masa Sewa</p>
                   </div>
                   <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Status Pembayaran</h4>
                      <div className="flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                         <p className="font-bold text-emerald-600 text-sm uppercase tracking-widest">Lunas Terbayar</p>
                      </div>
                      <p className="font-bold text-slate-900 text-xl font-mono mt-1">{formatRupiah(totalPaid)}</p>
                   </div>
                </div>
             </div>

             {/* Payments Table */}
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rincian Riwayat Transaksi</h4>
                   <span className="text-[10px] font-medium text-slate-300 italic">ID referensi sistem internal terlampir</span>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                   <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50">
                         <tr>
                            <th className="px-5 py-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Tanggal Transaksi</th>
                            <th className="px-5 py-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Metode</th>
                            <th className="px-5 py-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Nomor Referensi</th>
                            <th className="px-5 py-4 font-bold text-slate-500 uppercase tracking-widest text-[9px] text-right">Nominal</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {payments.map(p => (
                           <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4 font-medium text-slate-600">{p.tanggal}</td>
                              <td className="px-5 py-4">
                                 <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{p.metode}</span>
                              </td>
                              <td className="px-5 py-4 font-mono text-[10px] text-slate-400">{p.midtrans_id || p.id}</td>
                              <td className="px-5 py-4 font-bold text-right text-slate-800">{formatRupiah(p.jumlah)}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* Summary Calculation */}
             <div className="bg-emerald-50/50 rounded-[2.5rem] p-10 space-y-5 border border-emerald-100/50 relative z-10">
                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500 font-medium">Tagihan Pokok Sewa</span>
                         <span className="font-bold text-slate-900">{formatRupiah(booking.total)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500 font-medium">PPN & Biaya Administrasi</span>
                         <span className="text-emerald-600 font-bold italic">Bebas Biaya (Non-PPN)</span>
                      </div>
                      <div className="pt-4 border-t border-emerald-100 flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-900 uppercase">Total Kewajiban</span>
                         <span className="text-base font-bold text-slate-900 font-mono">{formatRupiah(booking.total)}</span>
                      </div>
                   </div>
                   <div className="flex flex-col justify-center items-end border-l border-emerald-100 pl-10 space-y-3">
                      <div className="text-right">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Total Dana Diterima</p>
                         <p className="text-3xl font-bold text-emerald-700 font-mono tracking-tighter">{formatRupiah(totalPaid)}</p>
                      </div>
                      <div className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-emerald-200/50">
                         <ShieldCheck className="w-4 h-4" /> Valid Sertifikasi Keamanan
                      </div>
                   </div>
                </div>
             </div>

             {/* Footer - Signature & QR */}
             <div className="flex justify-between items-end pt-10 border-t border-dashed border-slate-200 relative z-10">
                <div className="flex gap-8 items-center">
                   {/* Simulated QR Code */}
                   <div className="w-24 h-24 bg-white border-4 border-slate-50 rounded-2xl p-2 shadow-inner group cursor-help transition-all hover:scale-105 active:scale-95" title="Pindai untuk verifikasi keaslian dokumen">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-1 overflow-hidden relative">
                         <div className="grid grid-cols-4 gap-0.5 w-full h-full opacity-60">
                           {Array.from({ length: 16 }).map((_, i) => (
                             <div key={i} className={`aspect-square ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                           ))}
                         </div>
                         <div className="absolute inset-0 flex items-center justify-center p-2">
                           <div className="bg-emerald-600 w-full h-full rounded shadow-sm border border-emerald-400 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white uppercase tracking-tighter">NESTIN</span>
                           </div>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <h3 className="text-xl font-serif text-slate-900 leading-none">{config.nama_kos}</h3>
                         <p className="text-[8px] text-slate-400 italic">Property of Digitalized Real Estate • NestIn Inc.</p>
                      </div>
                      <div className="text-[9px] font-mono text-slate-300">
                         VERIF-ID: {booking.id.toUpperCase()}-{booking.user_id.slice(-4)}-{Date.now().toString(36).toUpperCase()}
                      </div>
                   </div>
                </div>

                <div className="text-center space-y-3">
                   <div className="h-16 flex items-end justify-center px-8 border-b border-slate-100">
                      <p className="font-serif italic text-slate-400 text-sm mb-2 select-none opacity-50">E-Signature: Administrator</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Management Sign</p>
                      <p className="text-[8px] text-slate-400 uppercase mt-0.5 tracking-tighter">Authorized Official Document</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex gap-4 shrink-0">
           <Button variant="secondary" className="flex-1 py-4" onClick={onClose}>
              Tutup
           </Button>
           <Button 
            className="flex-1 py-4 gap-2 shadow-xl shadow-emerald-100 bg-emerald-600 border-none text-white hover:bg-emerald-700 transition-all font-bold" 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
           >
              {isGenerating ? (
                <>Menghasilkan PDF...</>
              ) : (
                <>
                  <FileText className="w-5 h-5" /> Download Kwitansi PDF
                </>
              )}
           </Button>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentDetailModal: React.FC<{ isOpen: boolean, onClose: () => void, payment: Payment, onShowReceipt?: (b: Booking) => void }> = ({ isOpen, onClose, payment, onShowReceipt }) => {
  const { state } = useApp();
  const booking = state.bookings.find(b => b.id === payment.booking_id);
  const kamar = booking ? state.kamars.find(k => k.id === booking.kamar_id) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pembayaran" size="md">
      <div className="space-y-8 p-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Pembayaran</p>
            <p className="font-mono text-sm font-bold text-slate-900">{payment.id}</p>
          </div>
          <StatusBadge status="DIKONFIRMASI" />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID</p>
            <p className="font-mono text-sm font-bold text-slate-900">{payment.booking_id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Kamar</p>
            <p className="font-bold text-emerald-600 text-lg">Room {kamar?.nomor || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 font-medium">Metode Pembayaran</span>
            <span className="text-sm font-bold text-slate-900">{payment.metode}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 font-medium">Tanggal Transaksi</span>
            <span className="text-sm font-bold text-slate-900">{payment.tanggal}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-4">
            <span className="text-base font-bold text-slate-900">Total Nominal</span>
            <span className="text-xl font-bold text-emerald-600 font-mono">{formatRupiah(payment.jumlah)}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
           {booking && onShowReceipt && (
             <Button variant="secondary" className="flex-1 gap-2 py-4" onClick={() => onShowReceipt(booking)}>
                <FileText className="w-4 h-4" /> Download Kwitansi
             </Button>
           )}
        </div>

        {payment.midtrans_id && (
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" /> Midtrans Details
            </div>
            <div className="space-y-1">
               <p className="text-[10px] text-emerald-600/60 font-bold uppercase">Transaction ID</p>
               <p className="font-mono text-xs font-bold text-emerald-800">{payment.midtrans_id}</p>
            </div>
          </div>
        )}

        {booking?.paymentAttempts && booking.paymentAttempts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <Clock className="w-4 h-4" /> Riwayat Percobaan Bayar
            </div>
            <div className="space-y-2">
              {booking.paymentAttempts.map((attempt, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-slate-700">{attempt.method}</p>
                    <p className="text-[10px] text-slate-400">{attempt.timestamp}</p>
                  </div>
                  <span className={cn(
                     "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase",
                     attempt.status === 'success' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {attempt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button className="w-full py-4 mt-4" onClick={onClose}>Tutup Detail</Button>
      </div>
    </Modal>
  );
};

import { SidebarUserActions } from '../../components/shared/SidebarUserActions';

export const UserDashboard: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendBookingTarget, setExtendBookingTarget] = useState<Booking | null>(null);

  const tabs = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'bookings', label: 'Booking Saya', icon: ClipboardList },
    { id: 'history', label: 'Riwayat Booking', icon: Clock },
    { id: 'payments', label: 'Riwayat Bayar', icon: CreditCard },
    { id: 'keluhan', label: 'Keluhan', icon: FileText },
  ];

  const handleShowReceipt = (booking: Booking) => {
    setReceiptBooking(booking);
    setShowReceipt(true);
  };

  const handleExtendRent = (booking: Booking) => {
    setExtendBookingTarget(booking);
    setShowExtendModal(true);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'bookings': return <UserBookings onShowReceipt={handleShowReceipt} />;
      case 'history': return <UserHistory onShowReceipt={handleShowReceipt} />;
      case 'payments': return <UserPayments onShowReceipt={handleShowReceipt} />;
      case 'keluhan': return <UserKeluhan />;
      case 'profil': return <UserProfile />;
      case 'home':
      default: return <UserHome setActiveTab={setActiveTab} onNavigate={onNavigate} onShowReceipt={handleShowReceipt} onExtendRent={handleExtendRent} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <SidebarUserActions onNavigate={onNavigate} />

          <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-1">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                   activeTab === tab.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-slate-500 hover:bg-slate-50"
                 )}
               >
                 <tab.icon className="w-5 h-5" /> {tab.label}
               </button>
             ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
           {renderTab()}
        </main>
      </div>

      {state.currentUser && (
        <ChatWidget roomId={state.currentUser.id} targetName="Admin NestIn" />
      )}

      {receiptBooking && (
        <PaymentReceipt 
          isOpen={showReceipt}
          onClose={() => { setShowReceipt(false); setReceiptBooking(null); }}
          booking={receiptBooking}
        />
      )}

      {/* Modal Perpanjang Sewa */}
      {showExtendModal && extendBookingTarget && (
        <Modal 
          isOpen={showExtendModal} 
          onClose={() => setShowExtendModal(false)}
          title="Perpanjang Masa Sewa"
        >
          <div className="space-y-6 text-center">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
               <Clock className="w-8 h-8" />
             </div>
             <div>
               <h3 className="text-xl font-bold">Perpanjang Waktu Sewa</h3>
               <p className="text-slate-500 text-sm mt-2">Masa sewa kamar {state.kamars.find(k => k.id === extendBookingTarget.kamar_id)?.nomor} saat ini akan berakhir pada <b>{extendBookingTarget.tgl_keluar}</b>. Tambah waktu 1 bulan?</p>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-xl text-left space-y-2 border border-slate-100">
               <div className="flex justify-between text-sm">
                 <span>Tambahan Durasi:</span>
                 <span className="font-bold">+1 Bulan</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span>Tanggal Keluar Baru:</span>
                 <span className="font-bold text-emerald-600">
                   {format(addMonths(new Date(extendBookingTarget.tgl_keluar), 1), 'dd MMM yyyy')}
                 </span>
               </div>
               <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                 <span>Total Biaya (Perpanjangan):</span>
                 <span className="font-bold text-slate-900">{formatRupiah(state.kamars.find(k => k.id === extendBookingTarget.kamar_id)?.harga_per_bulan || 0)}</span>
               </div>
             </div>

             <div className="flex gap-4">
               <Button variant="secondary" className="flex-1" onClick={() => setShowExtendModal(false)}>Batal</Button>
               <Button 
                 className="flex-1" 
                 onClick={() => {
                   // Simulasi Pembayaran & Perpanjangan Langsung
                   const harga = state.kamars.find(k => k.id === extendBookingTarget.kamar_id)?.harga_per_bulan || 0;
                   const newTglKeluar = format(addMonths(new Date(extendBookingTarget.tgl_keluar), 1), 'yyyy-MM-dd');
                   dispatch({
                     type: 'UPDATE_BOOKING',
                     payload: {
                       id: extendBookingTarget.id,
                       data: { 
                         tgl_keluar: newTglKeluar, 
                         durasi_bulan: extendBookingTarget.durasi_bulan + 1,
                         total: extendBookingTarget.total + harga 
                       }
                     }
                   });
                   dispatch({
                     type: 'ADD_PAYMENT',
                     payload: {
                       id: `PAY-EXT-${Date.now()}`,
                       booking_id: extendBookingTarget.id,
                       jumlah: harga,
                       metode: 'TRANSFER_BANK',
                       status: 'SUCCESS',
                       tanggal: new Date().toLocaleDateString('id-ID'),
                     }
                   });
                   alert('Sewa berhasil diperpanjang 1 bulan!');
                   setShowExtendModal(false);
                 }}
               >
                 Bayar & Perpanjang
               </Button>
             </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const calculateSisaSewa = (tgl_keluar: string) => {
  const days = differenceInDays(new Date(tgl_keluar), new Date());
  return days > 0 ? days : 0;
};

const UserHome = ({ setActiveTab, onNavigate, onShowReceipt, onExtendRent }: { setActiveTab: (t: string) => void, onNavigate: (v: string) => void, onShowReceipt: (b: Booking) => void, onExtendRent: (b: Booking) => void }) => {
  const { state } = useApp();
  const activeBooking = state.bookings.find(b => b.user_id === state.currentUser?.id && (b.status === 'DIHUNI' || b.status === 'DIKONFIRMASI' || b.status === 'DIPESAN'));
  const pendingBooking = state.bookings.find(b => b.user_id === state.currentUser?.id && b.status === 'MENUNGGU_PEMBAYARAN');

  return (
    <div className="space-y-8">
      <div>
         <h1 className="text-3xl font-serif">Halo, {state.currentUser?.name.split(' ')[0]}! 👋</h1>
         <p className="text-slate-500">Semoga hari Anda menyenangkan di NestIn.</p>
      </div>

      {pendingBooking && (
        <PaymentReminder 
          booking={pendingBooking} 
          onPay={() => setActiveTab('bookings')} 
        />
      )}

       {activeBooking ? (
         <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10 flex-1 space-y-6">
               <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Booking Aktif</p>
                  <h2 className="text-4xl font-serif">Kamar {state.kamars.find(k => k.id === activeBooking.kamar_id)?.nomor}</h2>
               </div>
               <div className="flex gap-8">
                  <div>
                     <p className="text-[10px] font-bold uppercase opacity-60">Status</p>
                     <p className="font-bold">{activeBooking.status.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase opacity-60">Durasi</p>
                     <p className="font-bold">{activeBooking.durasi_bulan} Bulan</p>
                  </div>
               </div>
               <div className="flex gap-3">
                 <Button variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => setActiveTab('bookings')}>
                    Detail Booking
                 </Button>
                 {['DIKONFIRMASI', 'DIHUNI', 'SELESAI'].includes(activeBooking.status) && (
                   <Button variant="secondary" className="bg-white text-emerald-600 gap-2" onClick={() => onShowReceipt(activeBooking)}>
                      <FileText className="w-4 h-4" /> Kwitansi
                   </Button>
                 )}
               </div>
            </div>
            
            <div className="relative z-10 w-full md:w-64 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
               <p className="text-xs font-bold uppercase tracking-widest mb-4">Pengingat</p>
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <Clock className="w-5 h-5 opacity-60" />
                     <p className="text-xs">Sisa Sewa: <span className="font-bold">{calculateSisaSewa(activeBooking.tgl_keluar)} Hari</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                     <AlertCircle className="w-5 h-5 opacity-60" />
                     <p className="text-xs">Berakhir pd: <span className="font-bold">{activeBooking.tgl_keluar}</span></p>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-white text-emerald-700 hover:bg-emerald-50 shadow-md font-bold text-xs"
                    onClick={() => onExtendRent(activeBooking)}
                  >
                    Perpanjang Sewa
                  </Button>
               </div>
            </div>
         </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center space-y-4 shadow-sm">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Bed className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-bold">Belum Ada Kamar Aktif</h3>
           <p className="text-slate-500 max-w-xs mx-auto text-sm">Anda belum memiliki pesanan kamar. Yuk cari kamar favorit Anda sekarang!</p>
           <Button className="px-10" onClick={() => onNavigate('landing')}>Cari Kamar</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Notifikasi Terbaru</h3>
            <div className="space-y-4">
               {state.notifications.slice(0, 3).map(n => (
                 <div key={n.id} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-800 line-clamp-1">{n.message}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Hari ini • 14:30</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-lg">Pembayaran Terakhir</h3>
               <button onClick={() => setActiveTab('payments')} className="text-xs font-bold text-emerald-600 hover:underline">Semua</button>
            </div>
            <div className="space-y-4">
               {state.payments.filter(p => state.bookings.filter(b => b.user_id === state.currentUser?.id).some(b => b.id === p.booking_id) && p.status === 'SUCCESS').slice(0, 2).length > 0 ? (
                 state.payments.filter(p => state.bookings.filter(b => b.user_id === state.currentUser?.id).some(b => b.id === p.booking_id) && p.status === 'SUCCESS').slice(0, 2).map(p => (
                   <div key={p.id} className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                            <CreditCard className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold">{formatRupiah(p.jumlah)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.metode} • {p.tanggal}</p>
                         </div>
                      </div>
                      <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center scale-75">
                         <CheckCircle2 className="w-4 h-4" />
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-6">
                    <p className="text-xs text-slate-400 italic">Belum ada riwayat pembayaran.</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Recent History Prompt */}
      {state.bookings.filter(b => b.user_id === state.currentUser?.id && b.status === 'SELESAI').length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                 <Clock className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="font-bold text-slate-900">Lihat Riwayat Hunian</h4>
                 <p className="text-xs text-slate-500">Akses arsip kwitansi dan detail kamar yang pernah Anda huni.</p>
              </div>
           </div>
           <Button variant="secondary" onClick={() => setActiveTab('history')} className="px-8 border-slate-200">
              Buka Riwayat
           </Button>
        </motion.div>
      )}
    </div>
  );
};

const UserBookings = ({ onShowReceipt }: { onShowReceipt: (b: Booking) => void }) => {
  const { state, dispatch } = useApp();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQR, setShowQR] = useState(false);
  const userBookings = state.bookings.filter(b => b.user_id === state.currentUser?.id);
  const activeBookings = userBookings.filter(b => b.status !== 'SELESAI' && b.status !== 'BATAL');

  const handleQRClaimed = () => {
    if (!selectedBooking) return;

    // Simulate same as BookingFlow
    const adminNotif = {
      id: `N-REQ-${Date.now()}`,
      type: 'PAYMENT_VERIFICATION_REQUEST',
      recipient: 'admin',
      title: 'Verifikasi Pembayaran QRIS',
      message: `${state.currentUser?.name} telah melakukan pembayaran QRIS untuk Kamar ${state.kamars.find(k => k.id === selectedBooking.kamar_id)?.nomor}.`,
      priority: 'HIGH',
      action_required: true,
      actions: ['KONFIRMASI', 'TOLAK'],
      booking_id: selectedBooking.id,
      tenant_name: state.currentUser?.name,
      kamar_nomor: state.kamars.find(k => k.id === selectedBooking.kamar_id)?.nomor,
      amount: selectedBooking.total,
      method: 'QRIS',
      created_at: new Date().toISOString(),
      read: false
    };

    dispatch({ 
      type: 'UPDATE_BOOKING', 
      payload: { 
        id: selectedBooking.id, 
        data: { paymentClaimTimestamp: new Date().toISOString() } 
      } 
    });
    dispatch({ type: 'ADD_NOTIFICATION', payload: adminNotif });
    
    setShowQR(false);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-12 pb-32">
       <div className="space-y-6">
          <h2 className="text-3xl font-serif">Booking Aktif</h2>
          <div className="space-y-8">
             {activeBookings.length > 0 ? activeBookings.map(b => (
               <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                 {/* Context Banners */}
                 {b.status === 'MENUNGGU_PEMBAYARAN' && b.rejectionNote && (
                   <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-3 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">
                     Pembayaran Ditolak: {b.rejectionNote}
                   </div>
                 )}
                 
                 {b.status === 'MENUNGGU_PEMBAYARAN' && b.paymentClaimTimestamp && (
                   <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white p-3 text-[10px] font-bold uppercase tracking-widest text-center">
                     Menunggu Verifikasi Admin...
                   </div>
                 )}

                 <div className="flex justify-between items-start pt-4">
                    <div className="flex gap-4">
                       <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50">
                          <img src={state.kamars.find(k => k.id === b.kamar_id)?.foto_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold">Kamar {state.kamars.find(k => k.id === b.kamar_id)?.nomor}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{b.id} • {state.kamars.find(k => k.id === b.kamar_id)?.tipe}</p>
                       </div>
                    </div>
                    <StatusBadge status={b.status} />
                 </div>

                 {/* Status Timeline */}
                 <BookingStatusTimeline status={b.status} claimed={!!b.paymentClaimTimestamp} />

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-50 text-left">
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tgl Masuk</p>
                       <p className="font-bold">{b.tgl_masuk}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tgl Keluar</p>
                       <p className="font-bold">{b.tgl_keluar}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Metode</p>
                       <p className="font-bold">{b.metode_bayar}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Biaya</p>
                       <p className="font-bold text-emerald-600 font-mono text-lg">{formatRupiah(b.total)}</p>
                    </div>
                 </div>

                 {['DIKONFIRMASI', 'DIHUNI', 'SELESAI'].includes(b.status) && (
                   <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                      <Button 
                        variant="secondary" 
                        className="gap-2 text-[10px] px-6 py-2 border-slate-200"
                        onClick={() => onShowReceipt(b)}
                      >
                         <FileText className="w-3.5 h-3.5" /> Lihat Kwitansi
                      </Button>
                   </div>
                 )}

                 {b.status === 'MENUNGGU_PEMBAYARAN' && !b.paymentClaimTimestamp && (
                   <div className="p-6 bg-slate-50 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                           <CreditCard className="w-6 h-6" />
                         </div>
                         <div>
                           <p className="text-sm font-bold">Tagihan Belum Dibayar</p>
                           <p className="text-xs text-slate-400">Silakan selesaikan pembayaran via {b.metode_bayar}</p>
                         </div>
                      </div>
                      <Button 
                       className="w-full md:w-auto px-10 py-4 shadow-lg shadow-emerald-100"
                       onClick={() => { setSelectedBooking(b); setShowQR(true); }}
                      >
                        Bayar Sekarang
                      </Button>
                   </div>
                 )}
               </div>
             )) : (
               <div className="text-center py-12 bg-white rounded-[2.5rem] border border-slate-100">
                  <p className="text-slate-400 text-sm">Tidak ada booking aktif saat ini.</p>
               </div>
             )}
          </div>
       </div>

       {selectedBooking && (
         <QRPaymentModal 
           isOpen={showQR}
           onClose={() => setShowQR(false)}
           booking={selectedBooking}
           kamar={state.kamars.find(k => k.id === selectedBooking.kamar_id)!}
           onPaymentClaimed={handleQRClaimed}
         />
       )}
    </div>
  );
};

const UserHistory = ({ onShowReceipt }: { onShowReceipt: (b: Booking) => void }) => {
  const { state } = useApp();
  const userBookings = state.bookings.filter(b => b.user_id === state.currentUser?.id);
  const pastBookings = userBookings.filter(b => b.status === 'SELESAI');

  return (
    <div className="space-y-12 pb-32">
        <div className="space-y-1">
            <div className="label-upper">Arsip Sewa</div>
            <h2 className="text-3xl font-serif">Riwayat Hunian</h2>
            <p className="text-slate-500 text-sm">Daftar kamar yang pernah Anda huni sebelumnya.</p>
        </div>

        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
             {pastBookings.map(b => (
               <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                     <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                           <img src={state.kamars.find(k => k.id === b.kamar_id)?.foto_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                           <h4 className="font-bold text-lg text-slate-800">Kamar {state.kamars.find(k => k.id === b.kamar_id)?.nomor}</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{b.id}</p>
                        </div>
                     </div>
                     <StatusBadge status="SELESAI" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-50 text-left">
                     <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 ">Periode Menginap</p>
                        <p className="text-xs font-bold text-slate-700">{b.tgl_masuk} — {b.tgl_keluar}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{b.durasi_bulan} Bulan</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Total Investasi Hunian</p>
                        <p className="text-lg font-bold text-emerald-600 font-mono tracking-tighter">{formatRupiah(b.total)}</p>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3">
                     <Button 
                        variant="secondary" 
                        className="w-full gap-2 text-[10px] font-bold uppercase tracking-widest py-3 border-slate-100"
                        onClick={() => onShowReceipt(b)}
                     >
                        <FileText className="w-3.5 h-3.5" /> Download Arsip Kwitansi
                     </Button>
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">Belum Ada Riwayat</h3>
             <p className="text-slate-400 text-sm max-w-xs mx-auto">Selesaikan periode huni Anda untuk melihat riwayat di sini.</p>
          </div>
        )}
    </div>
  );
};

const UserPayments = ({ onShowReceipt }: { onShowReceipt: (b: Booking) => void }) => {
  const { state } = useApp();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const userBookings = state.bookings.filter(b => b.user_id === state.currentUser?.id);
  const userPayments = state.payments.filter(p => 
    userBookings.some(b => b.id === p.booking_id) && p.status === 'SUCCESS'
  );

  return (
    <div className="space-y-8">
       <h2 className="text-3xl font-serif">Riwayat Pembayaran</h2>
       
       <div className="space-y-4">
          {userPayments.length > 0 ? (
            userPayments.map(p => {
              const booking = userBookings.find(b => b.id === p.booking_id);
              const kamar = booking ? state.kamars.find(k => k.id === booking.kamar_id) : null;
              
              return (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPayment(p)}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer group active:scale-[0.98] relative"
                >
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-bold bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <CreditCard className="w-8 h-8" />
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Pembayaran Sukses</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.tanggal}</span>
                        </div>
                        <p className="text-2xl font-bold font-mono text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
                           {formatRupiah(p.jumlah)}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                           Metode: <span className="font-bold text-slate-700">{p.metode}</span>
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto">
                     <div className="text-left md:text-right space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Detail Hunian</p>
                        <p className="text-sm font-bold text-slate-900">Room {kamar?.nomor || 'N/A'}</p>
                        <p className="text-[10px] font-medium text-slate-400">{kamar?.tipe || '-'}</p>
                     </div>
                     <div className="h-10 w-px bg-slate-100 hidden md:block" />
                     <div className="flex flex-col items-center md:items-end">
                        <StatusBadge status="DIKONFIRMASI" />
                        <p className="text-[9px] text-slate-300 font-mono mt-2 truncate max-w-[100px]">{p.midtrans_id || 'Manual'}</p>
                     </div>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all hidden md:block">
                     <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                     </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
               <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-500">Belum ada riwayat pembayaran berhasil.</p>
            </div>
          )}
       </div>

       <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
          <div className="flex justify-between items-center">
             <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Total Pengeluaran (Terverifikasi)</p>
                <p className="text-3xl font-bold font-mono mt-1">
                   {formatRupiah(userPayments.reduce((acc, p) => acc + p.jumlah, 0))}
                </p>
             </div>
             <CreditCard className="w-10 h-10 opacity-20" />
          </div>
       </div>

       {selectedPayment && (
         <PaymentDetailModal 
           isOpen={!!selectedPayment}
           onClose={() => setSelectedPayment(null)}
           payment={selectedPayment}
           onShowReceipt={onShowReceipt}
         />
       )}
    </div>
  );
};

const UserKeluhan = () => {
    const { state, dispatch } = useApp();
    const [showReportForm, setShowReportForm] = useState(false);
    const [newComplaint, setNewComplaint] = useState({
      booking_id: '',
      deskripsi: '',
      priority: 'MEDIUM' as ComplaintPriority,
      attachment_url: ''
    });

    // Upload state
    const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
    const [isUploading, setIsUploading]   = useState(false);
    const [uploadError, setUploadError]   = useState<string | null>(null);
    const fileInputRef                    = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validasi ukuran: maks 5MB
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Ukuran file melebihi batas 5MB.');
        return;
      }

      setUploadError(null);
      setIsUploading(true);
      // Preview lokal sementara saat upload berlangsung
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      try {
        const formData = new FormData();
        formData.append('attachment', file);

        const response = await fetch('http://127.0.0.1:8000/api/v1/complaints/upload-attachment', {
          method: 'POST',
          body: formData,
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          setUploadError(json.message || 'Gagal mengupload file. Coba lagi.');
          setPreviewUrl(null);
          setNewComplaint(prev => ({ ...prev, attachment_url: '' }));
        } else {
          // Simpan URL publik dari backend
          setNewComplaint(prev => ({ ...prev, attachment_url: json.data.url }));
        }
      } catch {
        setUploadError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
        setPreviewUrl(null);
        setNewComplaint(prev => ({ ...prev, attachment_url: '' }));
      } finally {
        setIsUploading(false);
      }
    };

    const handleRemoveFile = () => {
      setPreviewUrl(null);
      setUploadError(null);
      setNewComplaint(prev => ({ ...prev, attachment_url: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const userBookings = state.bookings.filter(b => b.user_id === state.currentUser?.id && ['DIKONFIRMASI', 'DIHUNI', 'SELESAI'].includes(b.status));
    const userKeluhans = state.keluhans.filter(k => userBookings.some(b => b.id === k.booking_id));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComplaint.booking_id || !newComplaint.deskripsi) return;

      const selectedBooking = userBookings.find(b => b.id === newComplaint.booking_id);
      const kamar = state.kamars.find(k => k.id === selectedBooking?.kamar_id);

      const complaint: Keluhan = {
        id: `K-${Date.now()}`,
        booking_id: newComplaint.booking_id,
        user_name: state.currentUser?.name || 'Anonymous',
        kamar_nomor: kamar?.nomor || '?',
        deskripsi: newComplaint.deskripsi,
        status: 'OPEN',
        assigned_to: 'Staff Maintenance',
        priority: newComplaint.priority,
        created_at: new Date().toISOString(),
        resolved_at: null,
        attachment_url: newComplaint.attachment_url || undefined
      };

      dispatch({ type: 'ADD_KELUHAN', payload: complaint });
      
      // Notify Admin
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `N-K-${Date.now()}`,
          type: 'NEW_COMPLAINT',
          recipient: 'admin',
          title: 'Keluhan Baru',
          message: `${state.currentUser?.name} melaporkan keluhan di Kamar ${kamar?.nomor}`,
          priority: newComplaint.priority,
          read: false,
          created_at: new Date().toISOString()
        }
      });

      setShowReportForm(false);
      setNewComplaint({ booking_id: '', deskripsi: '', priority: 'MEDIUM', attachment_url: '' });
    };

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
           <div>
              <h2 className="text-3xl font-serif">Layanan Keluhan</h2>
              <p className="text-slate-500 text-sm">Laporkan masalah fasilitas atau gangguan lainnya.</p>
           </div>
           <Button onClick={() => setShowReportForm(true)} className="gap-2 px-6">
              <Plus className="w-4 h-4" /> Buat Laporan
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {userKeluhans.length > 0 ? (
             userKeluhans.map(k => (
               <div key={k.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                             k.priority === 'HIGH' ? "bg-red-100 text-red-700" :
                             k.priority === 'MEDIUM' ? "bg-amber-100 text-amber-700" :
                             "bg-blue-100 text-blue-700"
                           )}>
                              {k.priority} Priority
                           </span>
                           <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(k.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{k.deskripsi}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kamar {k.kamar_nomor} • {k.id}</p>
                        {k.attachment_url && (
                           <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Ada Lampiran Bukti
                           </div>
                        )}
                     </div>
                     <span className={cn(
                       "text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest",
                       k.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-700" :
                       k.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-700" :
                       "bg-slate-100 text-slate-500"
                     )}>
                        {k.status.replace('_', ' ')}
                     </span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                           {k.assigned_to[0]}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Petugas: {k.assigned_to}</span>
                     </div>
                     {k.resolved_at && (
                       <span className="text-[10px] text-emerald-600 font-bold">Responded</span>
                     )}
                  </div>
               </div>
             ))
           ) : (
             <div className="md:col-span-2 text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 italic text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Belum ada laporan keluhan.
             </div>
           )}
        </div>

        {/* Report Form Modal */}
        <Modal isOpen={showReportForm} onClose={() => setShowReportForm(false)} title="Buat Laporan Baru" size="md">
           <form onSubmit={handleSubmit} className="space-y-6 p-2">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Booking Terkait</label>
                 <select 
                   value={newComplaint.booking_id}
                   onChange={e => setNewComplaint({...newComplaint, booking_id: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                   required
                 >
                    <option value="">Pilih Unit Kamar</option>
                    {userBookings.map(b => (
                      <option key={b.id} value={b.id}>
                        Room {state.kamars.find(k => k.id === b.kamar_id)?.nomor} ({b.tgl_masuk})
                      </option>
                    ))}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prioritas</label>
                 <div className="grid grid-cols-3 gap-3">
                    {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewComplaint({...newComplaint, priority: p as ComplaintPriority})}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-bold transition-all border",
                          newComplaint.priority === p 
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detail Masalah</label>
                 <textarea 
                   rows={4}
                   value={newComplaint.deskripsi}
                   onChange={e => setNewComplaint({...newComplaint, deskripsi: e.target.value})}
                   placeholder="Jelaskan kendala Anda (misal: AC tidak dingin, air mampet, dsb...)"
                   className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                   required
                 />
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bukti Laporan (Opsional)</label>
                  
                  {/* Preview thumbnail sebelum/sesudah upload */}
                  {previewUrl && (
                    <div className="relative w-full">
                      <img 
                        src={previewUrl} 
                        alt="Preview lampiran" 
                        className="w-full max-h-40 object-contain rounded-2xl border border-emerald-100 bg-slate-50"
                        onError={() => setPreviewUrl(null)}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
                        title="Hapus file"
                      >
                        ×
                      </button>
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="ml-2 text-xs font-bold text-emerald-600">Mengupload...</span>
                        </div>
                      )}
                      {newComplaint.attachment_url && !isUploading && (
                        <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                          ✓ Tersimpan di server
                        </div>
                      )}
                    </div>
                  )}

                  {!previewUrl && (
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp,.pdf"
                      onChange={handleFileChange}
                      className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all cursor-pointer"
                    />
                  )}

                  {uploadError && (
                    <p className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{uploadError}</p>
                  )}
                  <p className="text-[10px] text-slate-400">Format: JPG, PNG, GIF, WEBP, PDF • Maks. 5MB</p>
               </div>

               <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowReportForm(false)}>Batal</Button>
                  <Button type="submit" className="flex-1" disabled={isUploading}>
                    {isUploading ? 'Mengupload...' : 'Kirim Laporan'}
                  </Button>
               </div>
           </form>
        </Modal>
      </div>
    );
};

const UserProfile = () => {
    const { state, dispatch } = useApp();
    const user = state.currentUser;
    
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showOTP, setShowOTP] = useState(false);
    const [otpValue, setOtpValue] = useState('');

    if (!user) return <div className="text-center py-20 text-slate-400">Silakan login untuk melihat profil.</div>;

    const handleVerifyEmail = () => {
        // Send OTP Simulation
        alert("OTP '1234' telah dikirimkan ke email Anda.");
        setShowOTP(true);
    };

    const submitOTP = (e: React.FormEvent) => {
        e.preventDefault();
        if (otpValue === '1234') {
            dispatch({ type: 'VERIFY_USER', payload: user.email });
            setShowOTP(false);
            setMessage({ type: 'success', text: 'Email berhasil diverifikasi!' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            alert('Kode OTP salah!');
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        // Simulate API call
        setTimeout(() => {
            dispatch({
                type: 'UPDATE_USER',
                payload: {
                    id: user.id,
                    data: { name, phone, address }
                }
            });
            setIsSaving(false);
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }, 800);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-20">
            <div className="space-y-2">
                <div className="label-upper">Pengaturan Profil</div>
                <h1 className="text-3xl font-normal leading-tight">Detail Pengguna</h1>
            </div>

            {!user.isVerified && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-amber-900">Email Belum Diverifikasi</h3>
                            <p className="text-xs text-amber-700 mt-1">Anda harus memverifikasi email untuk bisa memesan kamar dan menggunakan seluruh fitur NestIn.</p>
                        </div>
                    </div>
                    <Button onClick={handleVerifyEmail} className="bg-amber-500 hover:bg-amber-600 border-none shrink-0 text-white">Verifikasi Sekarang</Button>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 md:p-12 space-y-10">
                    {/* Header Profil */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-full text-3xl font-bold border-4 border-white shadow-xl shadow-emerald-100/50">
                            {name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded-full italic">
                                {user.role} Account
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium",
                                    message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                                )}
                            >
                                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                {message.text}
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <FormInput 
                                label="Nama Lengkap" 
                                placeholder="Masukkan nama Anda"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            
                            <FormInput 
                                label="Nomor Telepon / WhatsApp" 
                                placeholder="Contoh: 081234567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />

                            <FormInput 
                                label="Alamat Asal / KTP" 
                                type="textarea"
                                placeholder="Masukkan alamat lengkap Anda..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                className="w-full py-4 text-emerald-50 bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-100"
                                disabled={isSaving}
                            >
                                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="bg-slate-50 p-8 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Informasi Keamanan</h3>
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">Email Utama</p>
                                <p className="text-[11px] text-slate-500">{user.email}</p>
                            </div>
                        </div>
                        {user.isVerified ? (
                            <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-lg">Terverifikasi</span>
                        ) : (
                            <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded-lg">Belum Terverifikasi</span>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={showOTP} onClose={() => setShowOTP(false)} title="Verifikasi Email (OTP)" size="sm">
               <form onSubmit={submitOTP} className="space-y-6 text-center">
                  <p className="text-sm text-slate-500">Masukkan kode OTP 4-digit yang telah dikirim ke <b>{user.email}</b>. (Gunakan 1234 untuk demo)</p>
                  <input 
                     type="text" 
                     maxLength={4}
                     value={otpValue}
                     onChange={(e) => setOtpValue(e.target.value)}
                     className="w-full text-center text-3xl tracking-[1em] font-mono font-bold bg-slate-50 p-6 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                     required
                  />
                  <Button type="submit" className="w-full py-4">Verifikasi OTP</Button>
               </form>
            </Modal>
        </div>
    );
};
