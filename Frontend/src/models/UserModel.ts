/**
 * MODEL LAYER — UserModel
 *
 * MVC Role: Model
 * Representasi data User, validasi form registrasi/login,
 * dan helper terkait role.
 */

import { User, Role } from '../types';

export type { User, Role };

// ──────────────────────────────────────
// FACTORY
// ──────────────────────────────────────

/** Generate ID user baru */
export const generateUserId = (): string =>
  `USR${Date.now().toString().slice(-8)}`;

/** Membuat objek User kosong untuk form registrasi */
export const createEmptyUser = (): Omit<User, 'id'> => ({
  name: '',
  email: '',
  password: '',
  isVerified: false,
  role: 'user',
});

// ──────────────────────────────────────
// VALIDASI
// ──────────────────────────────────────

export interface UserValidationError {
  field: string;
  message: string;
}

/** Validasi form registrasi */
export const validateRegistration = (data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): UserValidationError[] => {
  const errors: UserValidationError[] = [];

  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Nama minimal 2 karakter' });
  }

  if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Format email tidak valid' });
  }

  if (!data.password || data.password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password minimal 6 karakter',
    });
  }

  return errors;
};

/** Validasi form login */
export const validateLogin = (data: {
  email: string;
  password: string;
}): UserValidationError[] => {
  const errors: UserValidationError[] = [];

  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'Email wajib diisi' });
  }

  if (!data.password.trim()) {
    errors.push({ field: 'password', message: 'Password wajib diisi' });
  }

  return errors;
};

// ──────────────────────────────────────
// HELPERS
// ──────────────────────────────────────

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Label role dalam Bahasa Indonesia */
export const ROLE_LABEL: Record<Role, string> = {
  guest: 'Tamu',
  user: 'Penyewa',
  admin: 'Administrator',
  manager: 'Manajer',
  organizer: 'Pengelola',
};

/** Warna badge per role untuk UI */
export const ROLE_COLOR: Record<Role, string> = {
  guest: 'bg-slate-100 text-slate-600',
  user: 'bg-blue-100 text-blue-700',
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  organizer: 'bg-emerald-100 text-emerald-700',
};

/** Role yang memiliki akses admin panel */
export const ADMIN_ROLES: Role[] = ['admin', 'manager'];

/** Ambil inisial nama untuk avatar */
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
