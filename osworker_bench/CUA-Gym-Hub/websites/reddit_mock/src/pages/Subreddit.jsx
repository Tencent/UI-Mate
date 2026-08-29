import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import PostCard from '../components/PostCard';
import { formatNumber } from '../lib/utils';
import { Cake, X } from 'lucide-react';

export default function Subreddit() {
  const { id } = useParams();
  const { state, actions } = useStore();
  const [flairFilter, setFlairFilter] = useState(null);
  const [hideToast, setHideToast] = useState(null); // { postId, timerId }

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

  const subreddit = state.subreddits.find(s => s.id === id);
  const hiddenPosts = state.currentUser.hiddenPosts || [];
  const allPosts = state.posts.filter(p => p.subredditId === id && !hiddenPosts.includes(p.id));
  const posts = flairFilter ? allPosts.filter(p => p.flairId === flairFilter) : allPosts;
  const isJoined = (state.currentUser.joinedSubreddits || []).includes(id);

  if (!subreddit) return <div className="text-center py-10 text-[#787C7E]">Subreddit not found</div>;

  const handleToggleJoin = () => {
    if (isJoined) {
      actions.leaveSubreddit(id);
    } else {
      actions.joinSubreddit(id);
    }
  };

  // Sort: stickied first, then by hot
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isStickied && !b.isStickied) return -1;
    if (!a.isStickied && b.isStickied) return 1;
    return (b.upvotes + (b.commentIds || []).length) - (a.upvotes + (a.commentIds || []).length);
  });

  return (
    <div>
      {/* Banner */}
      <div className="h-20 w-full" style={{ backgroundColor: subreddit.bannerColor || '#33a8ff' }}></div>

      {/* Header */}
      <div className="bg-white border-b border-[#EDEFF1] px-4 pb-2">
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-start gap-4 -mt-4 mb-2">
            <img src={subreddit.icon} className="w-[76px] h-[76px] rounded-full border-4 border-white bg-white" alt="" />
            <div className="mt-5 flex-1 flex items-end justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-[#1C1C1C] leading-none mb-1">{subreddit.name}</h1>
                <span className="text-sm text-[#787C7E]">r/{subreddit.name}</span>
              </div>
              <button
                onClick={handleToggleJoin}
                className={`px-6 py-1.5 rounded-full font-bold text-sm border transition-all ${
                  isJoined
                    ? "bg-white border-[#EDEFF1] text-[#787C7E] hover:border-red-400 hover:text-red-500"
                    : "bg-[#0079D3] border-transparent text-white hover:bg-[#1484D6]"
                }`}
                onMouseEnter={e => { if (isJoined) e.target.textContent = 'Leave'; }}
                onMouseLeave={e => { if (isJoined) e.target.textContent = 'Joined'; }}
              >
                {isJoined ? "Joined" : "Join"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-6">
          <div className="space-y-2.5">
            {flairFilter && (
              <div className="bg-white border border-[#CCCCCC] rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#787C7E]">Filtered by flair:</span>
                  {(() => {
                    const fl = (subreddit.flairs || []).find(f => f.id === flairFilter);
                    return fl ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: fl.bgColor, color: fl.color }}>{fl.text}</span>
                    ) : null;
                  })()}
                </div>
                <button onClick={() => setFlairFilter(null)} className="flex items-center gap-1 text-sm text-[#0079D3] hover:underline">
                  <X className="w-3.5 h-3.5" /> Clear filter
                </button>
              </div>
            )}
            {sortedPosts.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-md border border-[#CCCCCC] text-[#787C7E]">
                {flairFilter ? 'No posts with this flair.' : 'No posts yet. Be the first to post!'}
              </div>
            ) : (
              sortedPosts.map(post => <PostCard key={post.id} post={post} showSubreddit={false} onHide={handleHide} />)
            )}
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden">
              <div className="p-3 text-white text-sm font-bold" style={{ backgroundColor: subreddit.bannerColor || '#0079D3' }}>
                About Community
              </div>
              <div className="p-3">
                <p className="text-sm text-[#1C1C1C] mb-4">{subreddit.description}</p>

                <div className="flex items-center gap-8 mb-4 border-b border-[#EDEFF1] pb-4">
                  <div>
                    <div className="text-base font-bold text-[#1C1C1C]">{formatNumber(subreddit.members)}</div>
                    <div className="text-metadata text-[#787C7E]">Members</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#1C1C1C] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#46D160] inline-block"></span>
                      {formatNumber(subreddit.online)}
                    </div>
                    <div className="text-metadata text-[#787C7E]">Online</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#787C7E] mb-4">
                  <Cake className="w-4 h-4" />
                  <span>Created {subreddit.created ? new Date(subreddit.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 25, 2008'}</span>
                </div>

                <Link
                  to={`/submit?subreddit=${id}`}
                  className="block w-full text-center bg-[#0079D3] hover:bg-[#1484D6] text-white font-bold py-1.5 rounded-full transition-colors text-sm"
                >
                  Create Post
                </Link>
              </div>
            </div>

            {/* Filter by Flair */}
            {(subreddit.flairs || []).length > 0 && (
              <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden">
                <div className="p-3 bg-white border-b border-[#EDEFF1]">
                  <h2 className="text-sidebar-heading text-[#787C7E] uppercase tracking-wide">Filter by Flair</h2>
                </div>
                <div className="p-3 flex flex-wrap gap-2">
                  {subreddit.flairs.map(flair => (
                    <button
                      key={flair.id}
                      onClick={() => setFlairFilter(flairFilter === flair.id ? null : flair.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${flairFilter === flair.id ? 'ring-2 ring-[#0079D3] ring-offset-1' : 'hover:opacity-80'}`}
                      style={{ backgroundColor: flair.bgColor, color: flair.color }}
                    >
                      {flair.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden">
              <div className="p-3 bg-white border-b border-[#EDEFF1]">
                <h2 className="text-sidebar-heading text-[#787C7E] uppercase tracking-wide">r/{subreddit.name} Rules</h2>
              </div>
              <div className="p-3">
                <ol className="space-y-2">
                  {subreddit.rules.map((rule, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-[#1C1C1C] border-b border-[#EDEFF1] pb-2 last:border-0">
                      <span className="font-bold text-[#787C7E] w-4 flex-shrink-0">{idx + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
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
    </div>
  );
}
