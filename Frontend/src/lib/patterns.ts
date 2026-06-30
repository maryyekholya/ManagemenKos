import { 
  Kamar, 
  Booking, 
  RoomStatus, 
  PricingStrategyType, 
  PaymentMethod, 
  ComplaintPriority,
  Notification
} from '../types';

// ═══════════════════════════════
// [STATE MACHINE] — BookingMachine
// ═══════════════════════════════

export class BookingMachine {
  private static transitions: Record<RoomStatus, RoomStatus[]> = {
    'TERSEDIA': ['DIPESAN'],
    'DIPESAN': ['MENUNGGU_PEMBAYARAN', 'DIBATALKAN'],
    'MENUNGGU_PEMBAYARAN': ['DIKONFIRMASI', 'DIBATALKAN'],
    'DIKONFIRMASI': ['DIHUNI', 'DIBATALKAN'],
    'DIHUNI': ['SELESAI'],
    'SELESAI': [],
    'DIBATALKAN': []
  };

  public static getValidTransitions(current: RoomStatus): RoomStatus[] {
    return this.transitions[current] || [];
  }

  public static isValidTransition(current: RoomStatus, next: RoomStatus): boolean {
    return this.getValidTransitions(current).includes(next);
  }

  public static getStatusColor(status: RoomStatus): string {
    switch (status) {
      case 'TERSEDIA': return 'bg-emerald-100 text-emerald-700';
      case 'DIPESAN': return 'bg-yellow-100 text-yellow-700';
      case 'MENUNGGU_PEMBAYARAN': return 'bg-orange-100 text-orange-700';
      case 'DIKONFIRMASI': return 'bg-blue-100 text-blue-700';
      case 'DIHUNI': return 'bg-emerald-700 text-emerald-50 text-white';
      case 'SELESAI': return 'bg-slate-100 text-slate-500';
      case 'DIBATALKAN': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
