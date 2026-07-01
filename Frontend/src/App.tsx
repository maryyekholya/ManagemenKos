import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { 
  Kamar, Booking, Keluhan, Payment, Notification, User, Role, AppConfig,
  PricingStrategyType
} from './types';
import { 
  INITIAL_KAMAR, INITIAL_BOOKINGS, INITIAL_KELUHAN, 
  INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS, DEFAULT_CONFIG, DEMO_USERS 
} from './lib/constants';
import { BookingMachine } from './lib/patterns';
import { Navbar } from './components/shared/Navbar';
import { PageTransition } from './components/shared/PageTransition';
import { LandingPage } from './views/guest/LandingPage';
import { BookingFlow } from './views/guest/BookingFlow';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { UserDashboard } from './views/user/UserDashboard';
import { Modal, Button, FormInput } from './components/shared/UI';
import { LogIn, Check, Eye, EyeOff, KeyRound, ArrowLeft, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { ManagerDashboard } from './views/manager/ManagerDashboard';

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
    case 'DELETE_USER': return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case 'VERIFY_USER': return { ...state, users: state.users.map(u => u.email === action.payload ? { ...u, isVerified: true } : u) };
    case 'LOGOUT': {
      if (window.location.hash !== '#login') {
        window.history.pushState({ view: 'login' }, '', '#login');
      }
      return { ...state, currentUser: null, currentView: 'login' };
    }
    case 'SET_VIEW': {
      if (window.location.hash !== `#${action.payload}`) {
        window.history.pushState({ view: action.payload }, '', `#${action.payload}`);
      }
      return { ...state, currentView: action.payload };
    }
    case 'UPDATE_KAMAR': return { ...state, kamars: state.kamars.map(k => k.id === action.payload.id ? { ...k, ...action.payload.data } : k) };
    case 'ADD_KAMAR': return { ...state, kamars: [...state.kamars, action.payload] };
    case 'DELETE_KAMAR': return { ...state, kamars: state.kamars.filter(k => k.id !== action.payload) };
    case 'SET_KAMARS': return { ...state, kamars: action.payload };
    case 'ADD_BOOKING': return { ...state, bookings: [action.payload, ...state.bookings] };
    case 'UPDATE_BOOKING': return { ...state, bookings: state.bookings.map(b => b.id === action.payload.id ? { ...b, ...action.payload.data } : b) };
    case 'SET_BOOKINGS': return { ...state, bookings: action.payload };
    case 'ADD_PAYMENT': return { ...state, payments: [action.payload, ...state.payments] };
    case 'ADD_KELUHAN': return { ...state, keluhans: [action.payload, ...state.keluhans] };
    case 'UPDATE_KELUHAN': return { ...state, keluhans: state.keluhans.map(k => k.id === action.payload.id ? { ...k, ...action.payload.data } : k) };
    case 'SET_KELUHANS': return { ...state, keluhans: action.payload };
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
    currentUser: null, // Will be hydrated by useEffect
    users: [],
    kamars: [],
    bookings: [],
    keluhans: [],
    payments: [],
    notifications: [],
    activeStrategy: 'Normal',
    config: DEFAULT_CONFIG,
    currentView: 'landing'
  });

  const [bookingTarget, setBookingTarget] = useState<Kamar | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
  const [backVariant, setBackVariant] = useState<'slideLeft' | 'slideRight' | undefined>();
  const [isInitializing, setIsInitializing] = useState(true);

  // Auth Hydration
  useEffect(() => {
    const token = localStorage.getItem('nestin_token');
    if (!token) {
      setIsInitializing(false);
      return;
    }

    fetch('http://127.0.0.1:8000/api/v1/auth/me', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.user) {
        dispatch({ type: 'SET_USER', payload: data.user });
      } else {
        localStorage.removeItem('nestin_token');
      }
    })
    .catch(err => {
      console.error('Failed to hydrate auth:', err);
      localStorage.removeItem('nestin_token');
    })
    .finally(() => {
      setIsInitializing(false);
    });
  }, []);

  useEffect(() => {
    if (state.currentUser?.token) {
      localStorage.setItem('nestin_token', state.currentUser.token);
    } else {
      localStorage.removeItem('nestin_token');
    }
  }, [state.currentUser]);

  useEffect(() => {
    // Menangani sinkronisasi URL Hash agar tombol Back pada Browser berfungsi (History API)
    const handlePopState = (e: PopStateEvent) => {
      const hashView = window.location.hash.replace('#', '');
      if (hashView && hashView !== state.currentView) {
        // Enforce route protection
        const protectedViews = [
          'user-dashboard', 'user-bookings', 'user-profile', 'user-history', 'user-payments', 'user-keluhan',
          'admin-dashboard', 'admin-kamar', 'admin-booking', 'admin-payment', 'admin-keluhan', 'admin-chat', 'admin-laporan', 'admin-pengaturan', 'admin-akun', 'admin-akun-tambah',
          'manager-dashboard', 'manager-kanban', 'manager-keluhan'
        ];
        const publicViews = ['login', 'register', 'status']; // Removed 'landing', 'landing-rooms' so users can view them

        if (protectedViews.includes(hashView) && !state.currentUser) {
           // Not logged in, redirect to landing
           window.history.replaceState({ view: 'landing' }, '', '#landing');
           dispatch({ type: 'SET_VIEW', payload: 'landing' });
           return;
        }

        if (state.currentUser && publicViews.includes(hashView)) {
           // Logged in, don't allow going back to landing/login
           const rolesToView: Record<Role, string> = {
              guest: 'landing',
              user: 'user-dashboard',
              admin: 'admin-dashboard',
              manager: 'manager-dashboard'
           };
           const view = rolesToView[state.currentUser.role] || 'landing';
           window.history.replaceState({ view }, '', `#${view}`);
           dispatch({ type: 'SET_VIEW', payload: view });
           return;
        }

        setBackVariant('slideLeft'); // Default animasi untuk tombol back browser
        dispatch({ type: 'SET_VIEW', payload: hashView });
        setTimeout(() => setBackVariant(undefined), 600);
      }
    };
    
    // Inisialisasi hash pertama kali jika ada
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && initialHash !== state.currentView) {
      dispatch({ type: 'SET_VIEW', payload: initialHash });
    } else {
      window.history.replaceState({ view: state.currentView }, '', `#${state.currentView}`);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.currentView]);

  // Fetch rooms from backend on mount and when strategy changes
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/v1/rooms?pricing_strategy=${state.activeStrategy.toUpperCase()}`, {
      headers: { 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        // Map displayPrice from backend to harga_aktif and ensure fasilitas is an array
        const kamarsWithPricing = data.data.map((r: any) => {
          let parsedFasilitas = r.fasilitas;
          if (typeof parsedFasilitas === 'string') {
            try {
              const parsed = JSON.parse(parsedFasilitas);
              parsedFasilitas = Array.isArray(parsed) ? parsed : parsedFasilitas.split(',').map((s: string) => s.trim());
            } catch(e) {
              parsedFasilitas = parsedFasilitas.split(',').map((s: string) => s.trim());
            }
          } else if (!Array.isArray(parsedFasilitas)) {
            parsedFasilitas = [];
          }

          return {
            ...r,
            fasilitas: parsedFasilitas,
            harga_aktif: r.displayPrice || r.harga_dasar
          };
        });
        dispatch({ type: 'SET_KAMARS', payload: kamarsWithPricing });
      }
    })
    .catch(err => console.error('Failed to fetch rooms:', err));
  }, [state.activeStrategy]);

  // Fetch user bookings from backend on load/login
  useEffect(() => {
    if (state.currentUser?.token) {
      // Fetch Bookings
      const bookingUrl = (state.currentUser.role === 'admin' || state.currentUser.role === 'manager')
        ? 'http://127.0.0.1:8000/api/v1/admin/bookings'
        : 'http://127.0.0.1:8000/api/v1/bookings';

      fetch(bookingUrl, {
        headers: {
          'Authorization': `Bearer ${state.currentUser.token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          dispatch({ type: 'SET_BOOKINGS', payload: data.data });
        }
      })
      .catch(err => console.error('Failed to fetch bookings:', err));

      // Fetch Complaints
      fetch('http://127.0.0.1:8000/api/v1/complaints', {
        headers: {
          'Authorization': `Bearer ${state.currentUser.token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Map to match frontend structure temporarily if needed, but it should be fine.
          const mappedKeluhans = data.data.map((c: any) => ({
            id: c.id.toString(),
            user_name: c.user?.name || 'User',
            kategori: c.kategori,
            deskripsi: c.deskripsi,
            status: c.status,
            created_at: c.created_at,
            resolved_at: c.updated_at !== c.created_at ? c.updated_at : null,
            assigned_to: 'Staff Maintenance',
            priority: c.kategori === 'FASILITAS' ? 'HIGH' : (c.kategori === 'ADMINISTRASI' ? 'MEDIUM' : 'LOW')
          }));
          dispatch({ type: 'SET_KELUHANS', payload: mappedKeluhans });
        }
      })
      .catch(err => console.error('Failed to fetch user complaints:', err));
    }
  }, [state.currentUser?.token]);

  const handleLogin = async (email: string, pass: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Email atau Password salah.');
        return;
      }

      dispatch({ type: 'SET_USER', payload: data.user });
      
      const rolesToView: Record<Role, string> = {
        guest: 'landing',
        user: 'user-dashboard',
        admin: 'admin-dashboard',
        manager: 'manager-dashboard'
      };
      
      const view = rolesToView[data.user.role as Role] || 'landing';
      dispatch({ type: 'SET_VIEW', payload: view });
      
    } catch (err) {
      console.error('Login error:', err);
      alert('Koneksi ke server gagal. Pastikan backend berjalan.');
    }
  };

  const handleRegister = async (name: string, email: string, phone: string, pass: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: pass })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Pendaftaran gagal.');
        return;
      }

      setVerifyingEmail(data.user.email);
      setRegistrationSuccess(true);
      
      // Redirect to email verification page
      dispatch({ type: 'SET_VIEW', payload: 'verify-email' });
      
    } catch (err) {
      console.error("Gagal register:", err);
      alert('Koneksi ke server gagal. Pastikan backend berjalan.');
    }
  };

  const handleGoogleLoginMock = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: 'budi.santoso@gmail.com', name: 'Budi Santoso (Google)' })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Gagal login google mock.');
        return;
      }
      dispatch({ type: 'SET_USER', payload: data.user });
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
    } catch (err) {
      console.error(err);
      alert('Koneksi gagal');
    }
  };

  const renderView = () => {
    if (state.currentView === 'login') return (
      <LoginPage 
        onLogin={handleLogin} 
        onGoogleLogin={handleGoogleLoginMock}
        onRegisterOpen={() => {
          setBackVariant(undefined);
          dispatch({ type: 'SET_VIEW', payload: 'register' });
        }} 
        onCancel={() => {
          setBackVariant('slideRight');
          dispatch({ type: 'SET_VIEW', payload: 'landing' });
          setTimeout(() => setBackVariant(undefined), 600);
        }} 
      />
    );
    if (state.currentView === 'verify-email' && verifyingEmail) {
      return (
        <VerifyEmailPage 
          email={verifyingEmail} 
          onVerify={async (otp) => {
            try {
              const res = await fetch('http://127.0.0.1:8000/api/v1/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email: verifyingEmail, otp })
              });
              const data = await res.json();
              if (!res.ok || !data.success) {
                alert(data.message || 'OTP Salah.');
                return;
              }
              dispatch({ type: 'VERIFY_USER', payload: verifyingEmail });
              setVerifyingEmail(null);
              dispatch({ type: 'SET_VIEW', payload: 'login' });
            } catch (e) {
               alert('Error verifikasi');
            }
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
        onLoginOpen={() => {
          setBackVariant(undefined);
          dispatch({ type: 'SET_VIEW', payload: 'login' });
        }} 
        onCancel={() => {
          setBackVariant('slideLeft');
          dispatch({ type: 'SET_VIEW', payload: 'landing' });
          setTimeout(() => setBackVariant(undefined), 600);
        }}
        registrationSuccess={registrationSuccess}
        onCloseSuccess={() => {
          setRegistrationSuccess(false);
          dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
        }}
      />
    );
    if (state.currentView === 'manager-dashboard') return <ManagerDashboard onNavigate={(v) => dispatch({ type: 'SET_VIEW', payload: v })} />;
    
    if (state.currentView === 'landing' || state.currentView === 'landing-rooms') {
      const hasActiveBooking = state.bookings.some(b => ['DIPESAN', 'MENUNGGU_PEMBAYARAN', 'DIKONFIRMASI', 'DIHUNI'].includes(b.status));

      return (
        <LandingPage 
          kamars={state.kamars} 
          activeStrategy={state.activeStrategy} 
          dispatch={dispatch}
          activeView={state.currentView}
          hasActiveBooking={hasActiveBooking}
          onBook={(k) => {
            if (!state.currentUser) {
              dispatch({ type: 'SET_VIEW', payload: 'register' });
            } else if (hasActiveBooking) {
              alert('Anda sudah memiliki pesanan kamar yang aktif. Anda hanya dapat memesan maksimal 1 kamar.');
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
            const existing = state.bookings.find(b => String(b.id) === String(booking.id));
            if (existing) {
              dispatch({ type: 'UPDATE_BOOKING', payload: { id: booking.id, data: booking } });
            } else {
              dispatch({ type: 'ADD_BOOKING', payload: booking });
            }
            dispatch({ type: 'UPDATE_KAMAR', payload: { id: booking.kamar_id, data: { status: booking.status } } });
            dispatch({ type: 'ADD_NOTIFICATION', payload: {
              id: `NOTIF-${Date.now()}`,
              user_id: 'admin', // send to admin
              title: 'Pesanan Baru',
              message: `Pemesanan baru untuk Kamar ${state.kamars.find((k: Kamar) => k.id === booking.kamar_id)?.nomor}`,
              type: 'info',
              is_read: false,
              created_at: new Date().toISOString()
            } });
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
        return <ManagerDashboard onNavigate={(v) => dispatch({ type: 'SET_VIEW', payload: v })} />;
      default:
        return (
          <LandingPage 
            kamars={state.kamars} 
            activeStrategy={state.activeStrategy} 
            dispatch={dispatch}
            activeView={state.currentView}
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

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

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
            // Aksi konfirmasi notifikasi. Logika utama saat ini diarahkan ke halaman admin-booking jika pengguna adalah admin.
            if (state.currentUser?.role === 'admin') {
              dispatch({ type: 'SET_VIEW', payload: 'admin-booking' });
            }
          }
        }}
      />
      <main className="min-h-screen pt-20">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition pageKey={state.currentView} variant={backVariant}>
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
  onGoogleLogin: () => void;
  onRegisterOpen: () => void;
  onCancel: () => void 
}> = ({ onLogin, onGoogleLogin, onRegisterOpen, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Forgot Password State ──
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'sent'>('input');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/forgot-password', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
         body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotLoading(false);
      if (data.success) {
         if (data.local_otp) {
            console.log("MOCK OTP DITERIMA:", data.local_otp);
            alert("MOCK OTP DITERIMA: " + data.local_otp); // Untuk kemudahan traceback lokal
         }
         setForgotStep('sent');
      } else {
         alert(data.message || 'Terjadi kesalahan.');
      }
    } catch(err) {
      setForgotLoading(false);
      alert('Koneksi error');
    }
  };

  const handleForgotClose = () => {
    setShowForgot(false);
    // Reset state setelah modal ditutup
    setTimeout(() => {
      setForgotEmail('');
      setForgotStep('input');
    }, 300);
  };

  const handleLogin = () => {
    setError('');
    if (!email || !password) { setError('Email dan password wajib diisi.'); return; }
    
    // Validasi format email secara sederhana (Frontend validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email, password);
    }, 400);
  };

  const handleGoogleLoginClick = () => {
    setIsLoading(true);
    onGoogleLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* ── Back Button (Top Right) ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={onCancel}
        className="absolute top-6 right-6 z-[60] flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all group"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
        <span>Kembali ke Beranda</span>
      </motion.button>

      {/* ── Branding Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
        className="hidden lg:flex flex-1 bg-slate-100 items-center justify-center p-20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200 rounded-full translate-y-1/2 -translate-x-1/2 opacity-20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 space-y-8 text-slate-900 max-w-lg"
        >
           <div className="flex items-center gap-4">
              <span className="text-4xl font-bold lowercase tracking-tight">nestin</span>
           </div>
           <h2 className="display-text !text-4xl">Your minimalist management <span>experience begins here.</span></h2>
           <p className="text-slate-500 text-lg">Platform manajemen property terlengkap untuk pemilik dan tenant modern di Indonesia.</p>
        </motion.div>
      </motion.div>
      
      {/* ── Form Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
        className="flex-1 bg-white flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold font-sans">Selamat Datang</h3>
            <p className="text-slate-500 mt-2">Silakan masuk untuk melanjutkan akses NestIn.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="space-y-4"
          >
            <FormInput label="Email" placeholder="Masukkan email Anda" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
            <div className="space-y-2 w-full">
              <label className="label-upper block ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 outline-hidden focus:border-slate-800 transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
                  tabIndex={-1}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            <div className="flex justify-start items-center text-sm font-bold">
               <button 
                 className="text-emerald-600 hover:underline"
                 onClick={() => setShowForgot(true)}
               >
                 Lupa Password?
               </button>
            </div>
            <Button
              className={`w-full py-4 text-lg transition-all ${ isLoading ? 'opacity-70 cursor-wait' : '' }`}
              onClick={handleLogin}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>

            <div className="relative py-2 flex items-center">
               <div className="flex-grow border-t border-slate-200"></div>
               <span className="shrink-0 px-4 text-xs text-slate-400 uppercase tracking-widest font-bold">Atau</span>
               <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <Button
              variant="secondary"
              className="w-full py-4 text-lg flex items-center justify-center gap-3 transition-all"
              onClick={handleGoogleLoginClick}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </Button>
            <p className="text-center text-sm text-slate-500">
               Belum memiliki akun? <button onClick={onRegisterOpen} className="text-emerald-600 font-bold hover:underline">Daftar Sekarang</button>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Forgot Password Modal ── */}
      <ForgotPasswordModal
        isOpen={showForgot}
        step={forgotStep}
        email={forgotEmail}
        loading={forgotLoading}
        onEmailChange={setForgotEmail}
        onSubmit={handleForgotSubmit}
        onClose={handleForgotClose}
      />
    </div>
  );
};

// ── Forgot Password Modal (inline helper component) ──
const ForgotPasswordModal: React.FC<{
  isOpen: boolean;
  step: 'input' | 'sent';
  email: string;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}> = ({ isOpen, step, email, loading, onEmailChange, onSubmit, onClose }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleReset = async () => {
      if(!otp || !newPassword) return;
      setResetLoading(true);
      try {
         const res = await fetch('http://127.0.0.1:8000/api/v1/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, token: otp, password: newPassword })
         });
         const data = await res.json();
         if(res.ok && data.success) {
            alert('Password berhasil direset. Silakan login dengan password baru.');
            onClose();
         } else {
            alert(data.message || 'Token tidak valid.');
         }
      } catch (err) {
         alert('Error koneksi.');
      } finally {
         setResetLoading(false);
      }
  };

  return (
  <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
    <div className="p-2">
      {step === 'input' ? (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Lupa Password?</h3>
              <p className="text-xs text-slate-400 mt-0.5">Masukkan email untuk menerima link reset.</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Terdaftar</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={e => onEmailChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1">
              Kirim Link Reset
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Masukkan OTP & Password Baru</h3>
            <p className="text-sm text-slate-500">
              Kami telah mengirim link reset password ke{' '}
              <span className="font-bold text-slate-700">{email}</span>.
            </p>
          </div>
          <div className="space-y-3 text-left">
             <input type="text" placeholder="Masukkan 6-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
             <input type="password" placeholder="Password Baru Minimal 8 Karakter" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
          </div>
          <Button isLoading={resetLoading} className="w-full" onClick={handleReset}>
            Reset Password
          </Button>
        </div>
      )}
    </div>
  </Modal>
  );
};

// Render modal Lupa Password di bawah komponen LoginPage tidak bisa karena tidak ada return statement terpisah.
// Modal dirender inline di dalam return LoginPage.
// Catatan: Tambahan modal di bawah (setelah </div> utama, sebelum penutup).

// ═══════════════════════════════
// REGISTER PAGE COMPONENT
// ═══════════════════════════════

const VerifyEmailPage: React.FC<{ email: string; onVerify: (otp: string) => void; onCancel: () => void }> = ({ email, onVerify, onCancel }) => {
  const [otp, setOtp] = useState('123456');

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
             (Untuk local traceback, OTP default adalah 123456)
           </p>
           <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="w-full text-center tracking-[0.5em] text-xl font-mono px-4 py-3 border border-slate-200 rounded-xl outline-none" />
        </div>
        
        <div className="space-y-4">
           <Button className="w-full py-4 text-lg" onClick={() => onVerify(otp)}>Verifikasi Sekarang</Button>
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
  const [error, setError] = useState('');

  const handleRegisterSubmit = () => {
    setError('');
    if (!name || !email || !phone || !password) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid.');
      return;
    }
    onRegister(name, email, phone, password);
  };

  const handleGoogleRegister = () => {
    alert('Simulasi: Redirect ke halaman Registrasi Google...');
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* ── Back Button (Top Right) ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={onCancel}
        className="absolute top-6 right-6 z-[60] flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all group"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
        <span>Kembali ke Beranda</span>
      </motion.button>

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

      {/* ── Branding Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
        className="hidden lg:flex flex-1 bg-slate-900 items-center justify-center p-20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full translate-y-1/2 -translate-x-1/2 opacity-20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 space-y-8 text-white max-w-lg"
        >
           <div className="flex items-center gap-4">
              <span className="text-4xl font-bold lowercase tracking-tight">nestin</span>
           </div>
           <h2 className="display-text !text-4xl text-white">Join the future of <br/><span>property management.</span></h2>
           <p className="text-slate-400 text-lg">Daftar sekarang untuk mulai mencari dan melakukan booking kamar kos impian Anda dengan mudah.</p>
        </motion.div>
      </motion.div>
      
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h3 className="text-3xl font-bold font-sans">Buat Akun Baru</h3>
            <p className="text-slate-500 mt-2">Lengkapi data diri Anda untuk memulai pengalaman bersama NestIn.</p>
          </div>

          <div className="space-y-4">
            <FormInput label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={name} onChange={e => setName(e.target.value)} />
            <FormInput label="Email" type="email" placeholder="contoh@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <FormInput label="Nomor Telepon" placeholder="0812xxxxxx" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} />
            <FormInput label="Password" type="password" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
            
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            <Button className="w-full py-4 text-lg mt-4" onClick={handleRegisterSubmit}>Daftar Sekarang</Button>
            
            <div className="relative py-2 flex items-center">
               <div className="flex-grow border-t border-slate-200"></div>
               <span className="shrink-0 px-4 text-xs text-slate-400 uppercase tracking-widest font-bold">Atau</span>
               <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <Button
              variant="secondary"
              className="w-full py-4 text-lg flex items-center justify-center gap-3 transition-all"
              onClick={handleGoogleRegister}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Daftar dengan Google
            </Button>

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
