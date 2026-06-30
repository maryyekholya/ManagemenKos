import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Settings, Check, Trash2, ChevronRight } from 'lucide-react';
import { useApp } from '../../App';
import { cn, formatRupiah } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './UI';

export const SidebarUserActions: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const { state, dispatch } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBellShaking, setIsBellShaking] = useState(false);

  const user = state.currentUser;

  const filteredNotifs = state.notifications.filter(n => {
    if (!user) return false;
    if (n.recipient === 'all') return true;
    if (user.role === 'admin' && n.recipient === 'admin') return true;
    if (user.role === 'manager' && (n.recipient === 'manager' || n.recipient === 'admin')) return true; // Manager also sees admin notifs for payment
    return n.recipient === user.id;
  });

  const unreadCount = filteredNotifs.filter(n => !n.read).length;

  useEffect(() => {
    if (unreadCount > 0) {
      setIsBellShaking(true);
      const timer = setTimeout(() => setIsBellShaking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  if (!user) return null;

  const handleAction = (id: string, action: string) => {
    dispatch({ type: 'NOTIF_ACTION', payload: { id, action } });
    if (user.role === 'admin') {
      onNavigate('admin-booking');
    }
  };

  const handleMarkRead = () => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  };

  const handleNotificationClick = (n: any) => {
    setIsNotifOpen(false);
    
    if (user.role === 'admin') {
      if (n.type === 'PAYMENT_VERIFICATION_REQUEST') onNavigate('admin-pembayaran');
    } else if (user.role === 'manager') {
      if (n.type === 'PAYMENT_VERIFICATION_REQUEST') onNavigate('manager-verifikasi');
      if (n.type === 'NEW_COMPLAINT' || n.type === 'COMPLAINT_RESOLVED') onNavigate('manager-keluhan');
    } else {
      if (n.type === 'PAYMENT_CONFIRMED') onNavigate('user-bookings');
      if (n.type === 'COMPLAINT_RESOLVED') onNavigate('user-keluhan');
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="relative">
        <style>{`
          @keyframes bell-shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-15deg); }
            75% { transform: rotate(15deg); }
          }
          .animate-bell-shake { animation: bell-shake 0.5s ease-in-out infinite; }
        `}</style>
        <button 
          onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); if(!isNotifOpen) handleMarkRead(); }}
          className={cn(
            "relative p-3 text-slate-500 hover:bg-slate-50 rounded-full transition-all",
            isNotifOpen && "bg-slate-100 text-slate-800",
            isBellShaking && "animate-bell-shake"
          )}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isNotifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 md:-left-2 mt-4 w-80 glass-panel rounded-[2.5rem] overflow-hidden z-[100]"
            >
              <div className="p-6 border-b border-white/40 flex items-center justify-between bg-white/40">
                 <h4 className="font-bold text-slate-900">Notifikasi</h4>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{unreadCount} Baru</span>
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                 {filteredNotifs.length === 0 ? (
                   <div className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                         <Bell className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tidak ada notifikasi</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-50 text-left">
                     {filteredNotifs.map(n => (
                       <div 
                         key={n.id} 
                         onClick={() => handleNotificationClick(n)}
                         className={cn(
                           "p-6 transition-all relative group cursor-pointer hover:bg-slate-50",
                           !n.read && "bg-emerald-50/10",
                           n.priority === 'HIGH' && "bg-amber-50/40 border-l-[3px] border-l-amber-500"
                         )}
                       >
                          <div className="space-y-4">
                             <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                   {n.title && <p className="text-sm font-bold text-slate-900">{n.title}</p>}
                                   <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                                </div>
                                <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">Baru saja</span>
                             </div>

                             {n.type === 'PAYMENT_VERIFICATION_REQUEST' && (
                               <div className="bg-white/80 border border-amber-100 rounded-xl p-3 space-y-2">
                                  <div className="flex justify-between text-[10px]">
                                     <span className="text-slate-400 font-bold uppercase">Kamar</span>
                                     <span className="font-bold">{n.kamar_nomor}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px]">
                                     <span className="text-slate-400 font-bold uppercase">Total</span>
                                     <span className="font-bold text-emerald-600">{formatRupiah(n.amount || 0)}</span>
                                  </div>
                               </div>
                             )}

                             {n.action_required && n.actions && !n.read && (
                               <div className="flex gap-2">
                                  {n.actions.includes('KONFIRMASI') && (
                                    <Button 
                                      className="h-8 px-3 text-[10px] py-0 rounded-lg bg-emerald-600"
                                      onClick={(e) => { e.stopPropagation(); handleAction(n.id, 'KONFIRMASI'); }}
                                    >
                                      <Check className="w-3 h-3 mr-1" /> Konfirmasi
                                    </Button>
                                  )}
                                  {n.actions.includes('TOLAK') && (
                                    <Button 
                                      variant="secondary"
                                      className="h-8 px-3 text-[10px] py-0 rounded-lg bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                      onClick={(e) => { e.stopPropagation(); handleAction(n.id, 'TOLAK'); }}
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" /> Tolak
                                    </Button>
                                  )}
                               </div>
                             )}

                             {n.type === 'PAYMENT_CONFIRMED' && (
                                <Button 
                                  variant="ghost" 
                                  className="w-full justify-between h-10 px-4 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl"
                                  onClick={(e) => { e.stopPropagation(); onNavigate('user-bookings'); setIsNotifOpen(false); }}
                                >
                                   Lihat Detail Booking Saya <ChevronRight className="w-3 h-3" />
                                </Button>
                             )}
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-3 p-1.5 pl-4 bg-slate-50 border border-slate-200 rounded-full hover:shadow-sm transition-all"
        >
          <span className="text-sm font-bold text-slate-700">{user.name.split(' ')[0]}</span>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-full font-bold text-base shadow-inner overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </button>

        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full right-0 md:-right-2 mt-4 w-56 glass-panel rounded-3xl p-3 z-[100]"
            >
              <button onClick={() => { onNavigate(user.role === 'user' ? 'user-profile' : 'admin-settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-slate-700 hover:bg-white/60 rounded-xl transition-all">
                <Settings className="w-4 h-4" /> Pengaturan
              </button>
              <button onClick={() => { dispatch({ type: 'LOGOUT' }); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-600 hover:bg-red-50/80 rounded-xl transition-all">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
