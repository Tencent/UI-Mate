import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let globalToastFn = null;

export function showToast(message, type = 'info') {
  if (globalToastFn) globalToastFn(message, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  globalToastFn = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 16 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
