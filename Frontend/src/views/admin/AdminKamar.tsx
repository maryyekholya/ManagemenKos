/**
 * VIEW LAYER — AdminKamar
 *
 * MVC Role: View
 * Halaman manajemen kamar dengan CRUD lengkap:
 * Tambah, Edit, Hapus kamar menggunakan useKamarController.
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Kamar, RoomType } from '../../types';
import { useKamarController } from '../../controllers/useKamarController';
import {
  createEmptyKamar,
  ROOM_TYPES,
  COMMON_FASILITAS,
} from '../../models/KamarModel';
import { Button, Modal, FormInput } from '../../components/shared/UI';
import { KamarCard } from '../../components/shared/KamarCard';
import { useApp } from '../../App';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// ──────────────────────────────────────
// FORM STATE TYPE
// ──────────────────────────────────────

type KamarFormData = Omit<Kamar, 'id'>;

// ──────────────────────────────────────
// KAMAR FORM MODAL
// ──────────────────────────────────────

const KamarFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  editingKamar: Kamar | null;
  onSave: (data: KamarFormData) => { success: boolean; errors: any[] };
}> = ({ isOpen, onClose, editingKamar, onSave }) => {
  const [form, setForm] = useState<KamarFormData>(
    editingKamar
      ? {
          nomor: editingKamar.nomor,
          tipe: editingKamar.tipe,
          harga_dasar: editingKamar.harga_dasar,
          fasilitas: [...editingKamar.fasilitas],
          status: editingKamar.status,
          lantai: editingKamar.lantai,
          kapasitas: editingKamar.kapasitas,
          deskripsi: editingKamar.deskripsi,
          description: editingKamar.description,
          foto_url: editingKamar.foto_url,
        }
      : createEmptyKamar()
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setForm(
        editingKamar
          ? {
              nomor: editingKamar.nomor,
              tipe: editingKamar.tipe,
              harga_dasar: editingKamar.harga_dasar,
              fasilitas: [...editingKamar.fasilitas],
              status: editingKamar.status,
              lantai: editingKamar.lantai,
              kapasitas: editingKamar.kapasitas,
              deskripsi: editingKamar.deskripsi,
              description: editingKamar.description,
              foto_url: editingKamar.foto_url,
            }
          : createEmptyKamar()
      );
      setErrors([]);
      setSuccess(false);
    }
  }, [isOpen, editingKamar]);

  const toggleFasilitas = (f: string) => {
    setForm((prev) => ({
      ...prev,
      fasilitas: prev.fasilitas.includes(f)
        ? prev.fasilitas.filter((x) => x !== f)
        : [...prev.fasilitas, f],
    }));
  };

  const handleSubmit = () => {
    const result = onSave(form);
    if (!result.success) {
      setErrors(result.errors.map((e: any) => e.message));
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 800);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingKamar ? 'Edit Kamar' : 'Tambah Kamar Baru'}
      size="lg"
    >
      <div className="space-y-6 p-2">
        {/* Error Banner */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-1"
            >
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {err}
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-700">
                {editingKamar ? 'Kamar berhasil diperbarui!' : 'Kamar baru berhasil ditambahkan!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 1: Nomor + Lantai */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Nomor Kamar"
            placeholder="101"
            value={form.nomor}
            onChange={(e) => setForm((p) => ({ ...p, nomor: e.target.value }))}
          />
          <FormInput
            label="Lantai"
            type="number"
            value={form.lantai}
            onChange={(e) =>
              setForm((p) => ({ ...p, lantai: Number(e.target.value) }))
            }
          />
        </div>

        {/* Row 2: Tipe + Harga */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Tipe Kamar
            </label>
            <div className="flex gap-2">
              {ROOM_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((p) => ({ ...p, tipe: t as RoomType }))}
                  className={cn(
                    'flex-1 py-2 text-xs font-bold border rounded-xl transition-all',
                    form.tipe === t
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-500 hover:border-slate-400'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <FormInput
            label="Harga Dasar (Rp)"
            type="number"
            value={form.harga_dasar}
            onChange={(e) =>
              setForm((p) => ({ ...p, harga_dasar: Number(e.target.value) }))
            }
          />
        </div>

        {/* Row 3: Kapasitas + Foto URL */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Kapasitas (Orang)"
            type="number"
            value={form.kapasitas}
            onChange={(e) =>
              setForm((p) => ({ ...p, kapasitas: Number(e.target.value) }))
            }
          />
          <FormInput
            label="URL Foto"
            placeholder="https://..."
            value={form.foto_url}
            onChange={(e) =>
              setForm((p) => ({ ...p, foto_url: e.target.value }))
            }
          />
        </div>

        {/* Fasilitas */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Fasilitas
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_FASILITAS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFasilitas(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold border rounded-full transition-all',
                  form.fasilitas.includes(f)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Deskripsi */}
        <FormInput
          label="Deskripsi Singkat"
          type="textarea"
          value={form.deskripsi}
          placeholder="Ringkasan singkat untuk status kamar..."
          onChange={(e) =>
            setForm((p) => ({ ...p, deskripsi: e.target.value }))
          }
        />
        <FormInput
          label="Deskripsi Lengkap"
          type="textarea"
          value={form.description}
          placeholder="Penjelasan mendalam tentang kamar, suasana, dan keunggulan..."
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
          >
            {editingKamar ? 'Simpan Perubahan' : 'Tambah Kamar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ──────────────────────────────────────
// DELETE CONFIRM MODAL
// ──────────────────────────────────────

const DeleteKamarModal: React.FC<{
  isOpen: boolean;
  kamar: Kamar | null;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, kamar, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Hapus Kamar" size="sm">
    <div className="p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <Trash2 className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-bold">Hapus Kamar {kamar?.nomor}?</h4>
        <p className="text-sm text-slate-500">
          Tindakan ini tidak dapat dibatalkan. Data kamar akan dihapus
          permanen dari sistem.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant="danger"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
          onClick={onConfirm}
        >
          Ya, Hapus
        </Button>
      </div>
    </div>
  </Modal>
);

// ──────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────

export const AdminKamar: React.FC = () => {
  const { state } = useApp();
  const { kamars, addKamar, updateKamar, deleteKamar } = useKamarController();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingKamar, setEditingKamar] = useState<Kamar | null>(null);
  const [deletingKamar, setDeletingKamar] = useState<Kamar | null>(null);

  const handleEdit = (k: Kamar) => {
    setEditingKamar(k);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (k: Kamar) => {
    setDeletingKamar(k);
    setIsDeleteOpen(true);
  };

  const handleSave = (data: Omit<Kamar, 'id'>) => {
    if (editingKamar) {
      return updateKamar(editingKamar.id, data);
    } else {
      return addKamar(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingKamar) {
      deleteKamar(deletingKamar.id);
      setIsDeleteOpen(false);
      setDeletingKamar(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="label-upper mb-1">Inventori Properti</div>
          <h1 className="text-3xl font-normal leading-tight">Manajemen Kamar</h1>
        </div>
        <Button
          onClick={() => {
            setEditingKamar(null);
            setIsFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Kamar
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Kamar', value: kamars.length, color: 'bg-slate-100' },
          {
            label: 'Tersedia',
            value: kamars.filter((k) => k.status === 'TERSEDIA').length,
            color: 'bg-emerald-50',
          },
          {
            label: 'Dihuni',
            value: kamars.filter((k) => k.status === 'DIHUNI').length,
            color: 'bg-blue-50',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.color} rounded-2xl p-5 flex items-center justify-between`}
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {s.label}
            </span>
            <span className="text-2xl font-bold text-slate-900">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Grid Kamar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {kamars.map((k) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <KamarCard
                kamar={k}
                strategy={state.activeStrategy}
                adminActions={
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(k)}
                      title="Edit Kamar"
                      className="p-2.5 bg-white text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(k)}
                      title="Hapus Kamar"
                      className="p-2.5 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      <KamarFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingKamar(null);
        }}
        editingKamar={editingKamar}
        onSave={handleSave}
      />

      {/* Delete Modal */}
      <DeleteKamarModal
        isOpen={isDeleteOpen}
        kamar={deletingKamar}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingKamar(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
