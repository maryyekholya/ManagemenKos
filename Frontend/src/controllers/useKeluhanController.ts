/**
 * CONTROLLER LAYER — useKeluhanController
 *
 * MVC Role: Controller
 * Custom hook untuk operasi manajemen Keluhan:
 * assign, update status, resolve.
 */

import { useCallback } from 'react';
import { useApp } from '../App';
import { Keluhan, ComplaintStatus, ComplaintPriority } from '../types';

export interface UseKeluhanControllerReturn {
  keluhans: Keluhan[];
  getOpenKeluhans: () => Keluhan[];
  getKeluhansByStatus: (status: ComplaintStatus) => Keluhan[];
  updateKeluhanStatus: (
    id: string,
    status: ComplaintStatus,
    assignedTo?: string
  ) => void;
  resolveKeluhan: (id: string) => void;
  addKeluhan: (data: Omit<Keluhan, 'id' | 'created_at' | 'resolved_at'>) => void;
}

export const useKeluhanController = (): UseKeluhanControllerReturn => {
  const { state, dispatch } = useApp();

  // ── CREATE ────────────────────────────────────────
  const addKeluhan = useCallback(
    (data: Omit<Keluhan, 'id' | 'created_at' | 'resolved_at'>): void => {
      const newKeluhan: Keluhan = {
        ...data,
        id: `KEL${Date.now().toString().slice(-6)}`,
        created_at: new Date().toISOString(),
        resolved_at: null,
      };
      dispatch({ type: 'ADD_KELUHAN', payload: newKeluhan });

      // Notifikasi admin
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `N-KEL-${Date.now()}`,
          type: 'KELUHAN_NEW',
          recipient: 'admin',
          title: 'Keluhan Baru',
          message: `Keluhan baru dari ${data.user_name}: ${data.deskripsi.slice(0, 60)}...`,
          priority: data.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          created_at: new Date().toISOString(),
          read: false,
        },
      });
    },
    [dispatch]
  );

  // ── UPDATE STATUS ─────────────────────────────────
  const updateKeluhanStatus = useCallback(
    (id: string, status: ComplaintStatus, assignedTo?: string): void => {
      dispatch({
        type: 'UPDATE_KELUHAN',
        payload: {
          id,
          data: {
            status,
            ...(assignedTo ? { assigned_to: assignedTo } : {}),
          },
        },
      });
    },
    [dispatch]
  );

  // ── RESOLVE ───────────────────────────────────────
  const resolveKeluhan = useCallback(
    (id: string): void => {
      dispatch({
        type: 'UPDATE_KELUHAN',
        payload: {
          id,
          data: {
            status: 'RESOLVED' as ComplaintStatus,
            resolved_at: new Date().toISOString(),
          },
        },
      });
    },
    [dispatch]
  );

  // ── QUERIES ───────────────────────────────────────
  const getOpenKeluhans = useCallback(
    () => state.keluhans.filter((k) => k.status === 'OPEN'),
    [state.keluhans]
  );

  const getKeluhansByStatus = useCallback(
    (status: ComplaintStatus) =>
      state.keluhans.filter((k) => k.status === status),
    [state.keluhans]
  );

  return {
    keluhans: state.keluhans,
    getOpenKeluhans,
    getKeluhansByStatus,
    updateKeluhanStatus,
    resolveKeluhan,
    addKeluhan,
  };
};
