/**
 * VIEW LAYER — AdminTambahPengguna
 *
 * MVC Role: View
 * Halaman penuh untuk menambahkan pengguna baru oleh admin.
 * Menggantikan modal pop-up dengan full-page form yang lebih ergonomis.
 */

import React, { useState } from 'react';
import { useApp } from '../../App';
import { Role } from '../../types';
import { Button, FormInput } from '../../components/shared/UI';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

// Role option config
const ROLE_OPTIONS: { value: Role; label: string; desc: string; color: string }[] = [
  {
    value: 'user',
    label: 'User (Tenant)',
    desc: 'Pengguna biasa yang menyewa kamar',
    color: 'emerald',
  },
  {
    value: 'manager',
    label: 'Manager',
    desc: 'Mengelola operasional kos',
    color: 'blue',
  },
  {
    value: 'admin',
    label: 'Admin',
    desc: 'Akses penuh ke semua fitur',
    color: 'purple',
  },
  {
    value: 'guest',
    label: 'Guest',
    desc: 'Akses terbatas, hanya lihat',
    color: 'slate',
  },
];

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  blue:    'border-blue-500 bg-blue-50 text-blue-700',
  amber:   'border-amber-500 bg-amber-50 text-amber-700',
  purple:  'border-purple-500 bg-purple-50 text-purple-700',
  slate:   'border-slate-400 bg-slate-50 text-slate-600',
};

const colorDot: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue:    'bg-blue-500',
  amber:   'bg-amber-500',
  purple:  'bg-purple-500',
  slate:   'bg-slate-400',
};

interface AdminTambahPenggunaProps {
  onBack: () => void; // callback untuk kembali ke daftar akun
}

export const AdminTambahPengguna: React.FC<AdminTambahPenggunaProps> = ({ onBack }) => {
  const { dispatch } = useApp();

  // Form state
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]       = useState<Role>('user');
  const [phone, setPhone]     = useState('');
  const [address, setAddress] = useState('');

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Nama, Email, dan Password wajib diisi.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, email, password, role, phone, address };

      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setError(json.message || 'Gagal menyimpan data pengguna.');
        return;
      }

      dispatch({ type: 'ADD_USER', payload: json.data });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan. Pastikan server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ────────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
      >
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Pengguna Berhasil Ditambahkan!</h2>
          <p className="text-slate-500 text-sm">
            Akun untuk <span className="font-bold text-slate-700">{name}</span> dengan role{' '}
            <span className="font-bold text-slate-700">{role}</span> telah dibuat.
          </p>
        </div>
        <div className="flex gap-4 pt-4">
          <Button variant="secondary" onClick={onBack}>
            Kembali ke Daftar
          </Button>
          <Button
            onClick={() => {
              setSuccess(false);
              setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
              setRole('user'); setPhone(''); setAddress(''); setError('');
            }}
          >
            Tambah Pengguna Lain
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-10 max-w-5xl"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <div className="label-upper text-xs mb-0.5">Manajemen Akun</div>
          <h1 className="text-3xl font-normal leading-tight">Tambah Pengguna Baru</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Role Selector ─────────────────────────────────── */}
        <section className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-500">
              Role Pengguna
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = role === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={cn(
                    'relative p-4 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none',
                    isSelected
                      ? colorMap[opt.color]
                      : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'
                  )}
                >
                  <div className={cn('w-2.5 h-2.5 rounded-full mb-3', isSelected ? colorDot[opt.color] : 'bg-slate-300')} />
                  <p className={cn('font-bold text-xs', isSelected ? '' : 'text-slate-700')}>{opt.label}</p>
                  <p className={cn('text-[10px] mt-1 leading-snug', isSelected ? 'opacity-80' : 'text-slate-400')}>
                    {opt.desc}
                  </p>
                  {isSelected && (
                    <UserCheck className="absolute top-3 right-3 w-4 h-4 opacity-70" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Identitas ─────────────────────────────────────── */}
        <section className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-1">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-500">
              Informasi Identitas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Nama Lengkap"
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Masukkan nama lengkap pengguna"
              icon={<User className="w-4 h-4" />}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              placeholder="nama@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <FormInput
              label="Nomor Telepon"
              type="tel"
              value={phone}
              onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
              placeholder="0812xxxxxx"
              icon={<Phone className="w-4 h-4" />}
            />
            <FormInput
              label="Alamat"
              value={address}
              onChange={(e) => setAddress((e.target as HTMLInputElement).value)}
              placeholder="Alamat lengkap pengguna"
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
        </section>

        {/* ── Keamanan ──────────────────────────────────────── */}
        <section className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-1">
            <Lock className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-500">
              Keamanan Akun
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 w-full">
              <FormInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                placeholder="Min. 8 karakter"
                icon={<Lock className="w-4 h-4" />}
                required
              />
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="flex gap-1 pl-1">
                  {[1, 2, 3, 4].map((lvl) => {
                    const strength = Math.min(4, Math.floor(password.length / 3));
                    const colors = ['bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'];
                    return (
                      <div
                        key={lvl}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          strength >= lvl ? colors[strength - 1] : 'bg-slate-200'
                        )}
                      />
                    );
                  })}
                  <span className="text-[10px] text-slate-400 ml-2 font-bold uppercase tracking-wider self-center">
                    {['', 'Lemah', 'Cukup', 'Baik', 'Kuat'][Math.min(4, Math.floor(password.length / 3))] || 'Lemah'}
                  </span>
                </div>
              )}
            </div>
            <FormInput
              label="Konfirmasi Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
              placeholder="Ulangi password"
              icon={<Lock className="w-4 h-4" />}
              error={
                confirmPassword && password !== confirmPassword
                  ? 'Password tidak cocok'
                  : undefined
              }
              required
            />
          </div>
        </section>

        {/* ── Error / Actions ───────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        <div className="flex items-center justify-end gap-4 pb-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            className="min-w-[120px]"
          >
            Batal
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="min-w-[160px]"
          >
            Simpan Pengguna
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
