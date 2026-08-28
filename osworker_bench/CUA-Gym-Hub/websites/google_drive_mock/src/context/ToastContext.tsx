import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface Toast {
  id: string;
  message: string;
  undoAction?: () => void;
}

interface ToastContextType {
  showToast: (message: string, undoAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timerRefs.current[id]) {
      clearTimeout(timerRefs.current[id]);
      delete timerRefs.current[id];
    }
  }, []);

  const showToast = useCallback((message: string, undoAction?: () => void) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-2), { id, message, undoAction }]);
    timerRefs.current[id] = setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[100] pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-4 bg-[#323232] text-white text-sm px-4 py-3 rounded-lg shadow-lg pointer-events-auto animate-in slide-in-from-bottom-4 duration-200"
            style={{ minWidth: '280px', maxWidth: '400px' }}
          >
            <span className="flex-1">{toast.message}</span>
            {toast.undoAction && (
              <button
                onClick={() => {
                  toast.undoAction!();
                  removeToast(toast.id);
                }}
                className="text-[#8AB4F8] font-medium hover:text-blue-300 uppercase text-xs tracking-wide flex-shrink-0"
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
