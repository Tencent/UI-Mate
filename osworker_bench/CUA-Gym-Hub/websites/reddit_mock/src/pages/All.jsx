import React, { useState } from 'react';
import { useStore } from '../lib/store';
import PostCard from '../components/PostCard';
import { Flame, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function All() {
  const { state, actions } = useStore();
  const [sort, setSort] = useState('hot');
  const navigate = useNavigate();
  const [hideToast, setHideToast] = useState(null);

  const handleHide = (postId) => {
    if (hideToast) clearTimeout(hideToast.timerId);
    const timerId = setTimeout(() => setHideToast(null), 5000);
    setHideToast({ postId, timerId });
  };

  const handleUnhide = () => {
    if (!hideToast) return;
    actions.unhidePost(hideToast.postId);
    clearTimeout(hideToast.timerId);
    setHideToast(null);
  };

  // All: show every post regardless of subreddit membership
  const hiddenPosts = state.currentUser.hiddenPosts || [];
  const allPosts = state.posts.filter(p => !hiddenPosts.includes(p.id));

  const sortedPosts = [...allPosts].sort((a, b) => {
    if (sort === 'new') return new Date(b.created) - new Date(a.created);
    if (sort === 'top') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    // hot
    return (b.upvotes + (b.commentIds || []).length) - (a.upvotes + (a.commentIds || []).length);
  });

  return (
    <div className="max-w-5xl mx-auto py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-6">
        <div>
          {/* Header */}
          <div className="bg-white border border-[#CCCCCC] rounded-md p-3 mb-3 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#0079D3]" />
            <h1 className="text-lg font-bold text-[#1C1C1C]">All Posts</h1>
          </div>

          {/* Sort Bar */}
          <div className="bg-white border border-[#CCCCCC] rounded-md p-3 mb-3 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSort('hot')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors", sort === 'hot' ? "bg-[#F6F7F8] text-[#0079D3]" : "text-[#878A8C] hover:bg-[#F6F7F8]")}
            >
              <Flame className="w-5 h-5" /> Hot
            </button>
            <button
              onClick={() => setSort('new')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors", sort === 'new' ? "bg-[#F6F7F8] text-[#0079D3]" : "text-[#878A8C] hover:bg-[#F6F7F8]")}
            >
              <Clock className="w-5 h-5" /> New
            </button>
            <button
              onClick={() => setSort('top')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors", sort === 'top' ? "bg-[#F6F7F8] text-[#0079D3]" : "text-[#878A8C] hover:bg-[#F6F7F8]")}
            >
              <TrendingUp className="w-5 h-5" /> Top
            </button>
          </div>

          <div>
            {sortedPosts.map(post => (
              <PostCard key={post.id} post={post} onHide={handleHide} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden">
            <div className="h-10 bg-[#0079D3]"></div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2 -mt-6">
                <div className="bg-white p-1 rounded-full">
                  <div className="w-10 h-10 bg-[#0079D3] rounded-full flex items-center justify-center">
                    <BarChart3 className="text-white w-5 h-5" />
                  </div>
                </div>
                <span className="font-medium text-[#1C1C1C] mt-4">All</span>
              </div>
              <p className="text-sm text-[#787C7E] mb-4">
                All posts from every subreddit on Xeddit. The entire Xeddit universe in one place.
              </p>
              <div className="border-t border-[#EDEFF1] pt-3">
                <button
                  onClick={() => navigate('/submit')}
                  className="block w-full text-center bg-[#0079D3] hover:bg-[#1484D6] text-white font-bold py-1.5 rounded-full transition-colors text-sm"
                >
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hideToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1C1C] text-white px-4 py-2.5 rounded-md shadow-lg z-[200] flex items-center gap-3 text-sm">
          <span>Post hidden</span>
          <button onClick={handleUnhide} className="text-[#0079D3] font-bold hover:underline">Undo</button>
        </div>
      )}
    </div>
  );
}
