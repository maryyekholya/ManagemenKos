import React, { useState, useEffect } from 'react';
import { Home, Bed, Bell, LogOut, Menu, X, User as UserIcon, Settings, FileText, ClipboardList, Check, Trash2, ChevronRight } from 'lucide-react';
import { User, Role, Notification } from '../../types';
import { cn, formatRupiah } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './UI';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
  notifications: Notification[];
  onAction: (notifId: string, action: string) => void;
  onMarkRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, activeView, onNavigate, notifications, onAction, onMarkRead }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBellShaking, setIsBellShaking] = useState(false);

  const filteredNotifs = notifications.filter(n => {
    if (!user) return false;
    if (n.recipient === 'all') return true;
    if (user.role === 'admin' && n.recipient === 'admin') return true;
    return n.recipient === user.id;
  });

  const unreadCount = filteredNotifs.filter(n => !n.read).length;

  // Shake bell on new unread notification
  useEffect(() => {
    if (unreadCount > 0) {
      setIsBellShaking(true);
      const timer = setTimeout(() => setIsBellShaking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const navItemsByRole: Record<Role, { label: string; view: string; icon: any }[]> = {
    guest: [
      { label: 'Beranda', view: 'landing', icon: Home },
      { label: 'Kamar', view: 'landing-rooms', icon: Bed },
      { label: 'Cek Booking', view: 'status-checker', icon: ClipboardList },
    ],
    user: [
      { label: 'Dashboard', view: 'user-dashboard', icon: Home },
      { label: 'Sewa Kamar', view: 'landing-rooms', icon: Bed },
      { label: 'Booking Saya', view: 'user-bookings', icon: ClipboardList },
      { label: 'Keluhan', view: 'user-keluhan', icon: FileText },
    ],
    admin: [
      { label: 'Dashboard', view: 'admin-dashboard', icon: Home },
      { label: 'Manajemen Kamar', view: 'admin-kamar', icon: Bed },
      { label: 'Booking', view: 'admin-booking', icon: ClipboardList },
      { label: 'Pembayaran', view: 'admin-payment', icon: Settings },
    ],
    manager: [
      { label: 'Dashboard', view: 'manager-dashboard', icon: Home },
      { label: 'Kanban Board', view: 'manager-kanban', icon: Bed },
      { label: 'Keluhan', view: 'manager-keluhan', icon: FileText },
    ],
    organizer: [
      { label: 'Portal', view: 'organizer-dashboard', icon: Home },
      { label: 'Koordinasi', view: 'organizer-coordination', icon: ClipboardList },
    ]
  };

  const navItems = navItemsByRole[user?.role || 'guest'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-bottom border-slate-100 h-20 flex items-center px-6 md:px-12">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
        <span className="text-lg font-bold text-slate-900 tracking-[-0.02em] lowercase">nestin</span>
      </div>

      <div className="hidden md:flex items-center gap-8 ml-16">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={cn(
              "text-sm font-semibold transition-all hover:text-emerald-600 relative py-2",
              activeView === item.view ? "text-emerald-600" : "text-slate-500"
            )}
          >
            {item.label}
            {activeView === item.view && (
              <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {user ? (
          <>
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
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); if(!isNotifOpen) onMarkRead(); }}
                className={cn(
                  "relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all",
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
                    className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                       <h4 className="font-bold text-slate-900">Notifikasi</h4>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{unreadCount} Baru</span>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                       {filteredNotifs.length === 0 ? (
                         <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                               <Bell className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tidak ada notifikasi</p>
                         </div>
                       ) : (
                         <div className="divide-y divide-slate-50">
                           {filteredNotifs.map(n => (
                             <div 
                               key={n.id} 
                               className={cn(
                                 "p-6 transition-all relative group",
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

                                   {/* Specific Details for Payment Requests */}
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

                                   {/* Action Buttons */}
                                   {n.action_required && n.actions && !n.read && (
                                     <div className="flex gap-2">
                                        {n.actions.includes('KONFIRMASI') && (
                                          <Button 
                                            className="h-8 px-3 text-[10px] py-0 rounded-lg bg-emerald-600"
                                            onClick={() => onAction(n.id, 'KONFIRMASI')}
                                          >
                                            <Check className="w-3 h-3 mr-1" /> Konfirmasi
                                          </Button>
                                        )}
                                        {n.actions.includes('TOLAK') && (
                                          <Button 
                                            variant="secondary"
                                            className="h-8 px-3 text-[10px] py-0 rounded-lg bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                            onClick={() => onAction(n.id, 'TOLAK')}
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
                                        onClick={() => { onNavigate('user-bookings'); setIsNotifOpen(false); }}
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
                className="flex items-center gap-2 p-1 pl-3 bg-slate-50 border border-slate-200 rounded-full hover:shadow-sm transition-all"
              >
                <span className="text-xs font-bold text-slate-700">{user.name.split(' ')[0]}</span>
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-full font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2"
                  >
                    <button onClick={() => { onNavigate(user.role === 'user' ? 'user-profile' : 'admin-settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                      <Settings className="w-4 h-4" /> Pengaturan
                    </button>
                    <button onClick={() => { onLogout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 p-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('register')} 
              className="text-slate-600 px-4 py-2 text-sm font-bold hover:text-slate-900 transition-all"
            >
              Daftar
            </button>
            <button 
              onClick={() => onNavigate('login')} 
              className="bg-slate-900 px-6 py-2.5 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all active:scale-95"
            >
              Mulai Sekarang
            </button>
          </div>
        )}
        
        <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl">
           <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-50 bg-white p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold lowercase">nestin</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {navItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => { onNavigate(item.view); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all",
                    activeView === item.view ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-6 h-6" /> {item.label}
                </button>
              ))}
              {user && (
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-red-600 hover:bg-red-50 transition-all">
                   <LogOut className="w-6 h-6" /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
