/**
 * CONTROLLER LAYER — useBookingController
 *
 * MVC Role: Controller
 * Custom hook untuk operasi manajemen Booking:
 * konfirmasi, penolakan, check-in, check-out, dan notifikasi.
 */

import { useCallback } from 'react';
import { useApp } from '../App';
import { Booking, RoomStatus } from '../types';
import { createStateHistoryEntry } from '../models/BookingModel';

export interface BookingActionPayload {
  booking: Booking;
  newStatus: RoomStatus;
  note?: string;
}

export interface UseBookingControllerReturn {
  bookings: Booking[];
  getBookingsByUser: (userId: string) => Booking[];
  getActiveBookings: () => Booking[];
  confirmBooking: (booking: Booking) => void;
  rejectBooking: (booking: Booking, reason: string) => void;
  checkInBooking: (booking: Booking) => void;
  checkOutBooking: (booking: Booking) => void;
  updateBookingStatus: (booking: Booking, status: RoomStatus, note?: string) => void;
}

export const useBookingController = (): UseBookingControllerReturn => {
  const { state, dispatch } = useApp();
  const actorName = state.currentUser?.name || 'Admin';
  const actorId = state.currentUser?.id;

  // ── Helper: update booking + kamar + notifikasi ──
  const updateBookingStatus = useCallback(
    (booking: Booking, status: RoomStatus, note?: string): void => {
      // 1. Update booking state
      dispatch({
        type: 'UPDATE_BOOKING',
        payload: {
          id: booking.id,
          data: {
            status,
            rejectionNote: note,
            stateHistory: [
              ...(booking.stateHistory || []),
              createStateHistoryEntry(status, actorName, note),
            ],
          },
        },
      });

      const kamar = state.kamars.find((k) => k.id === booking.kamar_id);
      const kamarNomor = kamar?.nomor || '???';

      // 2. Update kamar status
      if (status === 'DIKONFIRMASI') {
        dispatch({
          type: 'UPDATE_KAMAR',
          payload: { id: booking.kamar_id, data: { status: 'DIKONFIRMASI' } },
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `N-${Date.now()}`,
            type: 'PAYMENT_CONFIRMED',
            recipient: booking.user_id,
            title: 'Pembayaran Dikonfirmasi!',
            message: `Pembayaran untuk Kamar ${kamarNomor} telah diverifikasi.`,
            priority: 'MEDIUM',
            created_at: new Date().toISOString(),
            read: false,
            booking_id: booking.id,
          },
        });
      } else if (status === 'DIHUNI') {
        dispatch({
          type: 'UPDATE_KAMAR',
          payload: { id: booking.kamar_id, data: { status: 'DIHUNI' } },
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `N-${Date.now()}`,
            type: 'CHECK_IN_SUCCESS',
            recipient: booking.user_id,
            title: 'Selamat Datang!',
            message: `Check-in berhasil. Selamat menempati Kamar ${kamarNomor}.`,
            priority: 'LOW',
            created_at: new Date().toISOString(),
            read: false,
            booking_id: booking.id,
          },
        });
      } else if (status === 'SELESAI') {
        dispatch({
          type: 'UPDATE_KAMAR',
          payload: { id: booking.kamar_id, data: { status: 'TERSEDIA' } },
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `N-${Date.now()}`,
            type: 'STAY_COMPLETED',
            recipient: booking.user_id,
            title: 'Sewa Selesai',
            message: `Terima kasih telah bersama NestIn. Kamar ${kamarNomor} telah dikosongkan.`,
            priority: 'LOW',
            created_at: new Date().toISOString(),
            read: false,
            booking_id: booking.id,
          },
        });
      } else if (status === 'MENUNGGU_PEMBAYARAN' && note) {
        // Penolakan pembayaran
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `N-${Date.now()}`,
            type: 'PAYMENT_REJECTED',
            recipient: booking.user_id,
            title: 'Pembayaran Ditolak',
            message: `Pembayaran Anda tidak dapat diverifikasi. Alasan: ${note}`,
            priority: 'HIGH',
            created_at: new Date().toISOString(),
            read: false,
            booking_id: booking.id,
          },
        });
      }
    },
    [dispatch, state.kamars, actorName]
  );

  const confirmBooking = useCallback(
    (booking: Booking) => updateBookingStatus(booking, 'DIKONFIRMASI'),
    [updateBookingStatus]
  );

  const rejectBooking = useCallback(
    (booking: Booking, reason: string) =>
      updateBookingStatus(booking, 'MENUNGGU_PEMBAYARAN', reason),
    [updateBookingStatus]
  );

  const checkInBooking = useCallback(
    (booking: Booking) => updateBookingStatus(booking, 'DIHUNI'),
    [updateBookingStatus]
  );

  const checkOutBooking = useCallback(
    (booking: Booking) => updateBookingStatus(booking, 'SELESAI'),
    [updateBookingStatus]
  );

  // ── Queries ───────────────────────────────────────
  const getBookingsByUser = useCallback(
    (userId: string) => state.bookings.filter((b) => b.user_id === userId),
    [state.bookings]
  );

  const getActiveBookings = useCallback(
    () =>
      state.bookings.filter((b) =>
        ['DIPESAN', 'MENUNGGU_PEMBAYARAN', 'DIKONFIRMASI', 'DIHUNI'].includes(
          b.status
        )
      ),
    [state.bookings]
  );

  return {
    bookings: state.bookings,
    getBookingsByUser,
    getActiveBookings,
    confirmBooking,
    rejectBooking,
    checkInBooking,
    checkOutBooking,
    updateBookingStatus,
  };
};
