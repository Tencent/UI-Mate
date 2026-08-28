import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Gift, Bookmark, EyeOff, MoreHorizontal, Link as LinkIcon, Flag, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../lib/store';
import { cn, formatNumber } from '../lib/utils';
import AwardModal from './AwardModal';

export default function PostCard({ post, showSubreddit = true, onHide, viewMode = 'card' }) {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportToast, setShowReportToast] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const dropdownRef = useRef(null);

  const subreddit = state.subreddits.find(s => s.id === post.subredditId);
  const user = state.users.find(u => u.id === post.userId) || { username: '[deleted]', id: null };
  const userVote = state.votes.find(v => v.targetId === post.id && v.userId === state.currentUser.id);

  const voteValue = userVote?.value || 0;
  const score = post.upvotes - post.downvotes;
  const commentCount = (post.commentIds || []).length;
  const isSaved = (state.currentUser.savedPosts || []).includes(post.id);
  const isOwn = post.userId === state.currentUser.id;

  // Get flair if set
  const flair = post.flairId && subreddit
    ? (subreddit.flairs || []).find(f => f.id === post.flairId)
    : null;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [showDropdown]);

  const handleVote = (e, val) => {
    e.preventDefault();
    e.stopPropagation();
    actions.vote(post.id, 'post', val);
  };

  const handleAward = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAwardModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) actions.unsavePost(post.id);
    else actions.savePost(post.id);
  };

  const handleHide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    actions.hidePost(post.id);
    setShowDropdown(false);
    if (onHide) onHide(post.id);
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyTooltip(true);
      setTimeout(() => setCopyTooltip(false), 2000);
    });
    setShowDropdown(false);
  };

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    actions.reportPost(post.id);
    setShowDropdown(false);
    setShowReportToast(true);
    setTimeout(() => setShowReportToast(false), 3000);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    actions.deletePost(post.id);
    setShowDeleteModal(false);
    setShowDropdown(false);
  };

  const onGiveAward = (awardId) => {
    actions.giveAward(post.id, 'post', awardId);
    setShowAwardModal(false);
  };

  // Group awards for display
  const awardCounts = (post.awards || []).reduce((acc, awardId) => {
    acc[awardId] = (acc[awardId] || 0) + 1;
    return acc;
  }, {});

  // Compact view renders a minimal row
  if (viewMode === 'compact') {
    return (
      <>
        <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#F6F7F8] cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
          {/* Vote */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={(e) => handleVote(e, 1)} className={cn("p-0.5 rounded hover:bg-gray-200", voteValue === 1 ? "text-[#FF4500]" : "text-[#878A8C]")}>
              <ArrowBigUp className={cn("w-4 h-4", voteValue === 1 && "fill-current")} />
            </button>
            <span className={cn("text-xs font-bold w-8 text-center", voteValue === 1 ? "text-[#FF4500]" : voteValue === -1 ? "text-[#7193FF]" : "text-[#1C1C1C]")}>
              {formatNumber(score)}
            </span>
            <button onClick={(e) => handleVote(e, -1)} className={cn("p-0.5 rounded hover:bg-gray-200", voteValue === -1 ? "text-[#7193FF]" : "text-[#878A8C]")}>
              <ArrowBigDown className={cn("w-4 h-4", voteValue === -1 && "fill-current")} />
            </button>
          </div>
          {/* Title */}
          <div className="flex-1 min-w-0">
            <span className="text-sm text-[#1C1C1C] line-clamp-1">{post.title}</span>
          </div>
          {/* Meta */}
          <div className="flex items-center gap-3 flex-shrink-0 text-xs text-[#787C7E]">
            {showSubreddit && subreddit && <span className="hidden sm:block">r/{subreddit.name}</span>}
            <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {commentCount}</span>
          </div>
        </div>
        {showReportToast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1C1C] text-white px-4 py-2.5 rounded-md shadow-lg z-[300] text-sm">
            Reported. Thanks for helping keep Xeddit safe.
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex bg-white border border-[#CCCCCC] rounded-md hover:border-[#898989] cursor-pointer transition-colors mb-2.5 overflow-hidden">
        {/* Vote Sidebar */}
        <div className="w-10 bg-[#F8F9FA] flex flex-col items-center py-2 gap-0.5">
          <button
            onClick={(e) => handleVote(e, 1)}
            className={cn("p-0.5 rounded hover:bg-gray-200 transition-colors", voteValue === 1 ? "text-[#FF4500]" : "text-[#878A8C]")}
          >
            <ArrowBigUp className={cn("w-6 h-6", voteValue === 1 && "fill-current")} />
          </button>
          <span className={cn("text-xs font-bold",
            voteValue === 1 ? "text-[#FF4500]" :
            voteValue === -1 ? "text-[#7193FF]" : "text-[#1C1C1C]"
          )}>
            {formatNumber(score)}
          </span>
          <button
            onClick={(e) => handleVote(e, -1)}
            className={cn("p-0.5 rounded hover:bg-gray-200 transition-colors", voteValue === -1 ? "text-[#7193FF]" : "text-[#878A8C]")}
          >
            <ArrowBigDown className={cn("w-6 h-6", voteValue === -1 && "fill-current")} />
          </button>
        </div>

        {/* Content */}
        <Link to={`/post/${post.id}`} className="flex-1 p-2 pb-1">
          <div className="flex items-center gap-1 text-metadata text-[#787C7E] mb-1">
            {showSubreddit && subreddit && (
              <>
                <Link to={`/r/${subreddit.id}`} className="font-bold text-[#1C1C1C] hover:underline flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  {subreddit.icon && <img src={subreddit.icon} className="w-5 h-5 rounded-full" alt="" />}
                  r/{subreddit.name}
                </Link>
                <span className="mx-0.5">&#183;</span>
              </>
            )}
            <span>Posted by</span>
            <Link to={user.id ? `/user/${user.id}` : '#'} className="hover:underline" onClick={e => e.stopPropagation()}>u/{user.username}</Link>
            <span>{formatDistanceToNow(new Date(post.created))} ago</span>

            {/* Awards Display */}
            {Object.keys(awardCounts).length > 0 && (
              <div className="flex items-center gap-1 ml-1">
                {Object.entries(awardCounts).map(([awardId, count]) => {
                  const award = state.awards.find(a => a.id === awardId);
                  if (!award) return null;
                  return (
                    <div key={awardId} className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded-full" title={award.name}>
                      <span className="text-sm mr-0.5">{award.icon}</span>
                      {count > 1 && <span className="text-[10px] font-medium text-[#787C7E]">{count}</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Flair */}
            {flair && (
              <span
                className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: flair.bgColor, color: flair.color }}
              >
                {flair.text}
              </span>
            )}

            {/* NSFW badge */}
            {post.isNSFW && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white uppercase">NSFW</span>
            )}

            {/* Spoiler badge */}
            {post.isSpoiler && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#878A8C] text-[#878A8C] uppercase">Spoiler</span>
            )}
          </div>

          <h3 className="text-post-title text-[#1C1C1C] mb-1.5 leading-snug">
            {post.isStickied && <span className="text-[#46D160] mr-1" title="Stickied">&#128204;</span>}
            {post.isLocked && <span className="text-[#FFB000] mr-1" title="Locked">&#128274;</span>}
            {post.title}
          </h3>

          {post.type === 'text' && post.content && !post.isSpoiler && (
            <div className="text-comment-body text-[#1C1C1C] mb-2 line-clamp-3 font-normal opacity-80">
              {post.content}
            </div>
          )}

          {post.type === 'text' && post.content && post.isSpoiler && (
            <div className="mb-2">
              {spoilerRevealed ? (
                <div className="text-comment-body text-[#1C1C1C] line-clamp-3 font-normal opacity-80">
                  {post.content}
                </div>
              ) : (
                <div
                  className="text-comment-body bg-[#1C1C1C] text-[#1C1C1C] line-clamp-3 font-normal rounded cursor-pointer select-none blur-[3px] hover:blur-none transition-all"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSpoilerRevealed(true); }}
                  title="Click to reveal spoiler"
                >
                  {post.content}
                </div>
              )}
            </div>
          )}

          {post.type === 'image' && post.url && !post.isNSFW && !post.isSpoiler && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-black flex justify-center max-h-[500px]">
              <img src={post.url} alt={post.title} className="object-contain max-h-full" />
            </div>
          )}

          {post.type === 'image' && post.url && (post.isNSFW || post.isSpoiler) && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 relative max-h-[300px] flex justify-center bg-black">
              <img src={post.url} alt={post.title} className="object-contain max-h-full blur-2xl opacity-60" />
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSpoilerRevealed(true); }}
              >
                <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  {post.isNSFW ? <><AlertTriangle className="w-4 h-4 text-red-400" /> NSFW — Click to view</> : <><EyeOff className="w-4 h-4" /> Spoiler — Click to view</>}
                </div>
              </div>
              {spoilerRevealed && (
                <div className="absolute inset-0 bg-black flex justify-center">
                  <img src={post.url} alt={post.title} className="object-contain max-h-full" />
                </div>
              )}
            </div>
          )}

          {post.type === 'link' && post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="block mb-3 text-[#0079D3] hover:underline text-sm truncate" onClick={e => e.stopPropagation()}>
              {post.url} <span className="text-[#A8AAAB] text-xs">&#8599;</span>
            </a>
          )}

          <div className="flex items-center gap-1 text-[#878A8C] text-metadata font-bold">
            <div className="flex items-center gap-1 hover:bg-[#F6F7F8] p-2 rounded-sm transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{formatNumber(commentCount)} Comments</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="relative flex items-center gap-1 hover:bg-[#F6F7F8] p-2 rounded-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
              {copyTooltip && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1C1C1C] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                  Link Copied!
                </span>
              )}
            </button>
            <button
              onClick={handleSave}
              className={cn("flex items-center gap-1 hover:bg-[#F6F7F8] p-2 rounded-sm transition-colors", isSaved && "text-[#0079D3]")}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
              <span>{isSaved ? 'Unsave' : 'Save'}</span>
            </button>
            <button
              onClick={handleHide}
              className="flex items-center gap-1 hover:bg-[#F6F7F8] p-2 rounded-sm transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              <span>Hide</span>
            </button>
            <button
              onClick={handleAward}
              className="flex items-center gap-1 hover:bg-[#F6F7F8] p-2 rounded-sm transition-colors"
            >
              <Gift className="w-4 h-4" />
              <span>Award</span>
            </button>

            {/* Three-dot menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDropdown(!showDropdown); }}
                className="flex items-center hover:bg-[#F6F7F8] p-2 rounded-sm transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 bottom-full mb-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[200px] animate-fade-in" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                  <button onClick={handleSave} className="w-full text-left px-4 py-2 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8] flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#787C7E]" /> {isSaved ? 'Unsave' : 'Save'}
                  </button>
                  <button onClick={handleHide} className="w-full text-left px-4 py-2 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8] flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-[#787C7E]" /> Hide
                  </button>
                  <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8] flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[#787C7E]" /> Copy Link
                  </button>
                  <button onClick={handleReport} className="w-full text-left px-4 py-2 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8] flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#787C7E]" /> Report
                  </button>
                  {isOwn && (
                    <>
                      <div className="border-t border-[#EDEFF1] my-1"></div>
                      {post.type === 'text' && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/post/${post.id}?edit=true`); setShowDropdown(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8] flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4 text-[#787C7E]" /> Edit
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#F6F7F8] flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Report Toast */}
      {showReportToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1C1C] text-white px-4 py-2.5 rounded-md shadow-lg z-[300] flex items-center gap-3 text-sm">
          <Flag className="w-4 h-4 text-[#FF4500]" />
          Reported. Thanks for helping keep Xeddit safe.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fade-in">
            <h3 className="font-bold text-lg text-[#1C1C1C] mb-2">Delete post?</h3>
            <p className="text-sm text-[#787C7E] mb-6">Are you sure? This can't be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(false); }}
                className="px-4 py-1.5 border border-[#0079D3] text-[#0079D3] font-bold rounded-full hover:bg-blue-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AwardModal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        onSelect={onGiveAward}
      />
    </>
  );
}
