import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Repeat2, MessageCircle, AtSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import clsx from 'clsx';

export default function Notifications() {
  const { state, markNotificationsRead, markNotificationRead } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    markNotificationsRead();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-8 h-8 text-[#F91880] fill-current" />;
      case 'retweet':
      case 'repost': return <Repeat2 className="w-8 h-8 text-[#00BA7C]" />;
      case 'follow': return <User className="w-8 h-8 text-[#1DA1F2] fill-current" />;
      case 'reply': return <MessageCircle className="w-8 h-8 text-[#1DA1F2]" />;
      case 'mention': return <AtSign className="w-8 h-8 text-[#1DA1F2]" />;
      default: return <div className="w-8 h-8" />;
    }
  };

  const getActionText = (type) => {
    switch (type) {
      case 'like': return ' liked your post';
      case 'retweet':
      case 'repost': return ' reposted your post';
      case 'follow': return ' followed you';
      case 'reply': return ' replied to your post';
      case 'mention': return ' mentioned you in a post';
      default: return '';
    }
  };

  const allNotifications = [...state.notifications].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filteredNotifications = activeTab === 'mentions'
    ? allNotifications.filter(n => n.type === 'mention' || n.type === 'reply')
    : allNotifications;

  const handleNotificationClick = (notif) => {
    if (markNotificationRead) {
      markNotificationRead(notif.id);
    }
    if (notif.postId || notif.tweetId) {
      navigate(`/status/${notif.postId || notif.tweetId}`);
    } else if (notif.type === 'follow') {
      const user = state.users.find(u => u.id === notif.userId);
      if (user) navigate(`/profile/${user.handle}`);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#EFF3F4]">
        <h1 className="text-xl font-extrabold text-[#0F1419] px-4 py-3">Notifications</h1>
        <div className="flex">
          <button
            className="flex-1 py-3 text-center hover:bg-[#F7F9F9] transition-colors relative"
            onClick={() => setActiveTab('all')}
          >
            <span className={`text-[15px] ${activeTab === 'all' ? 'font-bold text-[#0F1419]' : 'text-[#536471] font-medium'}`}>
              All
            </span>
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#1DA1F2] rounded-full" />
            )}
          </button>
          <button
            className="flex-1 py-3 text-center hover:bg-[#F7F9F9] transition-colors relative"
            onClick={() => setActiveTab('mentions')}
          >
            <span className={`text-[15px] ${activeTab === 'mentions' ? 'font-bold text-[#0F1419]' : 'text-[#536471] font-medium'}`}>
              Mentions
            </span>
            {activeTab === 'mentions' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] bg-[#1DA1F2] rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div>
        {filteredNotifications.map(notif => {
          const user = state.users.find(u => u.id === notif.userId);
          if (!user) return null;

          return (
            <div
              key={notif.id}
              className={clsx(
                "flex gap-3 px-4 py-3 border-b border-[#EFF3F4] hover:bg-[#F7F9F9] cursor-pointer transition-colors relative",
                !notif.read && "bg-blue-50 hover:bg-blue-100"
              )}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="w-10 flex justify-center flex-shrink-0 pt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mb-2" />
                <p className="text-[15px] text-[#0F1419]">
                  <span className="font-bold">{user.name}</span>
                  <span className="text-[#536471]">{getActionText(notif.type)}</span>
                </p>
                {(notif.tweetId || notif.postId) && (
                  <p className="text-[#536471] mt-1 text-[15px] line-clamp-2">
                    {notif.content || state.tweets.find(t => t.id === (notif.tweetId || notif.postId))?.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center text-[#536471] text-[15px]">
            {activeTab === 'mentions' ? 'No mentions yet.' : 'Nothing to see here -- yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
