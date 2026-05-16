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
// [SINGLETON] — KamarRepository
// ═══════════════════════════════

export class KamarRepository {
  private static instance: KamarRepository;
  private kamars: Kamar[] = [];

  private constructor() {}

  public static getInstance(): KamarRepository {
    if (!KamarRepository.instance) {
      KamarRepository.instance = new KamarRepository();
    }
    return KamarRepository.instance;
  }

  public setKamars(data: Kamar[]) {
    this.kamars = data;
  }

  public getAllKamar(): Kamar[] {
    return this.kamars;
  }

  public getKamarById(id: string): Kamar | undefined {
    return this.kamars.find(k => k.id === id);
  }

  public updateKamar(id: string, data: Partial<Kamar>): void {
    this.kamars = this.kamars.map(k => k.id === id ? { ...k, ...data } : k);
  }
}

// ═══════════════════════════════
// [STRATEGY] — PricingStrategy
// ═══════════════════════════════

export class PricingStrategy {
  public static calculate(harga_dasar: number, type: PricingStrategyType): number {
    switch (type) {
      case 'Seasonal':
        return harga_dasar * 1.20;
      case 'Discount':
        return harga_dasar * 0.85;
      case 'Normal':
      default:
        return harga_dasar;
    }
  }

  public static getLabel(type: PricingStrategyType): string {
    switch (type) {
      case 'Seasonal':
        return 'Peak Season +20%';
      case 'Discount':
        return 'Promo -15%';
      case 'Normal':
      default:
        return 'Harga Normal';
    }
  }
}

// [STRATEGY] — ComplaintStrategy
export class ComplaintStrategy {
  public static route(text: string): { type: string; assignee: string; priority: ComplaintPriority } {
    const lower = text.toLowerCase();
    const techKeywords = ['wifi', 'listrik', 'ac', 'air', 'kunci', 'dingin', 'lambat'];
    const financeKeywords = ['bayar', 'tagihan', 'invoice', 'refund', 'salah', 'uang', 'kembali'];

    if (techKeywords.some(kw => lower.includes(kw))) {
      return { type: 'Tech', assignee: 'Tim Teknis', priority: 'HIGH' };
    }
    
    if (financeKeywords.some(kw => lower.includes(kw))) {
      return { type: 'Finance', assignee: 'Tim Keuangan', priority: 'MEDIUM' };
    }

    return { type: 'General', assignee: 'Manager', priority: 'LOW' };
  }
}

// ═══════════════════════════════
// [OBSERVER] — BookingPublisher
// ═══════════════════════════════

type Observer = (event: string, data: any) => void;

export class BookingPublisher {
  private static instance: BookingPublisher;
  private observers: Observer[] = [];

  private constructor() {}

  public static getInstance(): BookingPublisher {
    if (!BookingPublisher.instance) {
      BookingPublisher.instance = new BookingPublisher();
    }
    return BookingPublisher.instance;
  }

  public subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  public notify(event: string, data: any): void {
    this.observers.forEach(obs => obs(event, data));
  }
}

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
