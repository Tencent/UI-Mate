import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Gift, Bookmark, MoreHorizontal, Pencil, Trash2, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../lib/store';
import { cn, formatNumber } from '../lib/utils';
import AwardModal from './AwardModal';

export default function Comment({ comment, depth = 0, postUserId = null, isLocked = false }) {
  const { state, actions } = useStore();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState(false);
  const menuRef = useRef(null);

  const user = state.users.find(u => u.id === comment.userId) || { username: '[deleted]', id: null };
  const userVote = state.votes.find(v => v.targetId === comment.id && v.userId === state.currentUser.id);
  const voteValue = userVote?.value || 0;
  const score = comment.upvotes - comment.downvotes;
  const isSaved = (state.currentUser.savedComments || []).includes(comment.id);
  const isOwn = comment.userId === state.currentUser.id;
  const isDeleted = comment.content === '[deleted]';

  // OP badge: comment author matches post author
  const isOP = postUserId && comment.userId && comment.userId === postUserId;

  // Mod badge: comment is distinguished or commenter is a moderator of the subreddit
  const post = state.posts.find(p => p.id === comment.postId);
  const subreddit = post ? state.subreddits.find(s => s.id === post.subredditId) : null;
  const isMod = comment.isDistinguished || (subreddit?.moderators || []).includes(comment.userId);

  // Find replies via parentId
  const replies = state.comments.filter(c => c.parentId === comment.id);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [showMenu]);

  const handleVote = (val) => {
    actions.vote(comment.id, 'comment', val);
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    actions.addComment(comment.postId, replyContent, comment.id);
    setIsReplying(false);
    setReplyContent('');
  };

  const handleStartEdit = () => {
    setEditContent(comment.content);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      actions.editComment(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    actions.deleteComment(comment.id);
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  const onGiveAward = (awardId) => {
    actions.giveAward(comment.id, 'comment', awardId);
    setShowAwardModal(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${comment.postId}#comment-${comment.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyTooltip(true);
      setTimeout(() => setCopyTooltip(false), 2000);
    });
  };

  // Group awards for display
  const awardCounts = (comment.awards || []).reduce((acc, awardId) => {
    acc[awardId] = (acc[awardId] || 0) + 1;
    return acc;
  }, {});

  if (collapsed) {
    return (
      <div className="py-2 pl-2">
        <div className="text-metadata text-[#787C7E] italic cursor-pointer flex items-center gap-2" onClick={() => setCollapsed(false)}>
          <span className="text-[#A8AAAB]">[+]</span>
          <span className="font-bold text-[#1C1C1C]">{user.username}</span>
          {isOP && <span className="bg-[#0079D3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">OP</span>}
          {isMod && <span className="bg-[#46D160] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">MOD</span>}
          <span>{formatDistanceToNow(new Date(comment.created))} ago</span>
          {Object.keys(awardCounts).length > 0 && (
             <span className="text-yellow-500 text-xs">({Object.values(awardCounts).reduce((a,b)=>a+b, 0)} awards)</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id={`comment-${comment.id}`} className={cn("flex flex-col pt-3", depth > 0 && "border-l-2 border-[#EDEFF1] pl-4 ml-1")}>
      <div className="flex items-center gap-2 text-metadata text-[#787C7E] mb-1">
        <span
          className="cursor-pointer hover:bg-gray-200 px-1 rounded text-lg leading-none text-[#A8AAAB]"
          onClick={() => setCollapsed(true)}
        >
          &ndash;
        </span>
        <Link to={user.id ? `/user/${user.id}` : '#'} className={cn("font-bold hover:underline", isMod ? "text-[#46D160]" : "text-[#1C1C1C]")}>
          {user.username}
        </Link>
        {isOP && <span className="bg-[#0079D3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">OP</span>}
        {isMod && <span className="bg-[#46D160] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">MOD</span>}
        {comment.isEdited && (
          <span className="text-[#A8AAAB] italic">(edited)</span>
        )}
        <span>&#183;</span>
        <span>{formatDistanceToNow(new Date(comment.created))} ago</span>

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
      </div>

      {/* Comment body: editing or display */}
      {isEditing ? (
        <div className="pl-6 mb-2">
          <textarea
            className="w-full p-2 border border-[#EDEFF1] rounded-md text-comment-body focus:outline-none focus:ring-1 focus:ring-[#0079D3] min-h-[80px] bg-white"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm font-bold text-[#787C7E] hover:bg-gray-200 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editContent.trim()}
              className="px-3 py-1 text-sm font-bold text-white bg-[#0079D3] hover:bg-[#1484D6] disabled:opacity-50 rounded-full"
            >
              Save Edits
            </button>
          </div>
        </div>
      ) : (
        <div className="text-comment-body text-[#1C1C1C] mb-2 pl-6">
          {comment.content}
        </div>
      )}

      <div className="flex items-center gap-4 pl-6 mb-2">
        <div className="flex items-center gap-1 text-[#878A8C]">
          <button
            onClick={() => handleVote(1)}
            className={cn("hover:text-[#FF4500]", voteValue === 1 && "text-[#FF4500]")}
          >
            <ArrowBigUp className={cn("w-5 h-5", voteValue === 1 && "fill-current")} />
          </button>
          <span className={cn("text-metadata font-bold",
            voteValue === 1 ? "text-[#FF4500]" :
            voteValue === -1 ? "text-[#7193FF]" : "text-[#1C1C1C]"
          )}>
            {score > 0 ? formatNumber(score) : 'Vote'}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={cn("hover:text-[#7193FF]", voteValue === -1 && "text-[#7193FF]")}
          >
            <ArrowBigDown className={cn("w-5 h-5", voteValue === -1 && "fill-current")} />
          </button>
        </div>

        {!isLocked && !isDeleted && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1 text-metadata font-bold text-[#878A8C] hover:bg-[#F6F7F8] px-2 py-1 rounded"
          >
            <MessageSquare className="w-4 h-4" />
            Reply
          </button>
        )}

        <button
          onClick={() => {
            if (isSaved) actions.unsaveComment(comment.id);
            else actions.saveComment(comment.id);
          }}
          className={cn("flex items-center gap-1 text-metadata font-bold hover:bg-[#F6F7F8] px-2 py-1 rounded", isSaved ? "text-[#0079D3]" : "text-[#878A8C]")}
        >
          <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          {isSaved ? 'Unsave' : 'Save'}
        </button>

        <button
          onClick={() => setShowAwardModal(true)}
          className="flex items-center gap-1 text-metadata font-bold text-[#878A8C] hover:bg-[#F6F7F8] px-2 py-1 rounded"
        >
          <Gift className="w-4 h-4" />
          Award
        </button>

        <button
          onClick={handleCopyLink}
          className="relative flex items-center gap-1 text-metadata font-bold text-[#878A8C] hover:bg-[#F6F7F8] px-2 py-1 rounded"
        >
          <Share2 className="w-4 h-4" />
          Share
          {copyTooltip && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1C1C1C] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
              Link Copied!
            </span>
          )}
        </button>

        {/* Own comment actions */}
        {isOwn && !isDeleted && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center text-metadata font-bold text-[#878A8C] hover:bg-[#F6F7F8] px-2 py-1 rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute left-0 bottom-full mb-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[140px] animate-fade-in">
                <button
                  onClick={handleStartEdit}
                  className="w-full text-left px-4 py-2 text-sm text-[#1C1C1C] hover:bg-[#F6F7F8] flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#787C7E]" /> Edit
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#F6F7F8] flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isReplying && !isLocked && (
        <div className="pl-6 mb-4">
          <form onSubmit={handleSubmitReply} className="border border-[#EDEFF1] rounded-md bg-[#F6F7F8]">
            <textarea
              className="w-full p-2 bg-transparent text-comment-body focus:outline-none min-h-[80px]"
              placeholder="What are your thoughts?"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex justify-end p-2 bg-[#F6F7F8] rounded-b-md border-t border-[#EDEFF1]">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="mr-2 px-3 py-1 text-sm font-bold text-[#787C7E] hover:bg-gray-200 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim()}
                className="px-3 py-1 text-sm font-bold text-white bg-[#0079D3] hover:bg-[#1484D6] disabled:opacity-50 rounded-full"
              >
                Reply
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col">
        {replies.map(reply => (
          <Comment key={reply.id} comment={reply} depth={depth + 1} postUserId={postUserId} isLocked={isLocked} />
        ))}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-fade-in">
            <h3 className="font-bold text-lg text-[#1C1C1C] mb-2">Delete comment?</h3>
            <p className="text-sm text-[#787C7E] mb-6">Are you sure? This can't be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
    </div>
  );
}
