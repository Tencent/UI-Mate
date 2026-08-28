import React from 'react';
import { useStore } from '../context/StoreContext';
import { MoreHorizontal, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function getNotificationActionLabel(type) {
  switch (type) {
    case 'like': return 'React';
    case 'comment': return 'Reply';
    case 'connection_request': return 'View';
    case 'connection_accept': return 'View profile';
    case 'profile_view': return 'View';
    case 'endorsement': return 'View';
    case 'job_alert': return 'View job';
    case 'mention': return 'View post';
    default: return 'View';
  }
}

function getNotificationIcon(type) {
  switch (type) {
    case 'like': return '\uD83D\uDC4D';
    case 'comment': return '\uD83D\uDCAC';
    case 'connection_request': return '\uD83D\uDC64';
    case 'connection_accept': return '\u2705';
    case 'profile_view': return '\uD83D\uDC41\uFE0F';
    case 'endorsement': return '\u2B50';
    case 'job_alert': return '\uD83D\uDCBC';
    case 'mention': return '\uD83D\uDD14';
    default: return '\uD83D\uDD14';
  }
}

function getNotificationDestination(notif) {
  switch (notif.type) {
    case 'like':
    case 'comment':
    case 'mention':
      // Navigate to feed; scroll to the post if possible
      return notif.targetId ? `/?highlight=${notif.targetId}` : '/';
    case 'connection_request':
      return '/mynetwork';
    case 'connection_accept':
      return notif.actorId ? `/profile/${notif.actorId}` : '/mynetwork';
    case 'profile_view':
      return notif.actorId ? `/profile/${notif.actorId}` : '/';
    case 'endorsement':
      return '/profile/me';
    case 'job_alert':
      return '/jobs';
    default:
      return '/';
  }
}

export default function Notifications() {
  const { state, markNotificationRead, markAllNotificationsRead } = useStore();
  const navigate = useNavigate();

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const handleActionClick = (e, notif) => {
    e.stopPropagation();
    if (!notif.read) markNotificationRead(notif.id);
    const dest = getNotificationDestination(notif);
    navigate(dest);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 hidden md:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-base mb-2">Manage your Notifications</h3>
          <p
            className="text-xinkedin-blue font-semibold text-sm cursor-pointer hover:underline"
            onClick={() => navigate('/profile/me')}
          >
            View Settings
          </p>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          {unreadCount > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">{unreadCount} new notification{unreadCount !== 1 ? 's' : ''}</span>
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-xinkedin-blue font-semibold text-sm hover:bg-blue-50 px-2 py-1 rounded"
              >
                <Check size={14} /> Mark all as read
              </button>
            </div>
          )}

          {state.notifications.map(notif => {
            const actor = notif.actorId ? (state.users[notif.actorId] || { name: 'Someone', avatar: '' }) : null;
            const isSystem = !actor;
            const icon = getNotificationIcon(notif.type);
            const actionLabel = getNotificationActionLabel(notif.type);

            return (
              <div
                key={notif.id}
                onClick={() => { if (!notif.read) markNotificationRead(notif.id); }}
                className={`flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer relative ${!notif.read ? 'bg-blue-50' : ''}`}
              >
                {/* Unread dot */}
                {!notif.read && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-xinkedin-blue"></div>
                )}

                {isSystem ? (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                    {icon}
                  </div>
                ) : (
                  <img src={actor.avatar} className="w-12 h-12 rounded-full flex-shrink-0" alt={actor.name} />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    {actor && <span className="font-semibold">{actor.name} </span>}
                    {notif.content}
                  </p>
                  <p
                    className="text-xs text-xinkedin-blue mt-1 font-semibold hover:underline cursor-pointer"
                    onClick={(e) => handleActionClick(e, notif)}
                  >
                    {actionLabel}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(notif.created))} ago</span>
                  <MoreHorizontal size={16} className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }} title="Mark as read" />
                </div>
              </div>
            );
          })}
          {state.notifications.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No notifications yet.
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-1 hidden md:block">
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <span className="text-xs text-gray-500">Ad</span>
            <div className="mt-2 text-sm">
              <p>Get the latest tech news</p>
              <img src="https://picsum.photos/200/200?random=ad" className="mx-auto my-2 rounded" alt="Ad" />
            </div>
         </div>
      </div>
    </div>
  );
}
