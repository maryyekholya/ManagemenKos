import React from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingMachine } from '../../lib/patterns';
import { RoomStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const StatusBadge: React.FC<{ status: RoomStatus; className?: string }> = ({ status, className }) => {
  return (
    <span className={cn(
      "px-2 py-0.5 border border-slate-200 text-[10px] font-bold uppercase tracking-widest bg-white",
      className
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}> = ({ isOpen, onClose, title, children, size = 'md', closeOnOverlayClick = true }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn("relative w-full bg-white shadow-2xl overflow-hidden rounded-3xl", sizes[size])}
        >
          <div className="flex items-center justify-between p-8 border-b border-slate-100">
            <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-0 max-h-[85vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}> = ({ variant = 'primary', isLoading, className, children, ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center gap-2'
  };

  return (
    <button 
      className={cn(variants[variant], isLoading && "opacity-70 cursor-not-allowed", className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

export const FormInput: React.FC<{
  label: string;
  error?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>> = ({ label, error, icon, className, ...props }) => {
  const InputComponent = props.type === 'textarea' ? 'textarea' : 'input';
  
  return (
    <div className="space-y-2 w-full">
      <label className="label-upper block ml-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <InputComponent
          {...props as any}
          className={cn(
            "w-full px-4 py-3 bg-white border border-slate-200 outline-hidden focus:border-slate-800 transition-all text-sm",
            icon && "pl-11",
            error && "border-red-500 focus:border-red-500",
            className
          )}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 ml-1 font-bold uppercase tracking-wider">{error}</p>}
    </div>
  );
};
