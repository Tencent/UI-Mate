
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} color="#04844B" />,
    error: <XCircle size={20} color="#EA001E" />,
    warning: <AlertCircle size={20} color="#fe9339" />,
    info: <Info size={20} color="#0176D3" />
  };

  return (
    <div className={`toast toast-${type}`}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ padding: 4 }}>
        <X size={16} />
      </button>
    </div>
  );
};
