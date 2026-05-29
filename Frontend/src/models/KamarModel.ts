/**
 * MODEL LAYER — KamarModel
 * 
 * MVC Role: Model
 * Bertanggung jawab atas representasi data Kamar,
 * validasi, dan helper factory. Tidak berisi logika UI.
 */

import { Kamar, RoomStatus, RoomType } from '../types';

// Re-export types agar komponen bisa import dari satu tempat
export type { Kamar, RoomStatus, RoomType };

// ──────────────────────────────────────
// FACTORY
// ──────────────────────────────────────

/** Membuat objek Kamar kosong untuk form tambah baru */
export const createEmptyKamar = (): Omit<Kamar, 'id'> => ({
  nomor: '',
  tipe: 'Standard',
  harga_dasar: 0,
  fasilitas: [],
  status: 'TERSEDIA',
  lantai: 1,
  kapasitas: 1,
  deskripsi: '',
  description: '',
  foto_url: '',
});

/** Generate ID kamar baru berdasarkan timestamp */
export const generateKamarId = (): string =>
  `K${Date.now().toString().slice(-6)}`;

// ──────────────────────────────────────
// VALIDASI
// ──────────────────────────────────────

export interface KamarValidationError {
  field: keyof Kamar | string;
  message: string;
}

/** Validasi data kamar sebelum disimpan */
export const validateKamar = (
  data: Partial<Omit<Kamar, 'id'>>
): KamarValidationError[] => {
  const errors: KamarValidationError[] = [];

  if (!data.nomor?.trim()) {
    errors.push({ field: 'nomor', message: 'Nomor kamar wajib diisi' });
  }

  if (!data.harga_dasar || data.harga_dasar <= 0) {
    errors.push({
      field: 'harga_dasar',
      message: 'Harga dasar harus lebih dari 0',
    });
  }

  if (!data.lantai || data.lantai < 1) {
    errors.push({ field: 'lantai', message: 'Lantai minimal 1' });
  }

  if (!data.kapasitas || data.kapasitas < 1) {
    errors.push({ field: 'kapasitas', message: 'Kapasitas minimal 1 orang' });
  }

  return errors;
};

// ──────────────────────────────────────
// HELPERS
// ──────────────────────────────────────

/** Format harga dalam format Rupiah */
export const formatHarga = (harga: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(harga);

/** Label status kamar dalam Bahasa Indonesia */
export const KAMAR_STATUS_LABEL: Record<RoomStatus, string> = {
  TERSEDIA: 'Tersedia',
  DIPESAN: 'Dipesan',
  MENUNGGU_PEMBAYARAN: 'Menunggu Pembayaran',
  DIKONFIRMASI: 'Dikonfirmasi',
  DIHUNI: 'Dihuni',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};

/** Daftar tipe kamar yang tersedia */
export const ROOM_TYPES: RoomType[] = ['Standard', 'Deluxe', 'Suite'];

/** Daftar fasilitas yang umum tersedia */
export const COMMON_FASILITAS: string[] = [
  'WiFi',
  'AC',
  'Kamar Mandi Dalam',
  'TV',
  'Kulkas',
  'Dapur Mini',
  'Balkon',
  'Parkir',
  'Laundry',
];
