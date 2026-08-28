import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsDropdown = () => {
  const { state, getUser, markNotificationRead, markAllNotificationsRead, setIsNotificationsOpen } = useApp();
  const notifications = state.notifications || [];
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = activeFilter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <span className="text-white text-xs">👍</span>;
      case 'comment': return <span className="text-white text-xs">💬</span>;
      case 'friend_request': return <span className="text-white text-xs">👥</span>;
      case 'birthday': return <span className="text-white text-xs">🎂</span>;
      case 'group': return <span className="text-white text-xs">📢</span>;
      case 'event': return <span className="text-white text-xs">📅</span>;
      case 'page': return <span className="text-white text-xs">📰</span>;
      case 'mention': return <span className="text-white text-xs">@</span>;
      default: return <span className="text-white text-xs">🔔</span>;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'like': return 'bg-blue-500';
      case 'comment': return 'bg-green-500';
      case 'friend_request': return 'bg-blue-600';
      case 'birthday': return 'bg-pink-500';
      case 'group': return 'bg-orange-500';
      case 'event': return 'bg-purple-500';
      case 'page': return 'bg-gray-600';
      case 'mention': return 'bg-teal-500';
      default: return 'bg-blue-500';
    }
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    setIsNotificationsOpen(false);

    if (notif.type === 'friend_request') {
      navigate('/friends');
    } else if (notif.type === 'group' && notif.groupId) {
      navigate('/groups');
    } else if (notif.type === 'event') {
      navigate('/events');
    } else if (notif.postId) {
      navigate('/');
    } else if (notif.pageId) {
      navigate(`/pages/${notif.pageId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="absolute top-12 right-0 w-[360px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Notifications</h3>
        <div
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
          title="Mark all as read"
          onClick={markAllNotificationsRead}
        >
          <MoreHorizontal size={20} />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-[15px] font-semibold ${activeFilter === 'all' ? 'bg-blue-100 text-primary' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-[15px] font-semibold ${activeFilter === 'unread' ? 'bg-blue-100 text-primary' : 'hover:bg-gray-100'}`}
            onClick={() => setActiveFilter('unread')}
          >
            Unread
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); markAllNotificationsRead(); }}
            className="text-primary text-[13px] font-semibold hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </div>
        ) : (
          filteredNotifications.map(notif => {
            const user = getUser(notif.userId);
            if (!user) return null;
            return (
              <div
                key={notif.id}
                className={`flex items-center gap-3 p-3 cursor-pointer relative rounded-lg mx-1 my-0.5 ${notif.read ? 'hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="relative flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className={`absolute bottom-0 right-0 w-7 h-7 ${getBadgeColor(notif.type)} rounded-full flex items-center justify-center border-2 border-white`}>
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] leading-snug">
                    <span className="font-bold">{user.name}</span> {notif.content}
                  </p>
                  <span className={`text-xs font-semibold ${notif.read ? 'text-gray-500' : 'text-primary'}`}>
                    {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                  </span>
                </div>
                {!notif.read && (
                  <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
