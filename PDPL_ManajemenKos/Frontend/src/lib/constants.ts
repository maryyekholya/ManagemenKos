import { Kamar, Booking, Keluhan, Payment, Notification, AppConfig } from '../types';

export const INITIAL_KAMAR: Kamar[] = [
  { 
    id: 'K001', 
    nomor: '101', 
    tipe: 'Standard', 
    harga_dasar: 800000, 
    fasilitas: ['WiFi', 'AC', 'Kamar Mandi Dalam'], 
    status: 'TERSEDIA', 
    lantai: 1, 
    kapasitas: 1, 
    deskripsi: 'Kamar nyaman dengan fasilitas standar', 
    description: 'Kamar tidur minimalis yang dirancang untuk produktivitas maksimal. Dilengkapi dengan tempat tidur single berkualitas tinggi, meja kerja ergonomis, dan pencahayaan alami yang cukup. Cocok untuk mahasiswa atau profesional muda yang mencari kenyamanan dengan harga ekonomis.',
    foto_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400' 
  },
  { 
    id: 'K002', 
    nomor: '102', 
    tipe: 'Standard', 
    harga_dasar: 800000, 
    fasilitas: ['WiFi', 'AC', 'Kamar Mandi Dalam'], 
    status: 'DIHUNI', 
    lantai: 1, 
    kapasitas: 1, 
    deskripsi: 'Kamar nyaman dengan fasilitas standar', 
    description: 'Ruang privat yang tenang di lantai dasar. Kamar ini menawarkan akses mudah dan sirkulasi udara yang baik. Fasilitas AC dan WiFi kecepatan tinggi memastikan Anda tetap nyaman selama beraktivitas di dalam kamar.',
    foto_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400' 
  },
  { 
    id: 'K003', 
    nomor: '201', 
    tipe: 'Deluxe', 
    harga_dasar: 1200000, 
    fasilitas: ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas'], 
    status: 'TERSEDIA', 
    lantai: 2, 
    kapasitas: 2, 
    deskripsi: 'Kamar deluxe dengan fasilitas lengkap', 
    description: 'Nikmati kemewahan ekstra di kamar Deluxe kami. Ruangan yang lebih luas dilengkapi dengan Smart TV 32 inci dan kulkas mini untuk kenyamanan Anda. Terletak di lantai 2 dengan pemandangan koridor yang asri.',
    foto_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' 
  },
  { 
    id: 'K004', 
    nomor: '202', 
    tipe: 'Deluxe', 
    harga_dasar: 1200000, 
    fasilitas: ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas'], 
    status: 'DIPESAN', 
    lantai: 2, 
    kapasitas: 2, 
    deskripsi: 'Kamar deluxe dengan fasilitas lengkap', 
    description: 'Pilihan favorit untuk pasangan atau teman yang ingin berbagi ruangan. Kamar ini memiliki pencahayaan ambient yang hangat, area penyimpanan yang luas, dan kamar mandi dengan shower modern.',
    foto_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' 
  },
  { 
    id: 'K005', 
    nomor: '301', 
    tipe: 'Suite', 
    harga_dasar: 2000000, 
    fasilitas: ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas', 'Dapur Mini', 'Balkon'], 
    status: 'TERSEDIA', 
    lantai: 3, 
    kapasitas: 2, 
    deskripsi: 'Suite mewah dengan pemandangan terbaik', 
    description: 'Unit eksklusif di lantai teratas dengan balkon pribadi yang menghadap ke taman kota. Dilengkapi dengan pantry pribadi/dapur mini, sofa santai, dan interior bertema industrial modern. Standar hunian kelas atas untuk gaya hidup urban.',
    foto_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400' 
  },
  { 
    id: 'K006', 
    nomor: '302', 
    tipe: 'Suite', 
    harga_dasar: 2000000, 
    fasilitas: ['WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas', 'Dapur Mini', 'Balkon'], 
    status: 'DIKONFIRMASI', 
    lantai: 3, 
    kapasitas: 2, 
    deskripsi: 'Suite mewah dengan pemandangan terbaik', 
    description: 'Kombinasi sempurna antara ruang kerja dan ruang istirahat. Suite ini menawarkan privasi total dengan kedap suara yang baik. Ideal bagi mereka yang bekerja dari rumah (WFH) dan membutuhkan ruang ekstra.',
    foto_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400' 
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'BK001', kamar_id: 'K002', user_id: 'USR001', user_name: 'Budi Santoso', user_phone: '08123456789', tgl_masuk: '2025-01-15', tgl_keluar: '2025-07-15', durasi_bulan: 6, status: 'DIHUNI', total: 4800000, metode_bayar: 'Transfer', created_at: '2025-01-10', catatan: 'Dekat kampus, tolong sediakan meja belajar tambahan' },
  { id: 'BK002', kamar_id: 'K004', user_id: 'USR002', user_name: 'Andi Kurniawan', user_phone: '08987654321', tgl_masuk: '2025-02-01', tgl_keluar: '2025-08-01', durasi_bulan: 6, status: 'DIPESAN', total: 7200000, metode_bayar: 'QRIS', created_at: '2025-01-28', catatan: '' },
  { id: 'BK003', kamar_id: 'K006', user_id: 'USR003', user_name: 'Rini Permata', user_phone: '08567890123', tgl_masuk: '2025-03-01', tgl_keluar: '2025-09-01', durasi_bulan: 6, status: 'DIKONFIRMASI', total: 12000000, metode_bayar: 'Transfer', created_at: '2025-02-20', catatan: 'Butuh parkir motor' },
];

export const INITIAL_KELUHAN: Keluhan[] = [
  { id: 'KEL001', booking_id: 'BK001', user_name: 'Budi Santoso', kamar_nomor: '102', deskripsi: 'AC tidak dingin sejak 2 hari lalu, sudah coba restart tapi tetap tidak berfungsi', status: 'OPEN', assigned_to: 'Tim Teknis', priority: 'HIGH', created_at: '2025-01-20', resolved_at: null },
  { id: 'KEL002', booking_id: 'BK003', user_name: 'Rini Permata', kamar_nomor: '302', deskripsi: 'Ada kesalahan pada tagihan bulan Februari, harap dikoreksi', status: 'IN_PROGRESS', assigned_to: 'Tim Keuangan', priority: 'MEDIUM', created_at: '2025-01-22', resolved_at: null },
  { id: 'KEL003', booking_id: 'BK001', user_name: 'Budi Santoso', kamar_nomor: '102', deskripsi: 'WiFi lambat di kamar saya, speed test hanya 2 Mbps', status: 'RESOLVED', assigned_to: 'Tim Teknis', priority: 'LOW', created_at: '2025-01-18', resolved_at: '2025-01-19' },
];

export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'PAY001', booking_id: 'BK001', jumlah: 4800000, metode: 'Transfer', status: 'SUCCESS', tanggal: '2025-01-12', midtrans_id: 'MT-2025011200001', bukti_url: null },
  { id: 'PAY002', booking_id: 'BK003', jumlah: 12000000, metode: 'Transfer', status: 'SUCCESS', tanggal: '2025-02-22', midtrans_id: 'MT-2025022200002', bukti_url: null },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'N001', type: 'BOOKING_CREATED', message: 'Booking baru dari Andi Kurniawan untuk Kamar 202', read: false, created_at: '2025-01-28T10:00:00' },
  { id: 'N002', type: 'PAYMENT_RECEIVED', message: 'Pembayaran diterima dari Rini Permata sebesar Rp 12.000.000', read: false, created_at: '2025-02-22T14:30:00' },
  { id: 'N003', type: 'KELUHAN_NEW', message: 'Keluhan baru dari Budi Santoso: AC tidak dingin', read: true, created_at: '2025-01-20T09:15:00' },
];

export const DEFAULT_CONFIG: AppConfig = {
  nama_kos: 'NestIn Boarding',
  alamat: 'Jl. Merdeka No. 123, Bandung',
  telepon: '0812-3456-7890',
  email: 'hello@nestin.id',
  max_booking_timeout: 30,
  payment_timeout: 24
};

export const DEMO_USERS = [
  { email: 'user@nestin.id', password: 'user123', role: 'user', name: 'Budi Santoso', id: 'USR001' },
  { email: 'admin@nestin.id', password: 'admin123', role: 'admin', name: 'Sari Dewi', id: 'ADM001' },
  { email: 'manager@nestin.id', password: 'manager123', role: 'manager', name: 'Hendra Wijaya', id: 'MGR001' },
  { email: 'organizer@nestin.id', password: 'organizer123', role: 'organizer', name: 'Andi Organizer', id: 'ORG001' },
  { email: 'newuser@nestin.id', password: 'user123', role: 'user', name: 'Siti Aminah', id: 'USR004' },
];
