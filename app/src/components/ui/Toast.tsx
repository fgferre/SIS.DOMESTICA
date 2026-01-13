import * as React from 'react';
import { cn } from '@/utils/utils';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const bgColors = {
    success: 'border-success/30 text-success',
    error: 'border-danger/30 text-danger',
    warning: 'border-yellow-400/30 text-yellow-700 dark:text-yellow-200',
    info: 'border-secondary/30 text-secondary',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 text-sm rounded-lg shadow-lg animate-in slide-in-from-right-5 fade-in duration-300',
        'glass-panel border',
        bgColors[type]
      )}
    >
      <div className="flex-1 font-medium text-slate-900 dark:text-gray-100">{message}</div>
      <button
        onClick={onClose}
        className="hover:opacity-80 text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Simple Context for Toast
interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
