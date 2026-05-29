/**
 * VIEW LAYER — AdminKeluhan
 *
 * MVC Role: View
 * Halaman manajemen keluhan yang sebelumnya TIDAK ADA di AdminDashboard.
 * Menggunakan useKeluhanController untuk update status.
 */

import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Filter } from 'lucide-react';
import { Keluhan, ComplaintStatus } from '../../types';
import { useKeluhanController } from '../../controllers/useKeluhanController';
import { Button, Modal, FormInput, StatusBadge } from '../../components/shared/UI';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Status badge untuk keluhan
const ComplaintBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  const config = {
    OPEN: { label: 'Open', className: 'bg-red-100 text-red-700' },
    IN_PROGRESS: { label: 'Dalam Proses', className: 'bg-amber-100 text-amber-700' },
    RESOLVED: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700' },
  };
  const { label, className } = config[status];
  return (
    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${className}`}>
      {label}
    </span>
  );
};

const PriorityIcon: React.FC<{ priority: string }> = ({ priority }) => {
  if (priority === 'HIGH') return <AlertCircle className="w-4 h-4 text-red-500" />;
  if (priority === 'MEDIUM') return <Clock className="w-4 h-4 text-amber-500" />;
  return <CheckCircle2 className="w-4 h-4 text-slate-300" />;
};

// ──────────────────────────────────────
// UPDATE STATUS MODAL
// ──────────────────────────────────────

const UpdateStatusModal: React.FC<{
  isOpen: boolean;
  keluhan: Keluhan | null;
  onClose: () => void;
  onUpdate: (id: string, status: ComplaintStatus, assignedTo?: string) => void;
  onResolve: (id: string) => void;
}> = ({ isOpen, keluhan, onClose, onUpdate, onResolve }) => {
  const [assignedTo, setAssignedTo] = useState(keluhan?.assigned_to || '');

  React.useEffect(() => {
    if (keluhan) setAssignedTo(keluhan.assigned_to || '');
  }, [keluhan]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Status Keluhan" size="md">
      {keluhan && (
        <div className="space-y-6 p-2">
          {/* Keluhan Info */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {keluhan.id} • Kamar {keluhan.kamar_nomor}
                </p>
                <h4 className="font-bold text-slate-900">{keluhan.user_name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <PriorityIcon priority={keluhan.priority} />
                <ComplaintBadge status={keluhan.status} />
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{keluhan.deskripsi}</p>
          </div>

          {/* Assign To */}
          <FormInput
            label="Ditugaskan ke"
            placeholder="Tim Teknis / Tim Keuangan / ..."
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
          />

          {/* Status Actions */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Update Status
            </p>
            <div className="grid grid-cols-1 gap-2">
              {keluhan.status === 'OPEN' && (
                <Button
                  variant="secondary"
                  className="w-full justify-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => { onUpdate(keluhan.id, 'IN_PROGRESS', assignedTo); onClose(); }}
                >
                  <Clock className="w-4 h-4" /> Tandai Dalam Proses
                </Button>
              )}
              {(keluhan.status === 'OPEN' || keluhan.status === 'IN_PROGRESS') && (
                <Button
                  className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-none text-white"
                  onClick={() => { onResolve(keluhan.id); onClose(); }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
                </Button>
              )}
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={onClose}>
            Tutup
          </Button>
        </div>
      )}
    </Modal>
  );
};

// ──────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────

export const AdminKeluhan: React.FC = () => {
  const { keluhans, updateKeluhanStatus, resolveKeluhan } = useKeluhanController();
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [selectedKeluhan, setSelectedKeluhan] = useState<Keluhan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = filterStatus === 'ALL'
    ? keluhans
    : keluhans.filter(k => k.status === filterStatus);

  const stats = {
    total: keluhans.length,
    open: keluhans.filter(k => k.status === 'OPEN').length,
    inProgress: keluhans.filter(k => k.status === 'IN_PROGRESS').length,
    resolved: keluhans.filter(k => k.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="label-upper mb-1">Keluhan Tenant</div>
          <h1 className="text-3xl font-normal leading-tight">Manajemen Keluhan</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-50', text: 'text-slate-700' },
          { label: 'Open', value: stats.open, color: 'bg-red-50', text: 'text-red-700' },
          { label: 'Dalam Proses', value: stats.inProgress, color: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Selesai', value: stats.resolved, color: 'bg-emerald-50', text: 'text-emerald-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-5`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-full border transition-all',
              filterStatus === status
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-500 hover:border-slate-400'
            )}
          >
            {status === 'ALL' ? 'Semua' : status === 'IN_PROGRESS' ? 'Dalam Proses' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Keluhan List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold">Tidak ada keluhan</p>
            </div>
          ) : (
            filtered.map((k) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:border-slate-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      <PriorityIcon priority={k.priority} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">{k.user_name}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Kamar {k.kamar_nomor}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">#{k.id}</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{k.deskripsi}</p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] text-slate-400">
                          Ditugaskan: <span className="font-bold text-slate-600">{k.assigned_to}</span>
                        </span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(k.created_at).toLocaleDateString('id-ID')}
                        </span>
                        {k.resolved_at && (
                          <>
                            <span className="text-[10px] text-slate-300">→</span>
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Selesai {new Date(k.resolved_at).toLocaleDateString('id-ID')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <ComplaintBadge status={k.status} />
                    {k.status !== 'RESOLVED' && (
                      <Button
                        variant="secondary"
                        className="h-8 px-4 text-[10px]"
                        onClick={() => {
                          setSelectedKeluhan(k);
                          setIsModalOpen(true);
                        }}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Update Modal */}
      <UpdateStatusModal
        isOpen={isModalOpen}
        keluhan={selectedKeluhan}
        onClose={() => { setIsModalOpen(false); setSelectedKeluhan(null); }}
        onUpdate={updateKeluhanStatus}
        onResolve={resolveKeluhan}
      />
    </div>
  );
};
