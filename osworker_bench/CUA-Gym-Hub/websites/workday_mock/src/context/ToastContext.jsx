import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const variants = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-600',
    iconColor: 'text-white',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-600',
    iconColor: 'text-white',
  },
  info: {
    icon: Info,
    bg: 'bg-primary',
    iconColor: 'text-white',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const addToast = useCallback((message, variant = 'success', duration = 4000) => {
    const id = ++idCounter.current;
    setToasts(prev => [...prev, { id, message, variant }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container - bottom right */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => {
          const v = variants[toast.variant] || variants.success;
          const Icon = v.icon;
          return (
            <div
              key={toast.id}
              className={`${v.bg} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[280px] max-w-[400px] pointer-events-auto animate-slide-in-right`}
            >
              <Icon size={18} className={v.iconColor} />
              <span className="flex-1 text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-0.5 hover:bg-white/20 rounded transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
