/**
 * VIEW LAYER — AdminBooking
 *
 * MVC Role: View
 * Halaman manajemen booking menggunakan useBookingController.
 * Memisahkan logika konfirmasi/penolakan dari UI rendering.
 */

import React, { useState } from 'react';
import { Eye, Check, X, Search, Filter } from 'lucide-react';
import { Booking } from '../../types';
import { useBookingController } from '../../controllers/useBookingController';
import { Button, Modal, FormInput, StatusBadge } from '../../components/shared/UI';
import { useApp } from '../../App';
import { formatRupiah } from '../../lib/utils';

export const AdminBooking: React.FC = () => {
  const { state } = useApp();
  const { bookings, confirmBooking, rejectBooking, checkInBooking, checkOutBooking } =
    useBookingController();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBookings = bookings.filter(b => {
    const kamar = state.kamars.find(k => k.id == b.kamar_id);
    const matchesSearch = b.user_name.toLowerCase().includes(search.toLowerCase()) || 
                          b.id.toLowerCase().includes(search.toLowerCase()) || 
                          kamar?.nomor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirm = () => {
    if (!selectedBooking) return;
    confirmBooking(selectedBooking);
    setShowConfirmModal(false);
    setSelectedBooking(null);
  };

  const handleReject = () => {
    if (!selectedBooking || !rejectionReason.trim()) return;
    rejectBooking(selectedBooking, rejectionReason);
    setShowRejectModal(false);
    setSelectedBooking(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="label-upper mb-1">Manajemen Tenant</div>
        <h1 className="text-3xl font-normal leading-tight">Booking &amp; Tenant</h1>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Total', count: bookings.length, bg: 'bg-slate-100 text-slate-700' },
          { label: 'Menunggu Verifikasi', count: bookings.filter(b => b.status === 'MENUNGGU_PEMBAYARAN' && b.paymentClaimTimestamp).length, bg: 'bg-amber-100 text-amber-700' },
          { label: 'Dikonfirmasi', count: bookings.filter(b => b.status === 'DIKONFIRMASI').length, bg: 'bg-blue-100 text-blue-700' },
          { label: 'Dihuni', count: bookings.filter(b => b.status === 'DIHUNI').length, bg: 'bg-emerald-100 text-emerald-700' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} px-4 py-2 rounded-full flex items-center gap-2`}>
            <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
            <span className="text-sm font-black">{s.count}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama tenant, ID booking, atau nomor kamar..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="ALL">Semua Status</option>
          <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
          <option value="DIKONFIRMASI">Dikonfirmasi</option>
          <option value="DIHUNI">Dihuni</option>
          <option value="SELESAI">Selesai</option>
          <option value="DIBATALKAN">Dibatalkan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['ID', 'Tenant', 'Kamar', 'Metode', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredBookings.map(b => {
              const kamar = state.kamars.find(k => k.id == b.kamar_id);
              return (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{b.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm">{b.user_name}</p>
                    <p className="text-[10px] text-slate-400">{b.user_phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">Kamar {kamar?.nomor || '?'}</p>
                    <p className="text-[10px] text-slate-400">{kamar?.tipe}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg">
                      {b.metode_bayar}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {/* Verifikasi QRIS */}
                      {b.status === 'MENUNGGU_PEMBAYARAN' && b.paymentClaimTimestamp && (
                        <>
                          <Button
                            className="h-8 px-3 text-[10px] bg-emerald-600"
                            onClick={() => { setSelectedBooking(b); setShowConfirmModal(true); }}
                          >
                            <Check className="w-3 h-3 mr-1" /> Konfirmasi
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-8 px-3 text-[10px] text-red-600 border-red-100 hover:bg-red-50"
                            onClick={() => { setSelectedBooking(b); setShowRejectModal(true); }}
                          >
                            <X className="w-3 h-3 mr-1" /> Tolak
                          </Button>
                        </>
                      )}
                      {/* Check-in */}
                      {b.status === 'DIKONFIRMASI' && (
                        <Button
                          className="h-8 px-3 text-[10px] bg-blue-600 border-none"
                          onClick={() => checkInBooking(b)}
                        >
                          Check-in
                        </Button>
                      )}
                      {/* Check-out */}
                      {b.status === 'DIHUNI' && (
                        <Button
                          className="h-8 px-3 text-[10px] bg-slate-500 border-none text-white"
                          onClick={() => checkOutBooking(b)}
                        >
                          Selesai
                        </Button>
                      )}
                      {/* Detail */}
                      <Button
                        variant="secondary"
                        className="h-8 px-3 text-[10px]"
                        onClick={() => { setSelectedBooking(b); setShowDetailModal(true); }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Confirm Modal ── */}
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
            <h4 className="text-xl font-bold">Konfirmasi Pembayaran?</h4>
            <p className="text-sm text-slate-500">
              Anda memvalidasi bahwa dana telah diterima ke rekening / e-wallet.
            </p>
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
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowConfirmModal(false)}>Batal</Button>
            <Button className="flex-1 bg-emerald-600 shadow-lg shadow-emerald-100" onClick={handleConfirm}>Konfirmasi</Button>
          </div>
        </div>
      </Modal>

      {/* ── Reject Modal ── */}
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
          <div className="text-center space-y-1">
            <h4 className="text-xl font-bold">Tolak Pembayaran?</h4>
            <p className="text-xs text-slate-500">Berikan alasan agar penyewa dapat memperbaiki kendala.</p>
          </div>
          <FormInput
            label="Alasan Penolakan"
            type="textarea"
            placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowRejectModal(false)}>Kembali</Button>
            <Button
              variant="danger"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
              disabled={!rejectionReason.trim()}
              onClick={handleReject}
            >
              Tolak Pembayaran
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detail Booking"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Booking ID', value: selectedBooking.id },
                { label: 'Kamar', value: `Kamar ${state.kamars.find(k => k.id == selectedBooking.kamar_id)?.nomor}` },
                { label: 'Tgl Masuk', value: selectedBooking.tgl_masuk },
                { label: 'Tgl Keluar', value: selectedBooking.tgl_keluar },
                { label: 'Durasi', value: `${selectedBooking.durasi_bulan} Bulan` },
                { label: 'Total', value: formatRupiah(selectedBooking.total) },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="font-bold text-slate-900 text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            {selectedBooking.catatan && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Catatan</p>
                <p className="text-sm text-amber-800">{selectedBooking.catatan}</p>
              </div>
            )}
            {selectedBooking.stateHistory && selectedBooking.stateHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Riwayat Status</p>
                <div className="space-y-2">
                  {selectedBooking.stateHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">{h.state}</p>
                        <p className="text-[10px] text-slate-400">{h.actor} • {new Date(h.timestamp).toLocaleString('id-ID')}</p>
                        {h.note && <p className="text-[10px] text-slate-500 italic mt-0.5">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button className="w-full py-4" onClick={() => setShowDetailModal(false)}>Tutup</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
