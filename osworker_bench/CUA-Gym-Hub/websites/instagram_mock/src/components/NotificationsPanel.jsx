import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPanel = ({ onClose }) => {
  const { notifications, users, markAllNotificationsRead, toggleFollow, currentUser, state } = useData();

  useEffect(() => {
    markAllNotificationsRead();
  }, []);

  const now = new Date();
  const today = [];
  const thisWeek = [];
  const earlier = [];

  notifications.forEach(notif => {
    const created = new Date(notif.created);
    const diffHours = (now - created) / (1000 * 60 * 60);
    if (diffHours < 24) {
      today.push(notif);
    } else if (diffHours < 168) {
      thisWeek.push(notif);
    } else {
      earlier.push(notif);
    }
  });

  const NotifRow = ({ notif }) => {
    const fromUser = users[notif.fromUserId];
    if (!fromUser) return null;

    const isFollowing = currentUser.following.includes(notif.fromUserId);

    let textContent = '';
    switch (notif.type) {
      case 'like':
        textContent = 'liked your photo.';
        break;
      case 'comment':
        textContent = notif.text || 'commented on your post.';
        break;
      case 'follow':
        textContent = 'started following you.';
        break;
      case 'mention':
        textContent = 'mentioned you in a comment.';
        break;
      case 'like_comment':
        textContent = 'liked your comment.';
        break;
      default:
        textContent = notif.text;
    }

    const timeText = formatDistanceToNow(new Date(notif.created), { addSuffix: false }).replace('about ', '');

    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors ${!notif.read ? 'bg-[#EDF5FD]' : ''}`}>
        <Link to={`/profile/${fromUser.username}`} onClick={onClose} className="flex-shrink-0">
          <img src={fromUser.avatar} alt={fromUser.username} className="w-11 h-11 rounded-full object-cover" />
        </Link>
        <div className="flex-1 min-w-0 text-sm leading-snug">
          <span>
            <Link to={`/profile/${fromUser.username}`} onClick={onClose} className="font-semibold hover:opacity-70 transition-opacity">{fromUser.username}</Link>
            {' '}{textContent}
          </span>
          <span className="text-[#8E8E8E] ml-1 text-xs">{timeText}</span>
        </div>
        {notif.type === 'follow' && notif.fromUserId !== currentUser.id && (
          <button
            onClick={() => toggleFollow(notif.fromUserId)}
            className={`px-4 py-1.5 rounded-lg font-semibold text-sm flex-shrink-0 transition-colors ${
              isFollowing
                ? 'bg-[#EFEFEF] text-[#262626] hover:bg-[#DBDBDB]'
                : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
        {notif.postId && notif.type !== 'follow' && (
          <div className="w-11 h-11 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            {(() => {
              const post = state && state.posts ? state.posts.find(p => p.id === notif.postId) : null;
              const imgSrc = post && post.images && post.images[0]
                ? post.images[0]
                : `https://picsum.photos/44/44?random=${notif.postId}`;
              return <img src={imgSrc} alt="" className="w-full h-full object-cover" />;
            })()}
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, items }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <h3 className="font-semibold text-base px-4 pt-3 pb-1">{title}</h3>
        {items.map(notif => <NotifRow key={notif.id} notif={notif} />)}
      </div>
    );
  };

  return (
    <div className="fixed left-[72px] top-0 h-full w-[397px] bg-white border-r border-[#DBDBDB] z-30 shadow-xl rounded-r-2xl flex flex-col animate-slide-in">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8E8E8E]">
            <Heart className="w-16 h-16 mb-4 stroke-[0.5]" />
            <p className="text-sm">Activity on your posts</p>
            <p className="text-xs text-[#C7C7C7] mt-1">When someone likes or comments on one of your posts, you'll see it here.</p>
          </div>
        ) : (
          <>
            <Section title="Today" items={today} />
            <Section title="This Week" items={thisWeek} />
            <Section title="Earlier" items={earlier} />
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
