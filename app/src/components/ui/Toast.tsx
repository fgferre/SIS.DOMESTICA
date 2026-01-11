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
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center p-4 mb-4 text-sm border-l-4 rounded shadow-lg animate-in slide-in-from-right-5 fade-in duration-300',
        bgColors[type]
      )}
    >
      <div className="flex-1 font-medium">{message}</div>
      <button onClick={onClose} className="ml-3 hover:opacity-75">
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
