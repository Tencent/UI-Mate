import React from 'react';
import { Bookmark, MoreHorizontal } from 'lucide-react';
import { useData } from '../context/DataContext';
import Tweet from '../components/Tweet';

export default function Bookmarks() {
  const { state } = useData();

  const bookmarkedPostIds = state.bookmarkedPostIds || [];
  const bookmarkedPosts = bookmarkedPostIds
    .map(id => state.tweets.find(t => t.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#EFF3F4] px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#0F1419]">Bookmarks</h1>
            <p className="text-[13px] text-[#536471]">@{state.currentUser.handle}</p>
          </div>
          <button className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
            <MoreHorizontal className="w-5 h-5 text-[#0F1419]" />
          </button>
        </div>
      </div>

      {bookmarkedPosts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Bookmark className="w-10 h-10 text-[#536471] mb-4" />
          <h2 className="text-[30px] font-extrabold text-[#0F1419] mb-2">Save posts for later</h2>
          <p className="text-[15px] text-[#536471] text-center max-w-sm">
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        <div>
          {bookmarkedPosts.map(tweet => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}
