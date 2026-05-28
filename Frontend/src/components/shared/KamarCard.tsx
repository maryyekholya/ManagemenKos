import React from 'react';
import { Bed, Users, Wifi, Wind, Tv, Coffee, User, Check } from 'lucide-react';
import { Kamar, PricingStrategyType } from '../../types';
import { PricingStrategy } from '../../lib/patterns';
import { formatRupiah, cn } from '../../lib/utils';
import { StatusBadge, Button } from './UI';

interface KamarCardProps {
  kamar: Kamar;
  strategy: PricingStrategyType;
  onBook?: (kamar: Kamar) => void;
  onSelect?: (kamar: Kamar) => void;
  adminActions?: React.ReactNode;
}

const facilityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'AC': Wind,
  'TV': Tv,
  'Kulkas': Coffee,
  'Kamar Mandi Dalam': User,
};

export const KamarCard: React.FC<KamarCardProps> = ({ kamar, strategy, onBook, onSelect, adminActions }) => {
  const finalPrice = PricingStrategy.calculate(kamar.harga_dasar, strategy);
  const isDiscounted = strategy !== 'Normal';

  return (
    <div className="group bg-white border border-slate-200 card-hover flex flex-col h-full">
      {/* Image Overlay */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={kamar.foto_url} 
          alt={`Kamar ${kamar.nomor}`} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <StatusBadge status={kamar.status} className="border-none" />
        </div>
        {adminActions && (
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
             {adminActions}
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="label-upper mb-1">{kamar.tipe}</div>
            <h3 className="text-xl font-medium text-slate-900">Room {kamar.nomor}</h3>
            <div className="flex items-center gap-4 text-[13px] text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> Fl. {kamar.lantai}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {kamar.kapasitas} Pax</span>
            </div>
          </div>
          <div className="text-right">
             {isDiscounted && (
               <p className="text-[11px] text-slate-400 line-through mb-0.5">{formatRupiah(kamar.harga_dasar)}</p>
             )}
             <p className="text-xl font-medium text-slate-900">{formatRupiah(finalPrice)}</p>
             {isDiscounted && (
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">{PricingStrategy.getLabel(strategy)}</p>
             )}
          </div>
        </div>

        <p className="text-sm text-slate-500 line-clamp-4 leading-relaxed mb-6">
          {kamar.description || kamar.deskripsi}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {kamar.fasilitas.slice(0, 3).map(f => {
            const Icon = facilityIcons[f] || Check;
            return (
              <span key={f} className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500">
                <Icon className="w-3 h-3" /> {f}
              </span>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 flex gap-4">
          <Button variant="secondary" className="flex-1 py-3" onClick={() => onSelect?.(kamar)}>
            View Details
          </Button>
          {kamar.status === 'TERSEDIA' && onBook && (
            <Button className="flex-1 py-3" onClick={() => onBook(kamar)}>
              Reserve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
