import React, { useContext } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';
import { formatRelativeTime } from '../utils/helpers';
import { ShoppingCart, TrendingUp, Shield, Bell } from 'lucide-react';

const typeIcons = {
  trade_completed: ShoppingCart,
  price_alert: TrendingUp,
  security: Shield,
};

function NotificationDropdown({ onClose }) {
  const { state, markNotificationRead, markAllNotificationsRead } = useContext(CoinbaseContext);
  const notifications = state.notifications || [];

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleClickNotification = (notif) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-[#0052FF] hover:underline font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <button
                key={notif.id}
                onClick={() => handleClickNotification(notif)}
                className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                  !notif.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  !notif.read ? 'bg-[#EBF0FF]' : 'bg-gray-100'
                }`}>
                  <Icon size={14} className={!notif.read ? 'text-[#0052FF]' : 'text-gray-400'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatRelativeTime(notif.timestamp)}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-[#0052FF] rounded-full shrink-0 mt-1.5" />
                )}
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
