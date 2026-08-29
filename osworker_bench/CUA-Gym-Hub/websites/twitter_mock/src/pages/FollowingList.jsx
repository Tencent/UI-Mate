import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function FollowingList({ mode = 'following' }) {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { state, toggleFollow } = useData();

  const user = state.users.find(u => u.handle === handle);

  if (!user) return <div className="p-4 text-[#0F1419]">User not found</div>;

  const isFollowingMode = mode === 'following';

  const listUsers = (isFollowingMode ? user.following : user.followers)
    .map(id => state.users.find(u => u.id === id))
    .filter(Boolean);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-1 flex items-center gap-6 border-b border-[#EFF3F4]">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
        </button>
        <div>
          <h2 className="font-extrabold text-[17px] text-[#0F1419] leading-5">{user.name}</h2>
          <span className="text-[13px] text-[#536471]">@{user.handle}</span>
        </div>
      </div>

      <div className="border-b border-[#EFF3F4] flex">
        <div
          className={`flex-1 p-4 text-center cursor-pointer hover:bg-[#F7F9F9] transition-colors`}
          onClick={() => navigate(`/profile/${user.handle}/followers`)}
        >
          <span className={`text-[15px] pb-3 ${!isFollowingMode ? 'font-bold text-[#0F1419] border-b-[3px] border-[#1DA1F2]' : 'text-[#536471] font-medium'}`}>
            Followers
          </span>
        </div>
        <div
          className={`flex-1 p-4 text-center cursor-pointer hover:bg-[#F7F9F9] transition-colors`}
          onClick={() => navigate(`/profile/${user.handle}/following`)}
        >
          <span className={`text-[15px] pb-3 ${isFollowingMode ? 'font-bold text-[#0F1419] border-b-[3px] border-[#1DA1F2]' : 'text-[#536471] font-medium'}`}>
            Following
          </span>
        </div>
      </div>

      <div>
        {listUsers.map(listUser => {
          const currentUserFollows = state.currentUser.following.includes(listUser.id);
          const isSelf = listUser.id === state.currentUser.id;

          return (
            <div
              key={listUser.id}
              className="flex items-start gap-3 p-4 border-b border-[#EFF3F4] hover:bg-[#F7F9F9] transition-colors cursor-pointer"
              onClick={() => navigate(`/profile/${listUser.handle}`)}
            >
              <img
                src={listUser.avatar}
                alt={listUser.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[15px] text-[#0F1419] truncate">{listUser.name}</span>
                      {listUser.verified && (
                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#1DA1F2] fill-current flex-shrink-0">
                          <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g>
                        </svg>
                      )}
                    </div>
                    <p className="text-[#536471] text-[15px]">@{listUser.handle}</p>
                  </div>
                  {!isSelf && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollow(listUser.id);
                      }}
                      className={
                        currentUserFollows
                          ? "px-4 py-[6px] rounded-full font-bold text-[15px] border border-[#CFD9DE] text-[#0F1419] hover:border-[#F4212E]/50 hover:bg-[#F4212E]/10 hover:text-[#F4212E] transition-colors"
                          : "px-4 py-[6px] rounded-full font-bold text-[15px] bg-[#0F1419] text-white hover:bg-[#272C30] transition-colors"
                      }
                    >
                      {currentUserFollows ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
                {listUser.bio && (
                  <p className="text-[15px] text-[#0F1419] mt-1 line-clamp-1">{listUser.bio}</p>
                )}
              </div>
            </div>
          );
        })}
        {listUsers.length === 0 && (
          <div className="p-8 text-center text-[#536471] text-[15px]">
            {isFollowingMode ? 'Not following anyone yet.' : 'No followers yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
