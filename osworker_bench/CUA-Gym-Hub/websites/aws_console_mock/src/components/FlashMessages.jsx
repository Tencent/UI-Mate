import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-green-50 border border-green-200 text-green-900',
  error: 'bg-red-50 border border-red-200 text-red-900',
  warning: 'bg-yellow-50 border border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border border-blue-200 text-blue-900',
};

const ICON_COLORS = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export default function FlashMessages() {
  const { state, dispatch } = useStore();
  const flashes = state.flash || [];

  useEffect(() => {
    if (flashes.length === 0) return;
    const timers = flashes.map(f => {
      return setTimeout(() => {
        dispatch({ type: 'DISMISS_FLASH', payload: f.id });
      }, 5000);
    });
    return () => timers.forEach(clearTimeout);
  }, [flashes, dispatch]);

  if (flashes.length === 0) return null;

  return (
    <div className="px-6 pt-4 space-y-2">
      {flashes.map(f => {
        const Icon = ICONS[f.type] || Info;
        return (
          <div key={f.id} className={`flex items-center gap-3 px-4 py-3 animate-fade-in ${STYLES[f.type] || STYLES.info}`} style={{ borderRadius: 12 }}>
            <Icon size={18} className={ICON_COLORS[f.type] || ICON_COLORS.info} />
            <span className="flex-1 text-sm font-medium">{f.message}</span>
            <button
              onClick={() => dispatch({ type: 'DISMISS_FLASH', payload: f.id })}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
