import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, CheckCircle2, Copy, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, Kamar } from '../../types';
import { formatRupiah, cn, generateId } from '../../lib/utils';
import { Button, Modal } from './UI';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  kamar: Kamar;
  onPaymentClaimed: () => void;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  kamar,
  onPaymentClaimed
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate QR Data
  const checksum = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  const qrData = `00020101021226590014ID.CO.MIDTRANS0215${booking.id}0303UMI51440014ID.LINKAJA.WWW0215${booking.id}5204481253033605802ID5913NestIn Kosan6013Jakarta Pusat61051234062190715${booking.id}6304${checksum}`;

  // Timer logic
  useEffect(() => {
    if (!isOpen || isVerifying || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isVerifying, timeLeft]);

  // QR Code Generation
  useEffect(() => {
    if (isOpen && !isVerifying && qrRef.current) {
      qrRef.current.innerHTML = '';
      // @ts-ignore
      new QRCode(qrRef.current, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: 1 // QRCodes corretLevel M is usually 1
      });
    }
  }, [isOpen, isVerifying, qrData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 300) return 'text-emerald-500 bg-emerald-500';
    if (timeLeft > 180) return 'text-amber-500 bg-amber-500';
    return 'text-red-500 bg-red-500';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${booking.id} - ${booking.total}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onPaymentClaimed();
    }, 5000);
  };

  const nmid = `ID1026${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Pembayaran QRIS" 
      size="sm"
      closeOnOverlayClick={false}
    >
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!isVerifying ? (
            <motion.div
              key="qris-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-6"
            >
              {/* Summary Strip */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between gap-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Penyewa</p>
                    <p className="text-sm font-bold truncate max-w-[120px]">{booking.user_name}</p>
                 </div>
                 <div className="h-8 w-px bg-slate-200" />
                 <div className="space-y-1 flex-1 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Unit</p>
                    <p className="text-sm font-bold truncate">Kamar {kamar.nomor} — {kamar.tipe}</p>
                 </div>
              </div>

              {/* QR Code */}
              <div className="space-y-4 text-center">
                 <div className="relative inline-block">
                    <div 
                      ref={qrRef}
                      className="w-[200px] h-[200px] bg-white p-3 rounded-2xl border border-slate-200 mx-auto"
                    />
                    {timeLeft <= 0 && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-2xl">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                        <p className="text-xs font-bold text-slate-900 mb-3 text-center">Waktu Pembayaran Habis</p>
                        <Button variant="secondary" className="text-[10px] py-2 px-4 h-auto" onClick={() => setTimeLeft(600)}>
                          <RefreshCw className="w-3 h-3 mr-1" /> Buat QR Baru
                        </Button>
                      </div>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-medium">Scan dengan aplikasi e-wallet atau mobile banking apapun</p>
                    <p className="text-[10px] font-mono font-bold text-slate-300">NMID: {nmid}</p>
                 </div>
              </div>

              {/* Amount Box */}
              <div className="bg-emerald-50 rounded-2xl p-6 text-center space-y-1 border border-emerald-100/50">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600/60">Total Pembayaran</p>
                 <p className="text-3xl font-bold text-emerald-700 font-mono tracking-tighter">
                    {formatRupiah(booking.total)}
                 </p>
                 <p className="text-[10px] font-bold text-amber-600 animate-pulse">Bayar tepat sesuai nominal di atas</p>
              </div>

              {/* Countdown */}
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>Selesaikan dalam:</span>
                    <span className={cn("font-mono text-base", getTimerColor().split(' ')[0])}>{formatTime(timeLeft)}</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={cn("h-full transition-all duration-1000", getTimerColor().split(' ')[1])}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / 600) * 100}%` }}
                    />
                 </div>
              </div>

              {/* Logos Row */}
              <div className="flex flex-wrap justify-center gap-2">
                 {['GoPay', 'OVO', 'Dana', 'ShopeePay', 'BCA Mobile', 'Mandiri'].map(l => (
                   <span key={l} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{l}</span>
                 ))}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                 <Button 
                   className="w-full py-4 text-base rounded-[1.25rem] shadow-lg shadow-emerald-100" 
                   onClick={handleClaim}
                   disabled={timeLeft <= 0}
                 >
                   <CheckCircle2 className="w-5 h-5 mr-2" /> Saya Sudah Bayar
                 </Button>
                 
                 <div className="relative">
                   <Button 
                     variant="secondary" 
                     className="w-full py-4 text-base rounded-[1.25rem]"
                     onClick={handleCopy}
                   >
                     <Copy className="w-4 h-4 mr-2" /> {copied ? 'Tersalin!' : 'Salin Detail Pemesanan'}
                   </Button>
                   {copied && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl animate-fade-in-up">
                        Tersalin!
                     </div>
                   )}
                 </div>

                 <button 
                   className="w-full text-xs font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                   onClick={() => {
                     if(window.confirm('Yakin batalkan? Booking Anda akan kembali ke status Menunggu Pembayaran')) {
                       onClose();
                     }
                   }}
                 >
                    Batalkan Pembayaran
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="waiting-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center space-y-8"
            >
              {/* Pulse Animation */}
              <div className="relative">
                <style>{`
                  @keyframes pulse-emerald { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } }
                  .animate-pulse-emerald { animation: pulse-emerald 2s ease-in-out infinite; }
                `}</style>
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-pulse-emerald">
                   <Clock className="w-12 h-12 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900">Pembayaran Diverifikasi</h3>
                <p className="text-sm text-slate-500 px-4 leading-relaxed">
                  Tim kami sedang memverifikasi pembayaran Anda. Proses ini biasanya memakan waktu <span className="font-bold text-slate-900">1-5 menit</span>.
                </p>
              </div>

              {/* Booking ID Card */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                 <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Booking</p>
                    <p className="font-mono font-bold text-slate-800">{booking.id}</p>
                 </div>
                 <button onClick={handleCopy} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
                    <Copy className="w-4 h-4" />
                 </button>
              </div>

              {/* Mini Stepper */}
              <div className="text-left space-y-4 px-4">
                 {[
                   { label: 'QR Code berhasil di-scan', status: 'completed' },
                   { label: 'Menunggu verifikasi admin', status: 'active' },
                   { label: 'Pembayaran dikonfirmasi', status: 'pending' },
                   { label: 'Status kamar diperbarui', status: 'pending' },
                 ].map((s, idx) => (
                   <div key={idx} className="flex gap-4 items-center">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        s.status === 'completed' ? "bg-emerald-500 text-white" : s.status === 'active' ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-white border border-slate-200 text-slate-300"
                      )}>
                        {s.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : s.status === 'active' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <p className={cn(
                        "text-xs font-bold",
                        s.status === 'completed' ? "text-emerald-600" : s.status === 'active' ? "text-amber-600" : "text-slate-400"
                      )}>{s.label}</p>
                   </div>
                 ))}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-left">
                 <Info className="w-5 h-5 text-blue-600 shrink-0" />
                 <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                    Anda akan mendapat notifikasi begitu pembayaran dikonfirmasi oleh admin. Halaman ini akan otomatis terupdate.
                 </p>
              </div>

              <div className="pt-4">
                 <Button variant="ghost" className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 py-4" onClick={onClose}>
                    Tutup — Saya akan menunggu notifikasi
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
