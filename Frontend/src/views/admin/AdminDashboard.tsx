import React, { useState } from 'react';
import { 
  BarChart3, Bed, ClipboardList, CreditCard, PieChart, Users, Settings, 
  Plus, Edit2, Trash2, Eye, Check, X, Filter, Search, Download, MessageSquare
} from 'lucide-react';
import { useApp } from '../../App';
import { Kamar, Booking, Payment, Keluhan, RoomStatus, User } from '../../types';
import { BookingMachine, PricingStrategy } from '../../lib/patterns';
import { formatRupiah, cn } from '../../lib/utils';
import { StatusBadge, Button, Modal, FormInput } from '../../components/shared/UI';
import { KamarCard } from '../../components/shared/KamarCard';
import { ChatWidget } from '../../components/shared/ChatWidget';
import { chatService } from '../../services/chatService';
import { motion } from 'motion/react';

export const AdminDashboard: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'kamar', label: 'Manajemen Kamar', icon: Bed },
    { id: 'booking', label: 'Booking & Tenant', icon: ClipboardList },
    { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
    { id: 'chat', label: 'Chat Tenant', icon: MessageSquare },
    { id: 'laporan', label: 'Laporan Keuangan', icon: PieChart },
    { id: 'keluhan', label: 'Keluhan', icon: ClipboardList },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'kamar': return <AdminKamar />;
      case 'booking': return <AdminBooking />;
      case 'pembayaran': return <AdminPembayaran />;
      case 'chat': return <AdminChat selectedUser={selectedChatUser} setSelectedUser={setSelectedChatUser} />;
      case 'laporan': return <AdminLaporan />;
      case 'pengaturan': return <AdminSettings />;
      case 'overview': 
      default: return <Overview stats={calculateStats(state)} />;
    }
  };

  return (
    <div className="flex pt-20 h-screen overflow-hidden bg-slate-50 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-right border-slate-100 flex flex-col p-6">
        <div className="space-y-1 flex-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all rounded-[4px]",
                activeTab === item.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-12">
        {renderTab()}
      </main>
      <ChatWidget 
        roomId={selectedChatUser?.id} 
        targetName={selectedChatUser?.name} 
      />
    </div>
  );
};

// ═══════════════════════════════
// SUB-PAGE: OVERVIEW
// ═══════════════════════════════

const Overview: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
         <div className="space-y-2">
            <div className="label-upper">Admin Control</div>
            <h1 className="text-3xl font-normal leading-tight">Operational Overview</h1>
         </div>
         <Button variant="secondary">Download Summary</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Inventory', value: stats.total, icon: Bed },
          { label: 'Occupancy', value: stats.filled, icon: Check },
          { label: 'Monthly Revenue', value: formatRupiah(stats.revenue), icon: CreditCard },
          { label: 'Pending Requests', value: stats.complaints, icon: ClipboardList },
        ].map(s => (
          <div key={s.label} className="bg-white p-8 border border-slate-200 flex flex-col gap-4">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
               <s.icon className="w-5 h-5" />
            </div>
            <div>
               <p className="label-upper text-[10px] mb-1">{s.label}</p>
               <p className="text-2xl font-medium text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold mb-6">Tingkat Hunian</h3>
           <div className="h-64 flex items-end justify-between gap-4">
              {[60, 80, 75, 90, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                   <div className="w-full bg-emerald-100 rounded-lg relative overflow-hidden" style={{ height: `${h}%` }}>
                      <div className="absolute inset-0 bg-emerald-600 opacity-60" />
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">Bln {i+1}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold mb-6">Booking Baru Menunggu</h3>
           <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold">BK</div>
                      <div>
                         <p className="text-sm font-bold">Tenant Name {i}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Kamar 10{i}</p>
                      </div>
                   </div>
                   <Button className="py-2 text-xs">Detail</Button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════
// SUB-PAGE: MANAJEMEN KAMAR
// ═══════════════════════════════

const AdminKamar = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKamar, setEditingKamar] = useState<Kamar | null>(null);

  const handleEdit = (k: Kamar) => {
    setEditingKamar(k);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">Manajemen Kamar</h1>
        <Button onClick={() => { setEditingKamar(null); setIsModalOpen(true); }}>
           <Plus className="w-5 h-5" /> Tambah Kamar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {state.kamars.map(k => (
          <KamarCard 
            key={k.id} 
            kamar={k} 
            strategy={state.activeStrategy} 
            adminActions={
              <div className="flex gap-2">
                <button onClick={() => handleEdit(k)} className="p-3 bg-white text-emerald-600 rounded-full hover:bg-emerald-50"><Edit2 className="w-5 h-5" /></button>
                <button className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
              </div>
            }
          />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingKamar ? "Edit Kamar" : "Tambah Kamar"} size="lg">
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <FormInput label="Nomor Kamar" placeholder="101" defaultValue={editingKamar?.nomor} />
               <FormInput label="Lantai" type="number" defaultValue={editingKamar?.lantai} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormInput label="Tipe Kamar" value={editingKamar?.tipe || 'Standard'} readOnly />
               <FormInput label="Harga Dasar" type="number" defaultValue={editingKamar?.harga_dasar} />
            </div>
            <FormInput label="Short Deskripsi" type="textarea" defaultValue={editingKamar?.deskripsi} placeholder="Ringkasan singkat untuk status..." />
            <FormInput label="Deskripsi Lengkap" type="textarea" defaultValue={editingKamar?.description} placeholder="Penjelasan mendalam tentang kamar, suasana, dan keunggulan..." />
            <Button className="w-full py-4 text-emerald-50 bg-emerald-600 hover:bg-emerald-700">{editingKamar ? "Simpan Perubahan" : "Tambah Kamar"}</Button>
         </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════
// SUB-PAGE: BOOKING
// ═══════════════════════════════

const AdminBooking = () => {
  const { state, dispatch } = useApp();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const handleAction = (booking: Booking, status: RoomStatus, note?: string) => {
    dispatch({ 
      type: 'UPDATE_BOOKING', 
      payload: { 
        id: booking.id, 
        data: { 
          status,
          rejectionNote: note,
          stateHistory: [
            ...(booking.stateHistory || []),
            {
              state: status,
              timestamp: new Date().toISOString(),
              actor: state.currentUser?.name || 'Admin',
              note: note || (status === 'DIKONFIRMASI' ? 'Pembayaran dikonfirmasi oleh admin' : 'Pembayaran ditolak oleh admin')
            }
          ]
        } 
      } 
    });
    
    // Only update kamar if confirmed
    if (status === 'DIKONFIRMASI') {
      dispatch({ type: 'UPDATE_KAMAR', payload: { id: booking.kamar_id, data: { status: 'DIKONFIRMASI' } } });
      
      // User notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `N-USER-${Date.now()}`,
          type: 'PAYMENT_CONFIRMED',
          recipient: booking.user_id,
          title: 'Pembayaran Dikonfirmasi!',
          message: `Selamat! Pembayaran untuk Kamar ${state.kamars.find(k => k.id === booking.kamar_id)?.nomor} telah diverifikasi.`,
          priority: 'MEDIUM',
          created_at: new Date().toISOString(),
          read: false,
          booking_id: booking.id
        }
      });
    } else if (status === 'DIHUNI') {
       dispatch({ type: 'UPDATE_KAMAR', payload: { id: booking.kamar_id, data: { status: 'DIHUNI' } } });
       dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `N-USER-${Date.now()}`,
          type: 'CHECK_IN_SUCCESS',
          recipient: booking.user_id,
          title: 'Selamat Datang!',
          message: `Check-in berhasil. Selamat menempati Kamar ${state.kamars.find(k => k.id === booking.kamar_id)?.nomor}.`,
          priority: 'LOW',
          created_at: new Date().toISOString(),
          read: false,
          booking_id: booking.id
        }
      });
    } else if (status === 'SELESAI') {
       dispatch({ type: 'UPDATE_KAMAR', payload: { id: booking.kamar_id, data: { status: 'TERSEDIA' } } });
       dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `N-USER-${Date.now()}`,
          type: 'STAY_COMPLETED',
          recipient: booking.user_id,
          title: 'Sewa Selesai',
          message: `Terima kasih telah bersama NestIn. Kamar ${state.kamars.find(k => k.id === booking.kamar_id)?.nomor} kini telah dikosongkan.`,
          priority: 'LOW',
          created_at: new Date().toISOString(),
          read: false,
          booking_id: booking.id
        }
      });
    } else if (status === 'MENUNGGU_PEMBAYARAN') {
       // Rejection notification
       dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `N-USER-${Date.now()}`,
          type: 'PAYMENT_REJECTED',
          recipient: booking.user_id,
          title: 'Pembayaran Ditolak',
          message: `Maaf, pembayaran Anda tidak dapat diverifikasi. Alasan: ${note}`,
          priority: 'HIGH',
          created_at: new Date().toISOString(),
          read: false,
          booking_id: booking.id
        }
      });
    }

    setShowConfirmModal(false);
    setShowRejectModal(false);
    setSelectedBooking(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-8">
       <h1 className="text-3xl font-serif">Booking & Tenant</h1>
       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-bottom border-slate-100">
                <tr>
                   <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenant</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metode</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {state.bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-6 py-4 font-mono text-xs">{b.id}</td>
                     <td className="px-6 py-4">
                        <p className="font-bold">{b.user_name}</p>
                        <p className="text-[10px] text-slate-400">Unit: Kamar {state.kamars.find(k => k.id === b.kamar_id)?.nomor}</p>
                     </td>
                     <td className="px-6 py-4">
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg">{b.metode_bayar}</span>
                     </td>
                     <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                     <td className="px-6 py-4 flex gap-2">
                        {b.status === 'MENUNGGU_PEMBAYARAN' && b.metode_bayar === 'QRIS' && (
                           <div className="flex gap-2">
                              <Button 
                                onClick={() => { setSelectedBooking(b); setShowConfirmModal(true); }} 
                                className="h-8 px-3 text-[10px] bg-emerald-600"
                              >
                                Verifikasi
                              </Button>
                              <Button 
                                variant="secondary"
                                onClick={() => { setSelectedBooking(b); setShowRejectModal(true); }} 
                                className="h-8 px-3 text-[10px] text-red-600 border-red-100 hover:bg-red-50"
                              >
                                Tolak
                              </Button>
                           </div>
                        )}
                        {b.status === 'DIKONFIRMASI' && (
                           <Button 
                             onClick={() => handleAction(b, 'DIHUNI')} 
                             className="h-8 px-3 text-[10px] bg-blue-600"
                           >
                             Check-in
                           </Button>
                        )}
                        {b.status === 'DIHUNI' && (
                           <Button 
                             onClick={() => handleAction(b, 'SELESAI')} 
                             className="h-8 px-3 text-[10px] bg-slate-400"
                           >
                             Selesai
                           </Button>
                        )}
                        <Button variant="secondary" className="h-8 px-3 text-[10px]"><Eye className="w-3 h-3" /></Button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Confirm Modal */}
       <Modal 
         isOpen={showConfirmModal} 
         onClose={() => setShowConfirmModal(false)} 
         title="Konfirmasi Pembayaran"
         size="sm"
       >
         <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
               <Check className="w-10 h-10" />
            </div>
            <div className="space-y-2">
               <h4 className="text-xl font-bold italic">Konfirmasi Pembayaran?</h4>
               <p className="text-sm text-slate-500">Anda telah memvalidasi bahwa dana telah masuk ke rekening / e-wallet kos.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-left">
               <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Tenant</span>
                  <span className="font-bold">{selectedBooking?.user_name}</span>
               </div>
               <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Nominal</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(selectedBooking?.total || 0)}</span>
               </div>
            </div>

            <div className="flex gap-4">
               <Button variant="secondary" className="flex-1" onClick={() => setShowConfirmModal(false)}>Batal</Button>
               <Button className="flex-1 bg-emerald-600 shadow-lg shadow-emerald-100" onClick={() => selectedBooking && handleAction(selectedBooking, 'DIKONFIRMASI')}>Konfirmasi</Button>
            </div>
         </div>
       </Modal>

       {/* Reject Modal */}
       <Modal 
         isOpen={showRejectModal} 
         onClose={() => setShowRejectModal(false)} 
         title="Tolak Pembayaran"
         size="sm"
       >
         <div className="p-8 space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
               <X className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
               <h4 className="text-xl font-bold">Tolak Pembayaran?</h4>
               <p className="text-xs text-slate-500">Berikan alasan agar penyewa dapat melakukan submit ulang atau memperbaiki kendala.</p>
            </div>

            <FormInput 
              label="Alasan Penolakan" 
              type="textarea" 
              placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai" 
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />

            <div className="flex gap-4">
               <Button variant="secondary" className="flex-1" onClick={() => setShowRejectModal(false)}>Kembali</Button>
               <Button 
                variant="danger" 
                className="flex-1" 
                disabled={!rejectionReason}
                onClick={() => selectedBooking && handleAction(selectedBooking, 'MENUNGGU_PEMBAYARAN', rejectionReason)}
               >
                 Tolak Pembayaran
               </Button>
            </div>
         </div>
       </Modal>
    </div>
  );
};

// ═══════════════════════════════
// SUB-PAGE: PEMBAYARAN
// ═══════════════════════════════

const AdminPembayaran = () => {
    const { state, dispatch } = useApp();
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif">Riwayat Pembayaran</h1>
            <div className="grid grid-cols-1 gap-4">
                {state.payments.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">Rp</div>
                            <div>
                                <p className="font-bold text-lg">{formatRupiah(p.jumlah)}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{p.metode} • {p.tanggal}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Midtrans ID</p>
                                <p className="text-xs font-mono">{p.midtrans_id || 'MANUAL'}</p>
                            </div>
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">SUCCESS</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminLaporan = () => {
    const { state } = useApp();
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif">Laporan Keuangan</h1>
                <Button variant="secondary" className="gap-2">
                    <Download className="w-4 h-4" /> Ekspor CSV
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Pendapatan', value: formatRupiah(state.payments.reduce((a: any, p: any) => a + p.jumlah, 0)) },
                    { label: 'Tingkat Hunian', value: `${Math.round((state.kamars.filter((k: any) => k.status === 'DIHUNI').length / state.kamars.length) * 100)}%` },
                    { label: 'Booking Baru', value: '12' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-8 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <p className="text-2xl font-bold font-mono">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-bottom border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulan</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendapatan</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {['Januari', 'Februari', 'Maret'].map(m => (
                            <tr key={m}>
                                <td className="px-6 py-4 font-bold">{m} 2025</td>
                                <td className="px-6 py-4 font-mono text-emerald-600 font-bold">{formatRupiah(12500000 + Math.random() * 5000000)}</td>
                                <td className="px-6 py-4">{Math.floor(Math.random() * 10) + 5}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const { state, dispatch } = useApp();
    return (
        <div className="space-y-8 max-w-4xl">
            <h1 className="text-3xl font-serif">Pengaturan Sistem</h1>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormInput label="Nama Kos" defaultValue={state.config.nama_kos} onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { nama_kos: e.target.value } })} />
                    <FormInput label="Email Kontak" defaultValue={state.config.email} onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { email: e.target.value } })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormInput label="Timeout Booking (Menit)" type="number" defaultValue={state.config.max_booking_timeout} onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { max_booking_timeout: Number(e.target.value) } })} />
                    <FormInput label="Timeout Pembayaran (Jam)" type="number" defaultValue={state.config.payment_timeout} onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { payment_timeout: Number(e.target.value) } })} />
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl">
                   <h4 className="text-sm font-bold mb-4">Integrasi Pembayaran (Midtrans)</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput label="Merchant ID" placeholder="G12345678" />
                      <FormInput label="Client Key" type="password" placeholder="••••••••" />
                   </div>
                </div>
                <Button className="w-full py-4">Simpan Konfigurasi</Button>
            </div>
        </div>
    );
};

const AdminChat: React.FC<{ 
  selectedUser: User | null; 
  setSelectedUser: (u: User | null) => void 
}> = ({ selectedUser, setSelectedUser }) => {
  const { state } = useApp();

  // For simplicity, we show all users who have bookings as potential chat targets
  const potentialChatUsers = state.users.filter(u => 
    u.role === 'user' && 
    state.bookings.some(b => b.user_id === u.id)
  );

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-serif">Chat Tenant</h1>
             <p className="text-sm text-slate-400 mt-1">Komunikasi real-time dengan penghuni kos.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Cari tenant..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                   />
                </div>
             </div>
             <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {potentialChatUsers.map(user => (
                   <button 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      "w-full p-6 flex items-center gap-4 transition-all hover:bg-slate-50/80 text-left",
                      selectedUser?.id === user.id ? "bg-emerald-50 border-l-4 border-emerald-600" : ""
                    )}
                   >
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                         {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <h5 className="font-bold text-sm">{user.name}</h5>
                            <span className="text-[9px] text-slate-400">12:30</span>
                         </div>
                         <p className="text-[11px] text-slate-500 line-clamp-1">Klik untuk membuka obrolan...</p>
                      </div>
                   </button>
                ))}
             </div>
          </div>

          {/* Chat Window Container */}
          <div className="lg:col-span-2 min-h-[600px] relative">
             {selectedUser ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                   <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-serif">Obrolan dengan {selectedUser.name}</h3>
                   <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Gunakan Widget Chat di pojok kanan bawah untuk membalas pesan dari tenant ini.
                   </p>
                   <div className="pt-6">
                      <Button variant="secondary" onClick={() => setSelectedUser(null)}>Pilih Tenant Lain</Button>
                   </div>
                </div>
             ) : (
                <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 opacity-60">
                   <MessageSquare className="w-16 h-16 mb-6" />
                   <h3 className="text-xl font-bold">Pilih Obrolan</h3>
                   <p className="text-sm">Pilih salah satu tenant di sebelah kiri untuk memulai obrolan.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

const calculateStats = (state: any) => ({
  total: state.kamars.length,
  filled: state.kamars.filter((k: any) => k.status === 'DIHUNI').length,
  revenue: state.payments.reduce((acc: number, p: any) => acc + p.jumlah, 0),
  complaints: state.keluhans.filter((k: any) => k.status === 'OPEN').length,
});
