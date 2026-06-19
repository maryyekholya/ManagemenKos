/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomStatus = 'TERSEDIA' | 'DIPESAN' | 'MENUNGGU_PEMBAYARAN' | 'DIKONFIRMASI' | 'DIHUNI' | 'SELESAI' | 'DIBATALKAN';
export type RoomType = 'Standard' | 'Deluxe' | 'Suite';
export type PricingStrategyType = 'Normal' | 'Seasonal' | 'Discount';
export type PaymentMethod = 'Transfer' | 'QRIS' | 'Cash';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Role = 'guest' | 'user' | 'admin' | 'manager';

export interface Kamar {
  id: string;
  nomor: string;
  tipe: RoomType;
  harga_dasar: number;
  fasilitas: string[];
  status: RoomStatus;
  foto_url: string;
  lantai: number;
  kapasitas: number;
  deskripsi: string;
  description: string; // Added more detailed description field
}

export interface Booking {
  id: string;
  kamar_id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  tgl_masuk: string;
  tgl_keluar: string;
  durasi_bulan: number;
  status: RoomStatus;
  total: number;
  metode_bayar: PaymentMethod;
  created_at: string;
  catatan?: string;
  paymentClaimTimestamp?: string;
  stateHistory?: Array<{
    state: RoomStatus;
    timestamp: string;
    actor: string;
    note?: string;
  }>;
  paymentAttempts?: Array<{
    timestamp: string;
    method: PaymentMethod;
    status: string;
    claimed_by_user: boolean;
  }>;
  rejectionNote?: string;
}

export interface Keluhan {
  id: string;
  booking_id: string;
  user_name: string;
  kamar_nomor: string;
  deskripsi: string;
  status: ComplaintStatus;
  assigned_to: string;
  priority: ComplaintPriority;
  created_at: string;
  resolved_at: string | null;
  attachment_url?: string;
  team_assigned?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  jumlah: number;
  metode: PaymentMethod;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  tanggal: string;
  midtrans_id: string | null;
  bukti_url: string | null;
}

export interface Notification {
  id: string;
  type: string;
  title?: string;
  message: string;
  read: boolean;
  created_at: string;
  recipient?: string | 'admin' | 'all';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  booking_id?: string;
  action_required?: boolean;
  actions?: string[];
  tenant_name?: string;
  kamar_nomor?: string;
  amount?: number;
  method?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored in state for demo purposes
  isVerified?: boolean; // For email verification simulation
  role: Role;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface AppConfig {
  nama_kos: string;
  alamat: string;
  telepon: string;
  email: string;
  max_booking_timeout: number; // minutes
  payment_timeout: number; // hours
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
  roomId: string; // roomId will be tenantId for 1-on-1 with admin
}
