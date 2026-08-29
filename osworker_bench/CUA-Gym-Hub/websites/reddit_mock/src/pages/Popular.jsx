import React, { useState } from 'react';
import { useStore } from '../lib/store';
import PostCard from '../components/PostCard';
import { Flame, TrendingUp, Clock, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Popular() {
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

  const hiddenPosts = state.currentUser.hiddenPosts || [];
  const visiblePosts = state.posts.filter(p => !hiddenPosts.includes(p.id));

  // Popular: sort by score (upvotes - downvotes) with weighting toward new
  const sortedPosts = [...visiblePosts].sort((a, b) => {
    if (sort === 'new') return new Date(b.created) - new Date(a.created);
    if (sort === 'top') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    if (sort === 'rising') {
      const scoreA = a.upvotes - a.downvotes;
      const scoreB = b.upvotes - b.downvotes;
      const ageA = (Date.now() - new Date(a.created).getTime()) / 3600000;
      const ageB = (Date.now() - new Date(b.created).getTime()) / 3600000;
      return (scoreB / Math.pow(ageB + 1, 1.5)) - (scoreA / Math.pow(ageA + 1, 1.5));
    }
    // hot: score + comments with slight time bias
    return (b.upvotes + (b.commentIds || []).length * 2) - (a.upvotes + (a.commentIds || []).length * 2);
  });

  return (
    <div className="max-w-5xl mx-auto py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-6">
        <div>
          {/* Header */}
          <div className="bg-white border border-[#CCCCCC] rounded-md p-3 mb-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#FF4500]" />
            <h1 className="text-lg font-bold text-[#1C1C1C]">Popular Posts</h1>
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
            <button
              onClick={() => setSort('rising')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors", sort === 'rising' ? "bg-[#F6F7F8] text-[#0079D3]" : "text-[#878A8C] hover:bg-[#F6F7F8]")}
            >
              <Star className="w-5 h-5" /> Rising
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
            <div className="h-10 bg-[#FF4500]"></div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2 -mt-6">
                <div className="bg-white p-1 rounded-full">
                  <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white w-5 h-5" />
                  </div>
                </div>
                <span className="font-medium text-[#1C1C1C] mt-4">Popular</span>
              </div>
              <p className="text-sm text-[#787C7E] mb-4">
                The most popular posts across all of Xeddit right now, ranked by activity.
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
