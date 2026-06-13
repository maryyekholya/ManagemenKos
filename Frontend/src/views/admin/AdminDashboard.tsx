/**
 * VIEW LAYER — AdminDashboard
 *
 * MVC Role: View (Orchestrator / Layout)
 * Menjadi shell/layout saja — setiap tab sekarang di-handle
 * oleh komponen terpisah di folder views/admin/.
 *
 * Sub-views:
 *  - AdminKamar    → CRUD kamar (useKamarController)
 *  - AdminBooking  → Booking & konfirmasi (useBookingController)
 *  - AdminKeluhan  → Keluhan & status update (useKeluhanController)
 *  - AdminPembayaran, AdminLaporan, AdminSettings → inline di bawah
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Bed, ClipboardList, CreditCard, PieChart,
  Settings, Download, MessageSquare, Check, Search, Users
} from 'lucide-react';
import { useApp } from '../../App';
import { Payment, User } from '../../types';
import { formatRupiah, cn } from '../../lib/utils';
import { Button, FormInput } from '../../components/shared/UI';
import { ChatWidget } from '../../components/shared/ChatWidget';
import { AdminKamar } from './AdminKamar';
import { AdminBooking } from './AdminBooking';
import { AdminKeluhan } from './AdminKeluhan';
import { AdminAkun } from './AdminAkun';
import { AdminTambahPengguna } from './AdminTambahPengguna';
import { motion } from 'motion/react';

// ──────────────────────────────────────
// OVERVIEW
// ──────────────────────────────────────

const Overview: React.FC<{ stats: ReturnType<typeof calculateStats> }> = ({ stats }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/admin/dashboard');
        const json = await response.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const displayStats = data ? {
    total: data.stats.total_kamar,
    filled: data.stats.kamar_dihuni,
    revenue: data.stats.monthly_revenue,
    complaints: data.stats.open_complaints,
  } : stats;

  const recentBookings = data ? data.recent_bookings : [1, 2, 3].map((i) => ({
    id: i,
    user: { name: `Tenant Name ${i}` },
    kamar: { nomor: `10${i}` }
  }));

  const chartData = data ? data.occupancy_chart : [60, 80, 75, 90, 85, 95];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="label-upper">Admin Control</div>
          <h1 className="text-3xl font-normal leading-tight">Operational Overview</h1>
        </div>
        <Button variant="secondary">Download Summary</Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Memuat data dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Total Inventory', value: displayStats.total, icon: Bed },
              { label: 'Occupancy', value: displayStats.filled, icon: Check },
              { label: 'Monthly Revenue', value: formatRupiah(displayStats.revenue), icon: CreditCard },
              { label: 'Open Complaints', value: displayStats.complaints, icon: ClipboardList },
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
            {/* Occupancy Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Tingkat Hunian</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                {chartData.map((h: number, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      className="w-full bg-emerald-100 rounded-lg relative overflow-hidden"
                      style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-emerald-600 opacity-60" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-slate-400">Bln {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Booking Terbaru</h3>
              <div className="space-y-4">
                {recentBookings.map((b: any, i: number) => (
                  <div key={b.id || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-xs text-slate-500 shadow-sm">BK</div>
                      <div>
                        <p className="text-sm font-bold">{b.user?.name || `Tenant Name ${i + 1}`}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Kamar {b.kamar?.nomor || `10${i + 1}`}</p>
                      </div>
                    </div>
                    <Button className="py-2 text-xs">Detail</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ──────────────────────────────────────
// PEMBAYARAN (inline — tidak perlu controller terpisah)
// ──────────────────────────────────────

const AdminPembayaran: React.FC = () => {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc'|'date_asc'|'amount_desc'|'amount_asc'>('date_desc');

  let filteredPayments = [...state.payments];

  if (search) {
      const lowerSearch = search.toLowerCase();
      filteredPayments = filteredPayments.filter(p => {
          return p.id.toLowerCase().includes(lowerSearch) || 
                 p.metode.toLowerCase().includes(lowerSearch) ||
                 (p.midtrans_id && p.midtrans_id.toLowerCase().includes(lowerSearch));
      });
  }

  filteredPayments.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      if (sortBy === 'date_asc') return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      if (sortBy === 'amount_desc') return b.jumlah - a.jumlah;
      if (sortBy === 'amount_asc') return a.jumlah - b.jumlah;
      return 0;
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="label-upper mb-1">Transaksi</div>
        <h1 className="text-3xl font-normal leading-tight">Riwayat Pembayaran</h1>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Cari ID transaksi, metode bayar, atau Midtrans ID..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
            <option value="date_desc">Terbaru</option>
            <option value="date_asc">Terlama</option>
            <option value="amount_desc">Nominal Tertinggi</option>
            <option value="amount_asc">Nominal Terendah</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPayments.map((p: Payment) => (
          <div
            key={p.id}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                Rp
              </div>
              <div>
                <p className="font-bold text-lg">{formatRupiah(p.jumlah)}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  {p.metode} • {p.tanggal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Midtrans ID</p>
                <p className="text-xs font-mono">{p.midtrans_id || 'MANUAL'}</p>
              </div>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────
// LAPORAN
// ──────────────────────────────────────

const AdminLaporan: React.FC = () => {
  const { state } = useApp();

  // Kelompokkan pembayaran SUCCESS berdasarkan bulan (YYYY-MM)
  const monthlyMap = state.payments
    .filter((p: Payment) => p.status === 'SUCCESS')
    .reduce((acc: Record<string, { pendapatan: number; bookingIds: Set<string> }>, p: Payment) => {
      const key = p.tanggal.substring(0, 7); // "2025-01"
      if (!acc[key]) acc[key] = { pendapatan: 0, bookingIds: new Set() };
      acc[key].pendapatan += p.jumlah;
      acc[key].bookingIds.add(p.booking_id);
      return acc;
    }, {});

  // Urutkan dari terbaru ke terlama
  const sortedMonths = Object.entries(monthlyMap).sort((a, b) => b[0].localeCompare(a[0]));

  const totalPendapatan = state.payments
    .filter((p: Payment) => p.status === 'SUCCESS')
    .reduce((a: number, p: Payment) => a + p.jumlah, 0);

  const formatBulan = (key: string) => {
    const [year, month] = key.split('-');
    const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${namaBulan[parseInt(month) - 1]} ${year}`;
  };

  const handleExportCSV = () => {
    const header = ['Bulan', 'Pendapatan (Rp)', 'Jumlah Booking'];
    const rows = sortedMonths.map(([key, data]: [string, { pendapatan: number; bookingIds: Set<string> }]) => [
      formatBulan(key),
      data.pendapatan.toString(),
      data.bookingIds.size.toString()
    ]);
    const totalRow = ['TOTAL', totalPendapatan.toString(), ''];
    const csvContent = [header, ...rows, [], totalRow]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-keuangan-nestin-${new Date().toISOString().substring(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="label-upper mb-1">Analitik</div>
          <h1 className="text-3xl font-normal leading-tight">Laporan Keuangan</h1>
        </div>
        <Button variant="secondary" className="gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Ekspor CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Pendapatan', value: formatRupiah(totalPendapatan) },
          { label: 'Tingkat Hunian', value: `${state.kamars.length > 0 ? Math.round((state.kamars.filter((k: any) => k.status === 'DIHUNI').length / state.kamars.length) * 100) : 0}%` },
          { label: 'Total Booking', value: state.bookings.length.toString() },
        ].map(s => (
          <div key={s.label} className="bg-white p-8 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-bold font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Bulan', 'Pendapatan', 'Booking Unik'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedMonths.length > 0 ? sortedMonths.map(([key, data]: [string, { pendapatan: number; bookingIds: Set<string> }]) => (
              <tr key={key} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold">{formatBulan(key)}</td>
                <td className="px-6 py-4 font-mono text-emerald-600 font-bold">{formatRupiah(data.pendapatan)}</td>
                <td className="px-6 py-4 font-bold">{data.bookingIds.size}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                  Belum ada data transaksi sukses.
                </td>
              </tr>
            )}
          </tbody>
          {sortedMonths.length > 0 && (
            <tfoot className="bg-slate-900 text-white">
              <tr>
                <td className="px-6 py-4 font-bold text-sm">TOTAL</td>
                <td className="px-6 py-4 font-bold font-mono">{formatRupiah(totalPendapatan)}</td>
                <td className="px-6 py-4 font-bold">{new Set(state.payments.filter((p: Payment) => p.status === 'SUCCESS').map((p: Payment) => p.booking_id)).size}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

// ──────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────

const AdminSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="label-upper mb-1">Konfigurasi</div>
        <h1 className="text-3xl font-normal leading-tight">Pengaturan Sistem</h1>
      </div>
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormInput
            label="Nama Kos"
            defaultValue={state.config.nama_kos}
            onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { nama_kos: e.target.value } })}
          />
          <FormInput
            label="Email Kontak"
            defaultValue={state.config.email}
            onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { email: e.target.value } })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormInput
            label="Timeout Booking (Menit)"
            type="number"
            defaultValue={state.config.max_booking_timeout}
            onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { max_booking_timeout: Number(e.target.value) } })}
          />
          <FormInput
            label="Timeout Pembayaran (Jam)"
            type="number"
            defaultValue={state.config.payment_timeout}
            onChange={e => dispatch({ type: 'UPDATE_CONFIG', payload: { payment_timeout: Number(e.target.value) } })}
          />
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

// ──────────────────────────────────────
// ADMIN CHAT
// ──────────────────────────────────────

const AdminChat: React.FC<{
  selectedUser: User | null;
  setSelectedUser: (u: User | null) => void;
}> = ({ selectedUser, setSelectedUser }) => {
  const { state } = useApp();
  const potentialChatUsers = state.users.filter(u =>
    u.role === 'user' && state.bookings.some(b => b.user_id === u.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="label-upper mb-1">Komunikasi</div>
        <h1 className="text-3xl font-normal leading-tight">Chat Tenant</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {potentialChatUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={cn(
                  'w-full p-6 flex items-center gap-4 transition-all hover:bg-slate-50/80 text-left',
                  selectedUser?.id === user.id ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
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

        <div className="lg:col-span-2 min-h-[500px] relative">
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

// ──────────────────────────────────────
// CALCULATE STATS HELPER
// ──────────────────────────────────────

const calculateStats = (state: any) => ({
  total: state.kamars.length,
  filled: state.kamars.filter((k: any) => k.status === 'DIHUNI').length,
  revenue: state.payments.reduce((acc: number, p: any) => acc + p.jumlah, 0),
  complaints: state.keluhans.filter((k: any) => k.status === 'OPEN').length,
});

// ──────────────────────────────────────
// MAIN DASHBOARD LAYOUT
// ──────────────────────────────────────

import { SidebarUserActions } from '../../components/shared/SidebarUserActions';

export const AdminDashboard: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);

  const menuItems = [
    { id: 'overview',    label: 'Overview',          icon: BarChart3 },
    { id: 'akun',        label: 'Manajemen Akun',    icon: Users },
    { id: 'kamar',       label: 'Manajemen Kamar',   icon: Bed },
    { id: 'booking',     label: 'Booking & Tenant',  icon: ClipboardList },
    { id: 'pembayaran',  label: 'Pembayaran',         icon: CreditCard },
    { id: 'keluhan',     label: 'Keluhan',            icon: ClipboardList },
    { id: 'chat',        label: 'Chat Tenant',        icon: MessageSquare },
    { id: 'laporan',     label: 'Laporan Keuangan',  icon: PieChart },
    { id: 'pengaturan',  label: 'Pengaturan',         icon: Settings },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'akun':       return <AdminAkun onNavigateToCreate={() => setActiveTab('akun-tambah')} />;
      case 'akun-tambah': return <AdminTambahPengguna onBack={() => setActiveTab('akun')} />;
      case 'kamar':      return <AdminKamar />;
      case 'booking':    return <AdminBooking />;
      case 'pembayaran': return <AdminPembayaran />;
      case 'keluhan':    return <AdminKeluhan />;
      case 'chat':       return <AdminChat selectedUser={selectedChatUser} setSelectedUser={setSelectedChatUser} />;
      case 'laporan':    return <AdminLaporan />;
      case 'pengaturan': return <AdminSettings />;
      case 'overview':
      default:           return <Overview stats={calculateStats(state)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 shrink-0 space-y-6">
        <SidebarUserActions onNavigate={onNavigate} />
        <div className="space-y-1 flex-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all rounded-[4px] relative',
                activeTab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {/* Keluhan badge */}
              {item.id === 'keluhan' && state.keluhans.filter((k: any) => k.status === 'OPEN').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {state.keluhans.filter((k: any) => k.status === 'OPEN').length}
                </span>
              )}
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
