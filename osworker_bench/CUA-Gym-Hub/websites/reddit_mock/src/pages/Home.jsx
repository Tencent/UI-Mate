import React, { useState } from 'react';
import { useStore } from '../lib/store';
import PostCard from '../components/PostCard';
import { Flame, Star, TrendingUp, Clock, LayoutGrid, List, AlignJustify, X } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

function CreateCommunityModal({ onClose }) {
  const { actions } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, '_');
    if (!trimmed) {
      setError('Community name is required.');
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 21) {
      setError('Community name must be between 3 and 21 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Only letters, numbers, and underscores are allowed.');
      return;
    }
    actions.createCommunity({ name: trimmed, description: description.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDEFF1]">
          <h2 className="text-lg font-bold text-[#1C1C1C]">Create a Community</h2>
          <button onClick={onClose} className="text-[#787C7E] hover:text-[#1C1C1C] p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#787C7E] font-medium">r/</span>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                maxLength={21}
                placeholder="community_name"
                className="w-full pl-7 pr-3 py-2 border border-[#EDEFF1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0079D3] focus:border-[#0079D3] text-sm"
              />
            </div>
            <p className="text-xs text-[#787C7E] mt-1">Letters, numbers, and underscores only. 3–21 characters.</p>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell people what your community is about"
              className="w-full p-2.5 border border-[#EDEFF1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0079D3] text-sm min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-[#0079D3] text-[#0079D3] font-bold rounded-full hover:bg-blue-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0079D3] text-white font-bold rounded-full hover:bg-[#1484D6] text-sm"
            >
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const { state, actions } = useStore();
  const [sort, setSort] = useState('hot');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'classic' | 'compact'
  const navigate = useNavigate();
  const [hideToast, setHideToast] = useState(null); // { postId, timerId }
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);

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

  // Filter out hidden posts
  const hiddenPosts = state.currentUser.hiddenPosts || [];
  const visiblePosts = state.posts.filter(p => !hiddenPosts.includes(p.id));

  const sortedPosts = [...visiblePosts].sort((a, b) => {
    if (sort === 'new') return new Date(b.created) - new Date(a.created);
    if (sort === 'top') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    // Simple hot algorithm mock
    return (b.upvotes + (b.commentIds || []).length) - (a.upvotes + (a.commentIds || []).length);
  });

  return (
    <div className="max-w-5xl mx-auto py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-6">
        {/* Feed */}
        <div>
          {/* Create Post Input Mock */}
          <div className="bg-white border border-[#CCCCCC] rounded-md p-2 mb-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
               <img src={state.currentUser.avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <input
              type="text"
              placeholder="Create Post"
              className="flex-1 bg-[#F6F7F8] hover:bg-white border border-[#EDEFF1] hover:border-[#0079D3] rounded-md px-4 py-2 text-sm transition-colors focus:outline-none"
              onClick={() => navigate('/submit')}
              readOnly
            />
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

            {/* View Mode Toggle */}
            <div className="ml-auto flex items-center gap-1 border border-[#EDEFF1] rounded-md p-0.5">
              <button
                onClick={() => setViewMode('card')}
                title="Card view"
                className={cn("p-1.5 rounded transition-colors", viewMode === 'card' ? "bg-[#EDEFF1] text-[#1C1C1C]" : "text-[#878A8C] hover:text-[#1C1C1C]")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('classic')}
                title="Classic view"
                className={cn("p-1.5 rounded transition-colors", viewMode === 'classic' ? "bg-[#EDEFF1] text-[#1C1C1C]" : "text-[#878A8C] hover:text-[#1C1C1C]")}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                title="Compact view"
                className={cn("p-1.5 rounded transition-colors", viewMode === 'compact' ? "bg-[#EDEFF1] text-[#1C1C1C]" : "text-[#878A8C] hover:text-[#1C1C1C]")}
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Posts */}
          <div className={viewMode === 'compact' ? 'bg-white border border-[#CCCCCC] rounded-md overflow-hidden divide-y divide-[#EDEFF1]' : ''}>
            {sortedPosts.map(post => (
              <PostCard key={post.id} post={post} onHide={handleHide} viewMode={viewMode} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden">
            <div className="h-10 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/400/100?random=banner)' }}></div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2 -mt-6">
                <div className="bg-white p-1 rounded-full">
                  <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">r</span>
                  </div>
                </div>
                <span className="font-medium text-[#1C1C1C] mt-4">Home</span>
              </div>
              <p className="text-sm text-[#787C7E] mb-4">
                Your personal Xeddit frontpage. Come here to check in with your favorite communities.
              </p>
              <div className="border-t border-[#EDEFF1] pt-3">
                <Link to="/submit" className="block w-full text-center bg-[#0079D3] hover:bg-[#1484D6] text-white font-bold py-1.5 rounded-full transition-colors text-sm">
                  Create Post
                </Link>
                <button
                  onClick={() => setShowCreateCommunity(true)}
                  className="w-full mt-2 border border-[#0079D3] text-[#0079D3] hover:bg-blue-50 font-bold py-1.5 rounded-full transition-colors text-sm"
                >
                  Create Community
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#CCCCCC] rounded-md p-3">
            <h4 className="text-sidebar-heading text-[#787C7E] uppercase mb-3 tracking-wide">Popular Communities</h4>
            <ul className="space-y-3">
              {state.subreddits.map(sub => (
                <li key={sub.id} className="flex items-center justify-between">
                  <Link to={`/r/${sub.id}`} className="flex items-center gap-2 hover:underline">
                    <img src={sub.icon} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#1C1C1C]">r/{sub.name}</span>
                      <span className="text-metadata text-[#787C7E]">{formatNumber(sub.members)} members</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Hide Toast */}
      {hideToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1C1C] text-white px-4 py-2.5 rounded-md shadow-lg z-[200] flex items-center gap-3 text-sm">
          <span>Post hidden</span>
          <button onClick={handleUnhide} className="text-[#0079D3] font-bold hover:underline">Undo</button>
        </div>
      )}

      {showCreateCommunity && (
        <CreateCommunityModal onClose={() => setShowCreateCommunity(false)} />
      )}
    </div>
  );
}
