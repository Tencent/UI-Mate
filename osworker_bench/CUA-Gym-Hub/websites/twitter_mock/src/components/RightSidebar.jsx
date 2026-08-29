import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import { useData } from '../context/DataContext';
import clsx from 'clsx';

export default function RightSidebar() {
  const [search, setSearch] = useState('');
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [showAllSuggested, setShowAllSuggested] = useState(false);
  const navigate = useNavigate();
  const { state, toggleFollow } = useData();

  const trends = state.trends || [];

  // "Who to follow" — users that currentUser does NOT follow
  const allSuggestedUsers = state.users
    .filter(u => u.id !== state.currentUser.id && !state.currentUser.following.includes(u.id));
  const suggestedUsers = showAllSuggested ? allSuggestedUsers.slice(0, 10) : allSuggestedUsers.slice(0, 3);
  const displayedTrends = showAllTrends ? trends : trends.slice(0, 5);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (trimmed) {
      navigate(`/explore?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="hidden lg:block w-[350px] px-6 py-2 sticky top-0 h-screen overflow-y-auto">
      <div className="sticky top-0 bg-white py-2 z-10">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-[18px] w-[18px] text-[#536471] group-focus-within:text-[#1DA1F2]" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-[10px] border border-transparent rounded-full bg-[#EFF3F4] text-[15px] text-[#0F1419] placeholder-[#536471] focus:outline-none focus:ring-1 focus:ring-[#1DA1F2] focus:bg-white focus:border-[#1DA1F2]"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Trends for you */}
      <div className="mt-4 bg-[#F7F9F9] rounded-2xl overflow-hidden border border-[#EFF3F4]">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xl font-extrabold text-[#0F1419]">Trends for you</h2>
          <button className="p-1.5 rounded-full hover:bg-[#EFF3F4] transition-colors">
            <Settings className="w-[18px] h-[18px] text-[#536471]" />
          </button>
        </div>
        {displayedTrends.map((trend, i) => (
          <div
            key={trend.id || i}
            className="px-4 py-3 hover:bg-black/[.03] cursor-pointer transition-colors"
            onClick={() => navigate(`/explore?q=${encodeURIComponent(trend.name)}`)}
          >
            <p className="text-[13px] text-[#536471]">{trend.category}</p>
            <p className="font-bold text-[15px] text-[#0F1419] mt-0.5">{trend.name}</p>
            <p className="text-[13px] text-[#536471] mt-0.5">{trend.postCount} posts</p>
          </div>
        ))}
        <div
          className="px-4 py-3 text-[#1DA1F2] text-[15px] cursor-pointer hover:bg-black/[.03] transition-colors"
          onClick={() => setShowAllTrends(prev => !prev)}
        >
          {showAllTrends ? 'Show less' : 'Show more'}
        </div>
      </div>

      {/* Who to follow */}
      {allSuggestedUsers.length > 0 && (
        <div className="mt-4 bg-[#F7F9F9] rounded-2xl overflow-hidden border border-[#EFF3F4]">
          <h2 className="text-xl font-extrabold text-[#0F1419] px-4 py-3">Who to follow</h2>
          {suggestedUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-black/[.03] cursor-pointer transition-colors"
              onClick={() => navigate(`/profile/${user.handle}`)}
            >
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[15px] text-[#0F1419] truncate">{user.name}</span>
                  {user.verified && (
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#1DA1F2] fill-current flex-shrink-0">
                      <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g>
                    </svg>
                  )}
                </div>
                <p className="text-[15px] text-[#536471] truncate">@{user.handle}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(user.id);
                }}
                className="bg-[#0F1419] text-white text-[15px] font-bold px-4 py-[6px] rounded-full hover:bg-[#272C30] transition-colors flex-shrink-0"
              >
                Follow
              </button>
            </div>
          ))}
          {allSuggestedUsers.length > 3 && (
            <div
              className="px-4 py-3 text-[#1DA1F2] text-[15px] cursor-pointer hover:bg-black/[.03] transition-colors"
              onClick={() => setShowAllSuggested(prev => !prev)}
            >
              {showAllSuggested ? 'Show less' : 'Show more'}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-[13px] text-[#536471] px-4 flex flex-wrap gap-2 pb-4">
        <span className="hover:underline cursor-pointer">Terms of Service</span>
        <span className="hover:underline cursor-pointer">Privacy Policy</span>
        <span className="hover:underline cursor-pointer">Cookie Policy</span>
        <span className="hover:underline cursor-pointer">Accessibility</span>
        <span className="hover:underline cursor-pointer">Ads info</span>
        <span>&#169; 2026 X Corp.</span>
      </div>
    </div>
  );
}
