import React from 'react';
import { X, MessageCircle, RefreshCw, UserPlus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { state, dispatch } = useStore();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
      case 'mention':
        return <MessageCircle size={16} className="text-xira-blue" />;
      case 'status_change':
        return <RefreshCw size={16} className="text-xira-yellow" />;
      case 'assignment':
        return <UserPlus size={16} className="text-xira-green" />;
      default:
        return <MessageCircle size={16} className="text-gray-400" />;
    }
  };

  const handleMarkAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  const handleMarkRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const sortedNotifications = [...state.notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-xira-blue hover:underline"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">You're all caught up! No new notifications.</p>
          </div>
        ) : (
          sortedNotifications.map((notif) => {
            const actor = state.users.find((u) => u.id === notif.actorId);
            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`flex items-start gap-3 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notif.read ? 'bg-blue-50/50' : ''
                }`}
              >
                {/* Unread indicator */}
                <div className="flex-shrink-0 mt-1.5">
                  {!notif.read ? (
                    <div className="w-2 h-2 rounded-full bg-xira-blue" />
                  ) : (
                    <div className="w-2 h-2" />
                  )}
                </div>

                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {actor && (
                      <img
                        src={actor.avatar}
                        alt={actor.name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-xs font-medium text-gray-700">
                      {actor?.name || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt))} ago
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
