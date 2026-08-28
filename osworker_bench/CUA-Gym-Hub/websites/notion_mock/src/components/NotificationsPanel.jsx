import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { X, Bell, MessageSquare, Pencil, AtSign } from 'lucide-react';
import clsx from 'clsx';

const getRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

const getIcon = (type) => {
  switch (type) {
    case 'comment': return MessageSquare;
    case 'mention': return AtSign;
    default: return Pencil;
  }
};

export const NotificationsPanel = ({ onClose }) => {
  const { state, markNotificationRead } = useStore();
  const navigate = useNavigate();
  const ref = useRef(null);
  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleClick = (notif) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
    if (notif.pageId && state.pages[notif.pageId]) {
      navigate(`/page/${notif.pageId}`);
      onClose();
    }
  };

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Bell size={16} />
          Inbox
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadCount}</span>
          )}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bell size={32} className="mb-2" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map(notif => {
              const Icon = getIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  className={clsx('flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
                    !notif.read && 'bg-blue-50/50')}
                  onClick={() => handleClick(notif)}>
                  <div className="relative flex-shrink-0">
                    <img src={state.user.avatar} alt="" className="w-8 h-8 rounded-full" />
                    <div className={clsx('absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center',
                      notif.type === 'comment' ? 'bg-blue-100' : notif.type === 'mention' ? 'bg-purple-100' : 'bg-gray-100')}>
                      <Icon size={10} className={notif.type === 'comment' ? 'text-blue-600' : notif.type === 'mention' ? 'text-purple-600' : 'text-gray-600'} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{getRelativeTime(notif.timestamp)}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
