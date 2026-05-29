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
  ) => { success: boolean; errors: KamarValidationError[] };
  updateKamar: (
    id: string,
    data: Partial<Omit<Kamar, 'id'>>
  ) => { success: boolean; errors: KamarValidationError[] };
  deleteKamar: (id: string) => void;
  getKamarById: (id: string) => Kamar | undefined;
}

export const useKamarController = (): UseKamarControllerReturn => {
  const { state, dispatch } = useApp();

  // ── CREATE ────────────────────────────────────────
  const addKamar = useCallback(
    (
      data: Omit<Kamar, 'id'>
    ): { success: boolean; errors: KamarValidationError[] } => {
      const errors = validateKamar(data);
      if (errors.length > 0) return { success: false, errors };

      const newKamar: Kamar = {
        ...data,
        id: generateKamarId(),
      };

      dispatch({ type: 'ADD_KAMAR', payload: newKamar });
      return { success: true, errors: [] };
    },
    [dispatch]
  );

  // ── READ ──────────────────────────────────────────
  const getKamarById = useCallback(
    (id: string): Kamar | undefined =>
      state.kamars.find((k) => k.id === id),
    [state.kamars]
  );

  // ── UPDATE ────────────────────────────────────────
  const updateKamar = useCallback(
    (
      id: string,
      data: Partial<Omit<Kamar, 'id'>>
    ): { success: boolean; errors: KamarValidationError[] } => {
      const errors = validateKamar(data);
      if (errors.length > 0) return { success: false, errors };

      dispatch({ type: 'UPDATE_KAMAR', payload: { id, data } });
      return { success: true, errors: [] };
    },
    [dispatch]
  );

  // ── DELETE ────────────────────────────────────────
  const deleteKamar = useCallback(
    (id: string): void => {
      dispatch({ type: 'DELETE_KAMAR', payload: id });
    },
    [dispatch]
  );

  return {
    kamars: state.kamars,
    addKamar,
    updateKamar,
    deleteKamar,
    getKamarById,
  };
};
