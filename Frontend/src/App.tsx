import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { 
  Kamar, Booking, Keluhan, Payment, Notification, User, Role, AppConfig,
  PricingStrategyType
} from './types';
import { 
  INITIAL_KAMAR, INITIAL_BOOKINGS, INITIAL_KELUHAN, 
  INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS, DEFAULT_CONFIG, DEMO_USERS 
} from './lib/constants';
import { BookingPublisher, BookingMachine } from './lib/patterns';
import { Navbar } from './components/shared/Navbar';
import { PageTransition } from './components/shared/PageTransition';
import { LandingPage } from './views/guest/LandingPage';
import { BookingFlow } from './views/guest/BookingFlow';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { UserDashboard } from './views/user/UserDashboard';
import { Modal, Button, FormInput } from './components/shared/UI';
import { LogIn, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { ManagerDashboard } from './views/manager/ManagerDashboard';
import { OrganizerDashboard } from './views/organizer/OrganizerDashboard';
import { StatusChecker } from './views/guest/StatusChecker';

// ═══════════════════════════════
// CONTEXT DEFINITION
// ═══════════════════════════════

interface AppState {
  currentUser: User | null;
  users: User[];
  kamars: Kamar[];
  bookings: Booking[];
  keluhans: Keluhan[];
  payments: Payment[];
  notifications: Notification[];
  activeStrategy: PricingStrategyType;
  config: AppConfig;
  currentView: string;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<any>;
} | null>(null);

function appReducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case 'SET_USER': return { ...state, currentUser: action.payload };
    case 'UPDATE_USER': {
      const updatedUsers = state.users.map(u => u.id === action.payload.id ? { ...u, ...action.payload.data } : u);
      const isCurrentUser = state.currentUser?.id === action.payload.id;
      return { 
        ...state, 
        users: updatedUsers,
        currentUser: isCurrentUser ? { ...state.currentUser!, ...action.payload.data } : state.currentUser
      };
    }
    case 'ADD_USER': return { ...state, users: [...state.users, action.payload] };
    case 'VERIFY_USER': return { ...state, users: state.users.map(u => u.email === action.payload ? { ...u, isVerified: true } : u) };
    case 'LOGOUT': return { ...state, currentUser: null, currentView: 'landing' };
    case 'SET_VIEW': return { ...state, currentView: action.payload };
    case 'UPDATE_KAMAR': return { ...state, kamars: state.kamars.map(k => k.id === action.payload.id ? { ...k, ...action.payload.data } : k) };
    case 'ADD_BOOKING': return { ...state, bookings: [action.payload, ...state.bookings] };
    case 'UPDATE_BOOKING': return { ...state, bookings: state.bookings.map(b => b.id === action.payload.id ? { ...b, ...action.payload.data } : b) };
    case 'ADD_PAYMENT': return { ...state, payments: [action.payload, ...state.payments] };
    case 'ADD_KELUHAN': return { ...state, keluhans: [action.payload, ...state.keluhans] };
    case 'UPDATE_KELUHAN': return { ...state, keluhans: state.keluhans.map(k => k.id === action.payload.id ? { ...k, ...action.payload.data } : k) };
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATIONS_READ': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'SET_STRATEGY': return { ...state, activeStrategy: action.payload };
    case 'UPDATE_CONFIG': return { ...state, config: { ...state.config, ...action.payload } };
    case 'NOTIF_ACTION': {
      const { id, action: type } = action.payload;
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true, action_required: false } : n)
      };
    }
    default: return state;
  }
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// ═══════════════════════════════
// MAIN ROOT COMPONENT
// ═══════════════════════════════

export default function App() {
  const [state, dispatch] = useReducer(appReducer, {
    currentUser: null,
    users: DEMO_USERS.map(u => ({ id: u.id, name: u.name, email: u.email, password: u.password, isVerified: true, role: u.role as Role })),
    kamars: INITIAL_KAMAR,
    bookings: INITIAL_BOOKINGS,
    keluhans: INITIAL_KELUHAN,
    payments: INITIAL_PAYMENTS,
    notifications: INITIAL_NOTIFICATIONS,
    activeStrategy: 'Normal',
    config: DEFAULT_CONFIG,
    currentView: 'landing'
  });

  const [bookingTarget, setBookingTarget] = useState<Kamar | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);

  // [OBSERVER] Initialize Booking Notifications
  useEffect(() => {
    const publisher = BookingPublisher.getInstance();
    publisher.subscribe((event, data) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `N${Date.now()}`,
          type: event,
          message: data.message || `Event: ${event}`,
          read: false,
          created_at: new Date().toISOString()
        }
      });
    });
  }, []);

  const handleLogin = (email: string, pass: string) => {
    // Check in users state (which includes both demo and newly registered)
    const userMatch = state.users.find(u => u.email === email && u.password === pass);
    
    if (userMatch) {
      if (!userMatch.isVerified) {
        setVerifyingEmail(email);
        dispatch({ type: 'SET_VIEW', payload: 'verify-email' });
        return;
      }

      dispatch({ type: 'SET_USER', payload: userMatch });
      const rolesToView: Record<Role, string> = {
        guest: 'landing',
        user: 'user-dashboard',
        admin: 'admin-dashboard',
        manager: 'manager-dashboard',
        organizer: 'organizer-dashboard'
      };
      
      // If no mapping for specific view, default based on role
      const view = rolesToView[userMatch.role] || 'landing';
      dispatch({ type: 'SET_VIEW', payload: view });
      return;
    }

    // Fallback error handling could be added here (e.g., set alert)
    alert('Email atau Password salah.');
  };

  const handleRegister = async (name: string, email: string, phone: string, pass: string) => {
    const newUser: User = {
      id: `USR${Date.now()}`,
      name,
      email,
      phone,
      password: pass,
      isVerified: false,
      role: 'user',
    };

    try {
      // Call Backend API to send verification email
      await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
    } catch (err) {
      console.error("Gagal mengirim email verifikasi:", err);
    }

    dispatch({ type: 'ADD_USER', payload: newUser });
    setVerifyingEmail(email);
    setRegistrationSuccess(true);
  };

  const renderView = () => {
    if (state.currentView === 'login') return <LoginPage onLogin={handleLogin} onRegisterOpen={() => dispatch({ type: 'SET_VIEW', payload: 'register' })} onCancel={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })} />;
    if (state.currentView === 'verify-email' && verifyingEmail) {
      return (
        <VerifyEmailPage 
          email={verifyingEmail} 
          onVerify={() => {
            dispatch({ type: 'VERIFY_USER', payload: verifyingEmail });
            setVerifyingEmail(null);
            dispatch({ type: 'SET_VIEW', payload: 'login' });
          }}
          onCancel={() => {
            setVerifyingEmail(null);
            dispatch({ type: 'SET_VIEW', payload: 'landing' });
          }}
        />
      );
    }
    if (state.currentView === 'register') return (
      <RegisterPage 
        onRegister={handleRegister} 
        onLoginOpen={() => dispatch({ type: 'SET_VIEW', payload: 'login' })} 
        onCancel={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
        registrationSuccess={registrationSuccess}
        onCloseSuccess={() => {
          setRegistrationSuccess(false);
          dispatch({ type: 'SET_VIEW', payload: 'verify-email' });
        }}
      />
    );
    if (state.currentView === 'status-checker') return <StatusChecker />;
    if (state.currentView === 'manager-dashboard') return <ManagerDashboard />;
    if (state.currentView === 'organizer-dashboard') return <OrganizerDashboard />;
    
    if (state.currentView === 'landing' || state.currentView === 'landing-rooms') {
      return (
        <LandingPage 
          kamars={state.kamars} 
          activeStrategy={state.activeStrategy} 
          dispatch={dispatch}
          onBook={(k) => {
            if (!state.currentUser) {
              dispatch({ type: 'SET_VIEW', payload: 'register' });
            } else {
              setBookingTarget(k);
              dispatch({ type: 'SET_VIEW', payload: 'booking-flow' });
            }
          }}
        />
      );
    }
    
    if (state.currentView === 'booking-flow' && bookingTarget) {
      return (
        <BookingFlow 
          kamar={bookingTarget} 
          strategy={state.activeStrategy}
          onCancel={() => { setBookingTarget(null); dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' }); }}
          onComplete={(booking) => {
            dispatch({ type: 'ADD_BOOKING', payload: booking });
            dispatch({ type: 'UPDATE_KAMAR', payload: { id: booking.kamar_id, data: { status: 'DIPESAN' } } });
            BookingPublisher.getInstance().notify('BOOKING_CREATED', { message: `Pemesanan baru untuk Kamar ${state.kamars.find(k => k.id === booking.kamar_id)?.nomor}` });
            setBookingTarget(null);
            dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
          }}
        />
      );
    }

    switch (state.currentUser?.role) {
      case 'admin':
        return <AdminDashboard onNavigate={(v) => dispatch({ type: 'SET_VIEW', payload: v })} />;
      case 'user':
        return <UserDashboard onNavigate={(v) => dispatch({ type: 'SET_VIEW', payload: v })} />;
      case 'manager':
        return <ManagerDashboard />;
      case 'organizer':
        return <OrganizerDashboard />;
      default:
        return (
          <LandingPage 
            kamars={state.kamars} 
            activeStrategy={state.activeStrategy} 
            dispatch={dispatch}
            onBook={(k) => {
              if (!state.currentUser) {
                dispatch({ type: 'SET_VIEW', payload: 'register' });
              } else {
                setBookingTarget(k);
                dispatch({ type: 'SET_VIEW', payload: 'booking-flow' });
              }
            }}
          />
        );
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Navbar 
        user={state.currentUser}
        notifications={state.notifications}
        activeView={state.currentView}
        onNavigate={(v) => dispatch({ type: 'SET_VIEW', payload: v })}
        onLogout={() => dispatch({ type: 'LOGOUT' })}
        onMarkRead={() => dispatch({ type: 'MARK_NOTIFICATIONS_READ' })}
        onAction={(id, action) => {
          const notif = state.notifications.find(n => n.id === id);
          if (notif && action === 'KONFIRMASI') {
            dispatch({ type: 'NOTIF_ACTION', payload: { id, action } });
            // This is just marking as read, the actual logic is in Part 4 (AdminDashboard)
            // But let's handle the direct click from notif too
            if (state.currentUser?.role === 'admin') {
              dispatch({ type: 'SET_VIEW', payload: 'admin-booking' });
            }
          }
        }}
      />
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <PageTransition pageKey={state.currentView}>
            {renderView()}
          </PageTransition>
        </AnimatePresence>
      </main>
    </AppContext.Provider>
  );
}

// ═══════════════════════════════
// LOGIN PAGE COMPONENT
// ═══════════════════════════════

const LoginPage: React.FC<{ 
  onLogin: (e: string, p: string) => void; 
  onRegisterOpen: () => void;
  onCancel: () => void 
}> = ({ onLogin, onRegisterOpen, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="hidden lg:flex flex-1 bg-slate-100 items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200 rounded-full translate-y-1/2 -translate-x-1/2 opacity-20" />
        
        <div className="relative z-10 space-y-8 text-slate-900 max-w-lg">
           <div className="flex items-center gap-4">
              <span className="text-4xl font-bold lowercase tracking-tight">nestin</span>
           </div>
           <h2 className="display-text !text-4xl">Your minimalist management <span>experience begins here.</span></h2>
           <p className="text-slate-500 text-lg">Platform manajemen property terlengkap untuk pemilik dan tenant modern di Indonesia.</p>
        </div>
      </div>
      
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h3 className="text-3xl font-bold font-sans">Selamat Datang</h3>
            <p className="text-slate-500 mt-2">Silakan masuk untuk melanjutkan akses NestIn.</p>
          </div>

          <div className="space-y-4">
            <FormInput label="Email" placeholder="admin@nestin.id" value={email} onChange={e => setEmail(e.target.value)} />
            <FormInput label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <div className="flex justify-between items-center text-sm font-bold">
               <button className="text-emerald-600">Lupa Password?</button>
               <button onClick={onCancel} className="text-slate-400">Kembali ke Beranda</button>
            </div>
            <Button className="w-full py-4 text-lg" onClick={() => onLogin(email, password)}>Masuk</Button>
            <p className="text-center text-sm text-slate-500">
               Belum memiliki akun? <button onClick={onRegisterOpen} className="text-emerald-600 font-bold hover:underline">Daftar Sekarang</button>
            </p>
          </div>

          <div className="relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
             <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Akun Demo</span></div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_USERS.map(u => (
              <button 
                key={u.email}
                onClick={() => { setEmail(u.email); setPassword(u.password); }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left"
              >
                <div>
                   <p className="text-sm font-bold capitalize">{u.role}</p>
                   <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                </div>
                <LogIn className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════
// REGISTER PAGE COMPONENT
// ═══════════════════════════════

const VerifyEmailPage: React.FC<{ email: string; onVerify: () => void; onCancel: () => void }> = ({ email, onVerify, onCancel }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center space-y-8"
      >
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50">
           <Check className="w-10 h-10" />
        </div>
        <div className="space-y-4">
           <h2 className="text-3xl font-bold font-serif">Verifikasi Email</h2>
           <p className="text-slate-500">
             Instruksi verifikasi telah dikirimkan ke <br/>
             <span className="font-bold text-slate-900">{email}</span>
           </p>
           <p className="text-sm text-slate-400">
             Silakan klik tombol di bawah ini untuk mensimulasikan proses verifikasi email dan melanjutkan ke halaman login.
           </p>
        </div>
        
        <div className="space-y-4">
           <Button className="w-full py-4 text-lg" onClick={onVerify}>Verifikasi Sekarang</Button>
           <button onClick={onCancel} className="text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors">
              Batal
           </button>
        </div>
        
        <div className="pt-6 border-t border-slate-50 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
           Sistem Simulasi NestIn
        </div>
      </motion.div>
    </div>
  );
};

const RegisterPage: React.FC<{ 
  onRegister: (n: string, e: string, ph: string, pa: string) => void; 
  onLoginOpen: () => void;
  onCancel: () => void;
  registrationSuccess: boolean;
  onCloseSuccess: () => void;
}> = ({ onRegister, onLoginOpen, onCancel, registrationSuccess, onCloseSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Success Modal */}
      <Modal 
        isOpen={registrationSuccess} 
        onClose={onCloseSuccess} 
        title="Registrasi Berhasil"
      >
        <div className="text-center py-8 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Akun Anda Berhasil Terdaftar!</h3>
            <p className="text-slate-500">Silakan periksa email Anda untuk memverifikasi akun sebelum dapat masuk ke sistem.</p>
          </div>
          <Button className="w-full py-4 text-lg" onClick={onCloseSuccess}>
            Lanjut ke Verifikasi Email
          </Button>
        </div>
      </Modal>

      <div className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full translate-y-1/2 -translate-x-1/2 opacity-20" />
        
        <div className="relative z-10 space-y-8 text-white max-w-lg">
           <div className="flex items-center gap-4">
              <span className="text-4xl font-bold lowercase tracking-tight">nestin</span>
           </div>
           <h2 className="display-text !text-4xl text-white">Join the future of <br/><span>property management.</span></h2>
           <p className="text-slate-400 text-lg">Daftar sekarang untuk mulai mencari dan melakukan booking kamar kos impian Anda dengan mudah.</p>
        </div>
      </div>
      
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h3 className="text-3xl font-bold font-sans">Buat Akun Baru</h3>
            <p className="text-slate-500 mt-2">Lengkapi data diri Anda untuk memulai pengalaman bersama NestIn.</p>
          </div>

          <div className="space-y-4">
            <FormInput label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={name} onChange={e => setName(e.target.value)} />
            <FormInput label="Email" type="email" placeholder="contoh@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <FormInput label="Nomor Telepon" placeholder="0812xxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
            <FormInput label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            
            <div className="flex justify-end items-center text-sm font-bold">
               <button onClick={onCancel} className="text-slate-400">Kembali ke Beranda</button>
            </div>
            
            <Button className="w-full py-4 text-lg" onClick={() => onRegister(name, email, phone, password)}>Daftar Sekarang</Button>
            
            <p className="text-center text-sm text-slate-500">
               Sudah memiliki akun? <button onClick={onLoginOpen} className="text-emerald-600 font-bold hover:underline">Masuk Di Sini</button>
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
             <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                * Dengan mendaftar, Anda menyetujui seluruh Syarat & Ketentuan serta Kebijakan Privasi NestIn Boarding House.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
