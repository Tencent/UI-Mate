import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import { MessageCircle, Repeat2, Heart, Share, Bookmark, Eye, PenSquare, MoreHorizontal, Pin, Trash2, Link, VolumeX, Ban, Flag } from 'lucide-react';
import { useData } from '../context/DataContext';
import PostContent from './PostContent';
import clsx from 'clsx';

export default function Tweet({ tweet, isReply = false }) {
  const { state, toggleLike, toggleRetweet, toggleBookmark, deletePost, pinPost, muteUser, blockUser, notInterestedInPost } = useData();
  const navigate = useNavigate();
  const [showRetweetMenu, setShowRetweetMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [bookmarkAnimation, setBookmarkAnimation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const retweetMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  const author = state.users.find(u => u.id === tweet.userId);
  const isLiked = (tweet.likes || []).includes(state.currentUser.id);
  const isRetweeted = (tweet.retweets || tweet.reposts || []).includes(state.currentUser.id);
  const isBookmarked = (tweet.bookmarks || []).includes(state.currentUser.id);
  const isOwnPost = tweet.userId === state.currentUser.id;
  const isPinned = state.currentUser.pinnedPostId === tweet.id;
  const viewCount = tweet.views || 0;
  const isMuted = (state.mutedUsers || []).includes(tweet.userId);
  const isBlocked = (state.blockedUsers || []).includes(tweet.userId);

  useEffect(() => {
    function handleClickOutside(event) {
      if (retweetMenuRef.current && !retweetMenuRef.current.contains(event.target)) {
        setShowRetweetMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!author) return null;

  const handleLike = (e) => {
    e.stopPropagation();
    setLikeAnimation(true);
    setTimeout(() => setLikeAnimation(false), 200);
    toggleLike(tweet.id);
  };

  const handleRetweetClick = (e) => {
    e.stopPropagation();
    setShowRetweetMenu(!showRetweetMenu);
  };

  const handleRetweetAction = (e) => {
    e.stopPropagation();
    toggleRetweet(tweet.id);
    setShowRetweetMenu(false);
  };

  const handleQuoteTweet = (e) => {
    e.stopPropagation();
    setShowRetweetMenu(false);
    navigate(`/compose?quote=${tweet.id}`);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (toggleBookmark) {
      setBookmarkAnimation(true);
      setTimeout(() => setBookmarkAnimation(false), 200);
      toggleBookmark(tweet.id);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const tweetUrl = `${window.location.origin}/status/${tweet.id}`;
    navigator.clipboard.writeText(tweetUrl).then(() => {
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
    });
  };

  const handleReply = (e) => {
    e.stopPropagation();
    navigate(`/status/${tweet.id}`);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    deletePost(tweet.id);
  };

  const handleDeleteCancel = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handlePin = (e) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    if (pinPost) pinPost(tweet.id);
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    const tweetUrl = `${window.location.origin}/status/${tweet.id}`;
    navigator.clipboard.writeText(tweetUrl);
  };

  const handleMute = (e) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    if (muteUser) muteUser(tweet.userId);
  };

  const handleBlock = (e) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    if (blockUser) blockUser(tweet.userId);
  };

  const handleNotInterested = (e) => {
    e.stopPropagation();
    setShowMoreMenu(false);
    if (notInterestedInPost) notInterestedInPost(tweet.id);
  };

  const navigateToTweet = () => {
    navigate(`/status/${tweet.id}`);
  };

  const navigateToProfile = (e) => {
    e.stopPropagation();
    navigate(`/profile/${author.handle}`);
  };

  const formatViews = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Render quoted post if present
  const quotedPost = tweet.quotedPostId ? state.tweets.find(t => t.id === tweet.quotedPostId) : null;
  const quotedAuthor = quotedPost ? state.users.find(u => u.id === quotedPost.userId) : null;

  return (
    <div
      onClick={navigateToTweet}
      className={clsx(
        "flex gap-3 px-4 py-3 border-b border-[#EFF3F4] hover:bg-[#F7F9F9] cursor-pointer transition-colors relative",
        isReply && "pl-12"
      )}
    >
      <div className="flex-shrink-0">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
          onClick={navigateToProfile}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Header row with name and three-dot menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1 text-[15px] min-w-0 flex-1">
            <span
              className="font-bold text-[#0F1419] hover:underline cursor-pointer truncate"
              onClick={navigateToProfile}
            >
              {author.name}
            </span>
            {author.verified && (
              <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-[18px] h-[18px] text-[#1DA1F2] fill-current flex-shrink-0">
                <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g>
              </svg>
            )}
            <span className="text-[#536471] truncate">@{author.handle}</span>
            <span className="text-[#536471] flex-shrink-0">&middot;</span>
            <span className="text-[#536471] hover:underline whitespace-nowrap flex-shrink-0">
              {formatDistanceToNowStrict(new Date(tweet.createdAt))}
            </span>
          </div>

          {/* Three-dot menu */}
          <div className="relative flex-shrink-0 ml-2" ref={moreMenuRef}>
            <button
              className="p-1.5 rounded-full hover:bg-[#1DA1F2]/10 text-[#536471] hover:text-[#1DA1F2] transition-colors"
              onClick={handleMoreClick}
            >
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </button>

            {showMoreMenu && (
              <div className="absolute top-8 right-0 bg-white shadow-xl rounded-xl border border-[#EFF3F4] py-1 w-[220px] z-30">
                {isOwnPost ? (
                  <>
                    <button
                      onClick={handlePin}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] transition-colors"
                    >
                      <Pin className="w-[18px] h-[18px]" />
                      {isPinned ? 'Unpin from profile' : 'Pin to your profile'}
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#F4212E] transition-colors"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                      Delete
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] transition-colors"
                    >
                      <Link className="w-[18px] h-[18px]" />
                      Copy link to post
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleMute}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] transition-colors"
                    >
                      <VolumeX className="w-[18px] h-[18px]" />
                      {isMuted ? `Unmute @${author.handle}` : `Mute @${author.handle}`}
                    </button>
                    <button
                      onClick={handleBlock}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] transition-colors"
                    >
                      <Ban className="w-[18px] h-[18px]" />
                      {isBlocked ? `Unblock @${author.handle}` : `Block @${author.handle}`}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] transition-colors"
                    >
                      <Link className="w-[18px] h-[18px]" />
                      Copy link to post
                    </button>
                    <button
                      onClick={handleNotInterested}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F7F9F9] text-[15px] text-[#0F1419] transition-colors"
                    >
                      <Flag className="w-[18px] h-[18px]" />
                      Not interested in this post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-0.5 text-[15px] leading-5 text-[#0F1419] whitespace-pre-wrap">
          <PostContent content={tweet.content} />
        </div>

        {/* Images */}
        {tweet.images && tweet.images.length > 0 && (
          <div className={clsx(
            "mt-3 rounded-2xl overflow-hidden border border-[#EFF3F4]",
            tweet.images.length > 1 && "grid gap-0.5",
            tweet.images.length === 2 && "grid-cols-2",
            tweet.images.length === 3 && "grid-cols-2",
            tweet.images.length === 4 && "grid-cols-2"
          )}>
            {tweet.images.length === 1 ? (
              <img src={tweet.images[0]} alt="Post media" className="w-full max-h-[400px] object-cover" onClick={e => e.stopPropagation()} />
            ) : (
              tweet.images.map((img, i) => (
                <img key={i} src={img} alt={`Post media ${i + 1}`} className="w-full h-[200px] object-cover" onClick={e => e.stopPropagation()} />
              ))
            )}
          </div>
        )}

        {/* Quoted post card */}
        {quotedPost && quotedAuthor && (
          <div
            className="mt-3 border border-[#EFF3F4] rounded-2xl p-3 hover:bg-[#F7F9F9] transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/status/${quotedPost.id}`);
            }}
          >
            <div className="flex items-center gap-1 text-[13px]">
              <img src={quotedAuthor.avatar} alt="" className="w-5 h-5 rounded-full" />
              <span className="font-bold text-[#0F1419]">{quotedAuthor.name}</span>
              {quotedAuthor.verified && (
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1DA1F2] fill-current">
                  <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g>
                </svg>
              )}
              <span className="text-[#536471]">@{quotedAuthor.handle}</span>
            </div>
            <p className="mt-1 text-[15px] text-[#0F1419] line-clamp-3">{quotedPost.content}</p>
          </div>
        )}

        {/* Engagement bar */}
        <div className="flex justify-between mt-3 max-w-[425px] text-[#536471] relative">
          {/* Reply */}
          <button
            className="group flex items-center gap-1 hover:text-[#1DA1F2] transition-colors"
            onClick={handleReply}
          >
            <div className="p-2 rounded-full group-hover:bg-[#1DA1F2]/10 transition-colors">
              <MessageCircle className="w-[18px] h-[18px]" />
            </div>
            <span className="text-[13px]">{(tweet.replies || []).length || ''}</span>
          </button>

          {/* Repost */}
          <div className="relative" ref={retweetMenuRef}>
            <button
              className={clsx(
                "group flex items-center gap-1 transition-colors",
                isRetweeted ? "text-[#00BA7C]" : "hover:text-[#00BA7C]"
              )}
              onClick={handleRetweetClick}
            >
              <div className="p-2 rounded-full group-hover:bg-[#00BA7C]/10 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{(tweet.retweets || tweet.reposts || []).length || ''}</span>
            </button>

            {showRetweetMenu && (
              <div className="absolute top-10 -left-2 bg-white shadow-xl rounded-xl border border-[#EFF3F4] py-1 w-48 z-20 flex flex-col">
                <button
                  onClick={handleRetweetAction}
                  className="px-4 py-3 text-left hover:bg-[#F7F9F9] font-bold text-[15px] flex items-center gap-3 text-[#0F1419]"
                >
                  <Repeat2 className="w-[18px] h-[18px]" />
                  {isRetweeted ? 'Undo Repost' : 'Repost'}
                </button>
                <button
                  onClick={handleQuoteTweet}
                  className="px-4 py-3 text-left hover:bg-[#F7F9F9] font-bold text-[15px] flex items-center gap-3 text-[#0F1419]"
                >
                  <PenSquare className="w-[18px] h-[18px]" />
                  Quote
                </button>
              </div>
            )}
          </div>

          {/* Like */}
          <button
            className={clsx(
              "group flex items-center gap-1 transition-colors",
              isLiked ? "text-[#F91880]" : "hover:text-[#F91880]"
            )}
            onClick={handleLike}
          >
            <div className="p-2 rounded-full group-hover:bg-[#F91880]/10 transition-colors">
              <Heart className={clsx(
                "w-[18px] h-[18px]",
                isLiked && "fill-current",
                likeAnimation && "scale-125"
              )} style={{ transition: 'transform 200ms ease' }} />
            </div>
            <span className="text-[13px]">{(tweet.likes || []).length || ''}</span>
          </button>

          {/* Views */}
          <button className="group flex items-center gap-1 hover:text-[#1DA1F2] transition-colors">
            <div className="p-2 rounded-full group-hover:bg-[#1DA1F2]/10 transition-colors">
              <Eye className="w-[18px] h-[18px]" />
            </div>
            <span className="text-[13px]">{formatViews(viewCount)}</span>
          </button>

          {/* Bookmark */}
          <button
            className={clsx(
              "group flex items-center gap-1 transition-colors",
              isBookmarked ? "text-[#1DA1F2]" : "hover:text-[#1DA1F2]"
            )}
            onClick={handleBookmark}
          >
            <div className="p-2 rounded-full group-hover:bg-[#1DA1F2]/10 transition-colors">
              <Bookmark className={clsx(
                "w-[18px] h-[18px]",
                isBookmarked && "fill-current",
                bookmarkAnimation && "scale-125"
              )} style={{ transition: 'transform 200ms ease' }} />
            </div>
          </button>

          {/* Share */}
          <div className="relative">
            <button
              className="group flex items-center gap-1 hover:text-[#1DA1F2] transition-colors"
              onClick={handleShare}
            >
              <div className="p-2 rounded-full group-hover:bg-[#1DA1F2]/10 transition-colors">
                <Share className="w-[18px] h-[18px]" />
              </div>
            </button>
            {showCopiedTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#0F1419] text-white text-xs rounded whitespace-nowrap">
                Copied to clipboard
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-[320px] w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-[20px] font-extrabold text-[#0F1419] mb-2">Delete post?</h3>
            <p className="text-[15px] text-[#536471] mb-6">This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.</p>
            <button
              onClick={handleDeleteConfirm}
              className="w-full py-3 bg-[#F4212E] text-white font-bold text-[17px] rounded-full hover:bg-[#dc1e2b] transition-colors mb-3"
            >
              Delete
            </button>
            <button
              onClick={handleDeleteCancel}
              className="w-full py-3 border border-[#CFD9DE] text-[#0F1419] font-bold text-[17px] rounded-full hover:bg-[#F7F9F9] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
