/**
 * MODEL LAYER — BookingModel
 *
 * MVC Role: Model
 * Representasi data Booking, validasi, dan helper factory.
 */

import { Booking, RoomStatus, PaymentMethod } from '../types';

export type { Booking, RoomStatus, PaymentMethod };

// ──────────────────────────────────────
// FACTORY
// ──────────────────────────────────────

/** Generate ID booking unik */
export const generateBookingId = (): string =>
  `BK${Date.now().toString().slice(-8)}`;

/** Membuat state history entry baru */
export const createStateHistoryEntry = (
  state: RoomStatus,
  actor: string,
  note?: string
): NonNullable<Booking['stateHistory']>[number] => ({
  state,
  timestamp: new Date().toISOString(),
  actor,
  note,
});

// ──────────────────────────────────────
// VALIDASI
// ──────────────────────────────────────

export interface BookingValidationError {
  field: string;
  message: string;
}

export const validateBooking = (
  data: Partial<Booking>
): BookingValidationError[] => {
  const errors: BookingValidationError[] = [];

  if (!data.user_name?.trim()) {
    errors.push({ field: 'user_name', message: 'Nama penyewa wajib diisi' });
  }

  if (!data.kamar_id) {
    errors.push({ field: 'kamar_id', message: 'Kamar wajib dipilih' });
  }

  if (!data.tgl_masuk) {
    errors.push({ field: 'tgl_masuk', message: 'Tanggal masuk wajib diisi' });
  }

  if (!data.durasi_bulan || data.durasi_bulan < 1) {
    errors.push({
      field: 'durasi_bulan',
      message: 'Durasi sewa minimal 1 bulan',
    });
  }

  return errors;
};

// ──────────────────────────────────────
// HELPERS
// ──────────────────────────────────────

/** Status yang dianggap sebagai booking "aktif" */
export const ACTIVE_BOOKING_STATUSES: RoomStatus[] = [
  'DIPESAN',
  'MENUNGGU_PEMBAYARAN',
  'DIKONFIRMASI',
  'DIHUNI',
];

/** Hitung tanggal keluar berdasarkan tanggal masuk + durasi */
export const hitungTglKeluar = (
  tglMasuk: string,
  durasibulan: number
): string => {
  const date = new Date(tglMasuk);
  date.setMonth(date.getMonth() + durasibulan);
  return date.toISOString().split('T')[0];
};

/** Label metode pembayaran */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  Transfer: 'Transfer Bank',
  QRIS: 'QRIS',
  Cash: 'Tunai',
};

/** Status booking yang boleh dihapus */
export const DELETABLE_BOOKING_STATUSES: RoomStatus[] = [
  'DIBATALKAN',
  'SELESAI',
];
