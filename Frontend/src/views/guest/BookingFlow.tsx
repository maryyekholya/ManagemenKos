import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Bed, Calendar, Phone, Mail, User, CheckCircle2, QrCode, CreditCard, Wallet } from 'lucide-react';
import { Kamar, PricingStrategyType, PaymentMethod, Booking } from '../../types';
import { generateId, formatRupiah, cn } from '../../lib/utils';
import { PricingStrategy } from '../../lib/patterns';
import { Button, FormInput } from '../../components/shared/UI';
import { QRPaymentModal } from '../../components/shared/QRPaymentModal';
import { addMonths, format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../App';

interface BookingFlowProps {
  kamar: Kamar;
  strategy: PricingStrategyType;
  onComplete: (booking: Booking) => void;
  onCancel: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ kamar, strategy, onComplete, onCancel }) => {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    name: state.currentUser?.name || '',
    email: state.currentUser?.email || '',
    phone: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: 6,
    catatan: '',
    paymentMethod: 'Transfer' as PaymentMethod
  });

  const finalPrice = kamar.harga_aktif || kamar.harga_dasar;
  const totalAmount = finalPrice * formData.duration;
  const totalOverall = finalPrice * formData.duration;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAutofill = () => {
    if (state.currentUser) {
      setFormData({
        ...formData,
        name: state.currentUser.name,
        email: state.currentUser.email,
        phone: state.currentUser.phone || ''
      });
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // 1. Create Booking (API)
      const resCreate = await fetch('http://127.0.0.1:8000/api/v1/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${state.currentUser?.token || ''}`
        },
        body: JSON.stringify({
          kamar_id: kamar.id,
          durasi_bulan: formData.duration,
        })
      });
      
      let dbBookingId = generateId('BK');
      if (resCreate.ok) {
        const createData = await resCreate.json();
        dbBookingId = createData.data.id.toString();
      } else {
        console.warn('Backend create booking failed, fallback to local', await resCreate.text());
      }

      // 2. Proceed Booking (API)
      const resProceed = await fetch(`http://127.0.0.1:8000/api/v1/bookings/${dbBookingId}/proceed`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${state.currentUser?.token || ''}`
        }
      });
      if (!resProceed.ok) console.warn('Backend proceed booking failed');

      const newBooking: Booking = {
        id: dbBookingId,
        kamar_id: kamar.id,
        user_id: state.currentUser?.id || generateId('USR'),
        user_name: formData.name,
        user_phone: formData.phone,
        tgl_masuk: formData.startDate,
        tgl_keluar: format(addMonths(new Date(formData.startDate), formData.duration), 'yyyy-MM-dd'),
        durasi_bulan: formData.duration,
        status: 'MENUNGGU_PEMBAYARAN',
        total: totalOverall,
        metode_bayar: formData.paymentMethod,
        created_at: new Date().toISOString(),
        catatan: formData.catatan,
        stateHistory: [{
          state: 'MENUNGGU_PEMBAYARAN',
          timestamp: new Date().toISOString(),
          actor: formData.name,
          note: 'Pemesanan baru dibuat via API'
        }]
      };

      if (formData.paymentMethod === 'QRIS') {
        setCurrentBooking(newBooking);
        setShowQR(true);
        setIsProcessing(false);
        return;
      }

      // 3. Pay Booking (API) untuk Cash / Transfer
      let backendStatus = 'MENUNGGU_PEMBAYARAN';
      const paymentPayload = formData.paymentMethod === 'Cash' ? 'TRANSFER' : 'TRANSFER'; // Use TRANSFER as fallback for Cash
      const resPay = await fetch(`http://127.0.0.1:8000/api/v1/bookings/${dbBookingId}/pay`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${state.currentUser?.token || ''}`
        },
        body: JSON.stringify({
          metode_pembayaran: formData.paymentMethod === 'Cash' ? 'TRANSFER' : formData.paymentMethod.toUpperCase().replace(' ', '_')
        })
      });
      if (resPay.ok) {
        const payData = await resPay.json();
        // Since we modified backend to auto approve, status might be DIHUNI
        backendStatus = payData.data.status;
      } else {
        console.warn('Backend pay booking failed', await resPay.text());
      }

      const updatedBooking = { ...newBooking, status: backendStatus as any, paymentClaimTimestamp: new Date().toISOString() };
      dispatch({ type: 'ADD_BOOKING', payload: updatedBooking });
      dispatch({ type: 'UPDATE_KAMAR', payload: { id: kamar.id, data: { status: backendStatus === 'DIHUNI' ? 'DIHUNI' : 'DIPESAN' } } });
      
      setPaymentResult({
         order_id: dbBookingId,
         payment_type: formData.paymentMethod,
         transaction_status: 'pending',
         gross_amount: totalAmount
      });
      setStep(4);
      
    } catch (err) {
      console.error('API Error during booking', err);
      alert('Terjadi kesalahan koneksi saat memesan kamar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRClaimed = async () => {
    if (!currentBooking) return;

    let backendStatus = 'MENUNGGU_PEMBAYARAN';
    try {
      const resPay = await fetch(`http://127.0.0.1:8000/api/v1/bookings/${currentBooking.id}/pay`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${state.currentUser?.token || ''}`
        },
        body: JSON.stringify({
          metode_pembayaran: 'QRIS'
        })
      });
      if (resPay.ok) {
        const payData = await resPay.json();
        backendStatus = payData.data.status;
      }
    } catch (err) {
      console.error('API Error during QRIS claim', err);
    }

    const updatedBooking = {
      ...currentBooking,
      status: backendStatus as any,
      paymentClaimTimestamp: new Date().toISOString()
    };

    dispatch({ type: 'ADD_BOOKING', payload: updatedBooking });
    dispatch({ type: 'UPDATE_KAMAR', payload: { id: kamar.id, data: { status: backendStatus === 'DIHUNI' ? 'DIHUNI' : 'DIPESAN' } } });
    
    // Close modal and flow
    setShowQR(false);
    onComplete(updatedBooking);
  };

  const steps = ['Data Diri', 'Pembayaran', 'Konfirmasi', 'Selesai'];

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {state.currentUser && !state.currentUser.isVerified && (
           <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-amber-900">Verifikasi Email Diperlukan</h3>
                    <p className="text-sm text-amber-700">Anda harus memverifikasi email terlebih dahulu di Profil untuk dapat memesan kamar.</p>
                 </div>
              </div>
           </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
           <button onClick={onCancel} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
             <ChevronLeft className="w-4 h-4" /> Batal Booking
           </button>
           <h2 className="text-2xl font-serif">Pemesanan Kamar {kamar.nomor}</h2>
           <div className="w-20" />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between px-12 relative">
          <div className="absolute top-5 left-20 right-20 h-0.5 bg-slate-200 -z-10" />
          {steps.map((s, idx) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4 border-slate-50",
                step > idx + 1 ? "bg-emerald-600 text-white" : step === idx + 1 ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600" : "bg-slate-200 text-slate-400"
              )}>
                {step > idx + 1 ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={cn("text-[10px] uppercase font-bold tracking-widest", step === idx + 1 ? "text-emerald-600" : "text-slate-400")}>{s}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Lengkapi Data Diri</h3>
                    {state.currentUser && (
                      <button 
                        onClick={handleAutofill}
                        className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <User className="w-3 h-3" /> Gunakan Data Profil
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <FormInput label="Nama Lengkap" placeholder="Masukkan nama sesuai KTP" icon={<User className="w-5 h-5" />} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormInput label="Email" type="email" placeholder="email@gmail.com" icon={<Mail className="w-5 h-5" />} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                       <FormInput label="No. Telepon" placeholder="Contoh: 081234567890" icon={<Phone className="w-5 h-5" />} value={formData.phone} onChange={e => {
                          const val = e.target.value.replace(/[^0-9+]/g, '');
                          setFormData({...formData, phone: val});
                       }} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormInput label="Tanggal Masuk" type="date" icon={<Calendar className="w-5 h-5" />} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                       <div className="space-y-2 w-full">
                         <label className="label-upper block ml-1">Durasi Sewa</label>
                         <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             <Calendar className="w-5 h-5" />
                           </div>
                           <input 
                             type="number"
                             min="1"
                             className="w-full pl-11 pr-16 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                             value={formData.duration}
                             onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                             Bulan
                           </div>
                         </div>
                       </div>
                    </div>
                    <FormInput label="Catatan Khusus (Opsional)" type="textarea" placeholder="Contoh: Butuh meja belajar tambahan..." value={formData.catatan} onChange={e => setFormData({...formData, catatan: e.target.value})} />
                  </div>
                  <Button 
                    className="w-full py-4 text-lg mt-4" 
                    onClick={() => {
                       if (!formData.name || !formData.email || !formData.phone || !formData.startDate || !formData.duration) {
                          alert('Mohon isi semua data diri yang wajib diisi!');
                          return;
                       }
                       const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
                       if (!phoneRegex.test(formData.phone)) {
                          alert('Format nomor telepon tidak valid. Gunakan format Indonesia (contoh: 0812... atau +62812...)');
                          return;
                       }
                       if (state.currentUser && !state.currentUser.isVerified) {
                          alert('Harap verifikasi email Anda terlebih dahulu.');
                          return;
                       }
                       handleNext();
                    }}
                  >
                     Lanjutkan ke Pembayaran <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6"
                >
                  <h3 className="text-xl font-bold">Pilih Metode Pembayaran</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'Transfer', label: 'Transfer Bank (BCA/Mandiri)', desc: 'Lakukan transfer manual ke Virtual Account.', icon: CreditCard },
                      { id: 'QRIS', label: 'QRIS / E-Wallet', desc: 'Scan QR untuk bayar via Dana, Gopay, OVO.', icon: QrCode },
                      { id: 'Cash', label: 'Tunai di Kantor', desc: 'Bayar langsung ke pengelola kos.', icon: Wallet },
                    ].map(p => (
                      <button 
                         key={p.id}
                         onClick={() => setFormData({...formData, paymentMethod: p.id as PaymentMethod})}
                         className={cn(
                           "flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left",
                           formData.paymentMethod === p.id ? "border-emerald-600 bg-emerald-50" : "border-slate-100 hover:border-slate-200"
                         )}
                      >
                         <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", formData.paymentMethod === p.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500")}>
                            <p.icon className="w-6 h-6" />
                         </div>
                         <div className="flex-1">
                            <p className="font-bold text-slate-900">{p.label}</p>
                            <p className="text-sm text-slate-500">{p.desc}</p>
                         </div>
                         <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", formData.paymentMethod === p.id ? "border-emerald-600" : "border-slate-300")}>
                             {formData.paymentMethod === p.id && <div className="w-3 h-3 bg-emerald-600 rounded-full" />}
                         </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <Button variant="secondary" className="flex-1 py-4" onClick={handleBack}>Kembali</Button>
                    <Button className="flex-[2] py-4" onClick={handleNext}>Lanjutkan ke Konfirmasi</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8"
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                       <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Ringkasan Pemesanan</h3>
                      <p className="text-slate-500">Periksa kembali data Anda sebelum konfirmasi</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Penyewa</span>
                        <span className="font-bold">{formData.name}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tgl Masuk</span>
                        <span className="font-bold">{formData.startDate}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Durasi</span>
                        <span className="font-bold">{formData.duration} Bulan</span>
                     </div>
                     <div className="h-px bg-slate-200" />
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Pembayaran</span>
                        <span className="text-xl font-bold text-emerald-600 font-mono">{formatRupiah(totalAmount)}</span>
                     </div>
                     <p className="text-[10px] text-slate-400 text-right italic font-medium">*Total tagihan {formData.duration} bulan masa sewa</p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex gap-3">
                     <CheckCircle2 className="w-5 h-5 text-yellow-600 shrink-0" />
                     <p className="text-xs text-yellow-800 leading-relaxed">
                        Dengan menekan tombol konfirmasi, Anda setuju dengan Syarat & Ketentuan pengelolaan kos NestIn.
                     </p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="secondary" className="flex-1 py-4" onClick={handleBack} disabled={isProcessing}>Kembali</Button>
                    <Button className="flex-[2] py-4" onClick={handleSubmit} isLoading={isProcessing}>Konfirmasi & Pesan</Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-emerald-100 text-center space-y-8"
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 animate-bounce">
                       <CheckCircle2 className="w-12 h-12" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-slate-900">Pembayaran Berhasil!</h3>
                    <p className="text-slate-500">Terima kasih, pesanan Anda telah kami terima.</p>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-8 space-y-4 text-left max-w-sm mx-auto">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Order ID</span>
                       <span className="font-mono font-bold">{paymentResult?.order_id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Metode</span>
                       <span className="font-bold">{paymentResult?.payment_type?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Status</span>
                       <span className="text-emerald-600 font-bold">SUCCESS</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Bayar</span>
                       <span className="font-bold text-lg font-mono">{formatRupiah(Number(paymentResult?.gross_amount))}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full py-4 text-lg shadow-xl shadow-emerald-100" 
                      onClick={async () => {
                        let finalStatus = paymentResult.transaction_status === 'settlement' || paymentResult.transaction_status === 'capture' ? 'DIKONFIRMASI' : 'MENUNGGU_PEMBAYARAN';
                        let finalId = paymentResult.order_id;
                        
                        if (state.currentUser?.token) {
                          try {
                            const res = await fetch('http://127.0.0.1:8000/api/v1/bookings', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${state.currentUser.token}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                              },
                              body: JSON.stringify({
                                kamar_id: kamar.id,
                                durasi_bulan: formData.duration
                              })
                            });
                            const json = await res.json();
                            if (json.success && json.data) {
                              finalId = json.data.id;
                              
                              // Proceed
                              await fetch(`http://127.0.0.1:8000/api/v1/bookings/${finalId}/proceed`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${state.currentUser.token}`, 'Accept': 'application/json' }
                              });

                              // If Paid
                              if (finalStatus === 'DIKONFIRMASI') {
                                await fetch(`http://127.0.0.1:8000/api/v1/bookings/${finalId}/pay`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${state.currentUser.token}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    metode_bayar: formData.paymentMethod
                                  })
                                });
                              }
                            }
                          } catch (e) {
                            console.error('Failed to save booking to backend', e);
                          }
                        }

                        const booking: Booking = {
                          id: finalId,
                          kamar_id: kamar.id,
                          user_id: state.currentUser?.id || generateId('USR'),
                          user_name: formData.name,
                          user_phone: formData.phone,
                          tgl_masuk: formData.startDate,
                          tgl_keluar: format(addMonths(new Date(formData.startDate), formData.duration), 'yyyy-MM-dd'),
                          durasi_bulan: formData.duration,
                          status: finalStatus as any,
                          total: totalOverall,
                          metode_bayar: formData.paymentMethod,
                          created_at: new Date().toISOString(),
                          catatan: formData.catatan
                        };
                        onComplete(booking);
                      }}
                    >
                      Buka Dashboard Saya
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar / Room Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
              <img src={kamar.foto_url} className="w-full h-32 object-cover rounded-2xl" referrerPolicy="no-referrer" />
              <div>
                 <h4 className="font-bold text-lg">Kamar {kamar.nomor}</h4>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{kamar.tipe}</p>
              </div>
              <div className="space-y-2">
                 {kamar.fasilitas.slice(0, 3).map(f => (
                   <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {f}
                   </div>
                 ))}
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga</p>
                    <p className="font-bold text-emerald-600 font-mono">{formatRupiah(finalPrice)}</p>
                 </div>
                 <p className="text-[10px] text-slate-300 font-medium">/ bulan</p>
              </div>
            </div>

            <div className="bg-emerald-600 p-6 rounded-[2rem] text-white space-y-2">
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Kenapa NestIn?</p>
               <h4 className="font-bold">Keamanan Terjamin</h4>
               <p className="text-xs opacity-70 leading-relaxed">Seluruh proses booking dan pembayaran terenkripsi dan diawasi oleh tim admin profesional.</p>
            </div>
          </div>
        </div>
      </div>

      {currentBooking && (
        <QRPaymentModal 
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          booking={currentBooking}
          kamar={kamar}
          onPaymentClaimed={handleQRClaimed}
        />
      )}
    </div>
  );
};
