import React from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { state, markAlertRead, markAllAlertsRead } = useStore();
  const navigate = useNavigate();
  const unreadCount = state.alerts ? state.alerts.filter(a => !a.read).length : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAlertsRead()}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden">
        {state.alerts && state.alerts.length > 0 ? state.alerts.map(alert => (
          <div
            key={alert.id}
            onClick={() => {
              markAlertRead(alert.id);
              if (alert.symbol) navigate(`/stock/${alert.symbol}`);
            }}
            className={`px-6 py-4 border-b border-surface-hover cursor-pointer hover:bg-surface-hover transition-colors ${
              !alert.read ? 'bg-surface-hover/30' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                !alert.read ? 'bg-primary' : 'bg-text-muted/30'
              }`} />
              <div className="flex-1">
                <div className="font-medium">{alert.title}</div>
                <div className="text-sm text-text-muted mt-1">{alert.message}</div>
                <div className="text-xs text-text-muted mt-2">
                  {new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="px-6 py-12 text-center text-text-muted">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}
