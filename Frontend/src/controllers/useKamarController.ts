/**
 * CONTROLLER LAYER — useKamarController
 *
 * MVC Role: Controller
 * Custom hook yang mengekspos operasi CRUD untuk entitas Kamar.
 * Memisahkan business logic dari komponen View.
 */

import { useCallback } from 'react';
import { useApp } from '../App';
import { Kamar } from '../types';
import {
  generateKamarId,
  validateKamar,
  KamarValidationError,
} from '../models/KamarModel';

export interface UseKamarControllerReturn {
  kamars: Kamar[];
  addKamar: (
    data: Omit<Kamar, 'id'>
  ) => Promise<{ success: boolean; errors: KamarValidationError[] }>;
  updateKamar: (
    id: string,
    data: Partial<Omit<Kamar, 'id'>>
  ) => Promise<{ success: boolean; errors: KamarValidationError[] }>;
  deleteKamar: (id: string) => Promise<void>;
  getKamarById: (id: string) => Kamar | undefined;
}

export const useKamarController = (): UseKamarControllerReturn => {
  const { state, dispatch } = useApp();

  // ── CREATE ────────────────────────────────────────
  const addKamar = useCallback(
    async (
      data: Omit<Kamar, 'id'>
    ): Promise<{ success: boolean; errors: KamarValidationError[] }> => {
      const errors = validateKamar(data);
      if (errors.length > 0) return { success: false, errors };

      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/admin/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${state.currentUser?.token}`
          },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (!response.ok || !result.success) {
           return { success: false, errors: [{ field: 'server', message: result.message || 'Gagal menambahkan kamar' }] };
        }

        dispatch({ type: 'ADD_KAMAR', payload: result.data });
        return { success: true, errors: [] };
      } catch (err) {
        return { success: false, errors: [{ field: 'server', message: 'Koneksi ke server gagal' }] };
      }
    },
    [dispatch, state.currentUser?.token]
  );

  // ── READ ──────────────────────────────────────────
  const getKamarById = useCallback(
    (id: string): Kamar | undefined =>
      state.kamars.find((k) => String(k.id) === String(id)),
    [state.kamars]
  );

  // ── UPDATE ────────────────────────────────────────
  const updateKamar = useCallback(
    async (
      id: string,
      data: Partial<Omit<Kamar, 'id'>>
    ): Promise<{ success: boolean; errors: KamarValidationError[] }> => {
      const errors = validateKamar(data);
      if (errors.length > 0) return { success: false, errors };

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/rooms/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${state.currentUser?.token}`
          },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (!response.ok || !result.success) {
           return { success: false, errors: [{ field: 'server', message: result.message || 'Gagal mengubah kamar' }] };
        }

        dispatch({ type: 'UPDATE_KAMAR', payload: { id, data: result.data } });
        return { success: true, errors: [] };
      } catch (err) {
        return { success: false, errors: [{ field: 'server', message: 'Koneksi ke server gagal' }] };
      }
    },
    [dispatch, state.currentUser?.token]
  );

  // ── DELETE ────────────────────────────────────────
  const deleteKamar = useCallback(
    async (id: string): Promise<void> => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/rooms/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${state.currentUser?.token}`
          }
        });
        const result = await response.json();
        if (result.success) {
           dispatch({ type: 'DELETE_KAMAR', payload: id });
        } else {
           alert(result.message || 'Gagal menghapus kamar');
        }
      } catch (err) {
        console.error('Delete failed', err);
        alert('Koneksi ke server gagal');
      }
    },
    [dispatch, state.currentUser?.token]
  );

  return {
    kamars: state.kamars,
    addKamar,
    updateKamar,
    deleteKamar,
    getKamarById,
  };
};
