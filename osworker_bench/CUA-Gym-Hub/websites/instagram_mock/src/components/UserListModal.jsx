import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const UserListModal = ({ title, userIds, onClose }) => {
  const { users, currentUser, toggleFollow } = useData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden flex flex-col max-h-[400px] animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#DBDBDB]">
          <div className="w-8" />
          <h2 className="font-bold text-base">{title}</h2>
          <button onClick={onClose} className="p-1 hover:opacity-50 transition-opacity">
            <X className="w-6 h-6 text-[#262626]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar p-1">
          {userIds.length === 0 ? (
            <div className="p-8 text-center text-[#8E8E8E] text-sm">
              No users found.
            </div>
          ) : (
            userIds.map(userId => {
              const user = users[userId];
              if (!user) return null;
              const isFollowing = currentUser.following.includes(userId);
              const isSelf = currentUser.id === userId;

              return (
                <div key={userId} className="flex items-center justify-between py-2 px-3 hover:bg-[#FAFAFA] rounded-lg transition-colors">
                  <Link to={`/profile/${user.username}`} onClick={onClose} className="flex items-center gap-3 min-w-0">
                    <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm flex items-center gap-1 truncate">
                        {user.username}
                        {user.isVerified && (
                          <svg className="w-3 h-3 text-[#0095F6] flex-shrink-0" viewBox="0 0 40 40" fill="currentColor">
                            <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                          </svg>
                        )}
                      </span>
                      <span className="text-[#8E8E8E] text-sm truncate">{user.name}</span>
                    </div>
                  </Link>

                  {!isSelf && (
                    <button
                      onClick={() => toggleFollow(userId)}
                      className={`px-4 py-1.5 rounded-lg font-semibold text-sm flex-shrink-0 ml-2 transition-colors ${
                        isFollowing
                          ? 'bg-[#EFEFEF] text-[#262626] hover:bg-[#DBDBDB]'
                          : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
