import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { X, CheckCircle, MessageSquare } from 'lucide-react';
import { generateId } from '../utils/helpers';
import clsx from 'clsx';

export const CommentsPanel = ({ pageId, onClose }) => {
  const { state, addComment, resolveComment } = useStore();
  const [newComment, setNewComment] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const comments = Object.values(state.comments || {}).filter(c => c.pageId === pageId);
  const unresolvedComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);

  // Group comments by blockId
  const groupByBlock = (cmts) => {
    const groups = {};
    cmts.forEach(c => {
      const key = c.blockId || 'page-level';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = {
      id: generateId(),
      blockId: null,
      pageId,
      authorId: state.user.id,
      content: newComment.trim(),
      createdDate: new Date().toISOString(),
      resolved: false,
    };
    addComment(comment);
    setNewComment('');
  };

  const getRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderComment = (comment) => (
    <div key={comment.id} className="p-3 hover:bg-gray-50 rounded-md">
      <div className="flex items-start gap-2">
        <img src={state.user.avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{state.user.name}</span>
            <span className="text-xs text-gray-400">{getRelativeTime(comment.createdDate)}</span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
          {!comment.resolved && (
            <button
              className="mt-1 text-xs text-gray-400 hover:text-green-600 flex items-center gap-1"
              onClick={() => resolveComment(comment.id)}>
              <CheckCircle size={12} /> Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const grouped = groupByBlock(unresolvedComments);

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-[320px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquare size={16} />
          Comments
          {unresolvedComments.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{unresolvedComments.length}</span>
          )}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {unresolvedComments.length === 0 && resolvedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
            <MessageSquare size={32} className="mb-2" />
            <p className="text-sm text-center">No comments yet</p>
            <p className="text-xs text-center mt-1">Add a comment to start a discussion</p>
          </div>
        ) : (
          <div className="py-2">
            {Object.entries(grouped).map(([blockId, cmts]) => (
              <div key={blockId} className="mb-2">
                {blockId !== 'page-level' && state.blocks[blockId] && (
                  <div className="px-4 py-1 text-xs text-gray-400 border-l-2 border-blue-200 ml-4 truncate">
                    {state.blocks[blockId].content?.slice(0, 50) || 'Block'}
                  </div>
                )}
                {cmts.map(renderComment)}
              </div>
            ))}

            {resolvedComments.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-2">
                <button
                  className="px-4 py-1 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  onClick={() => setShowResolved(!showResolved)}>
                  <CheckCircle size={12} />
                  {showResolved ? 'Hide' : 'Show'} {resolvedComments.length} resolved
                </button>
                {showResolved && (
                  <div className="opacity-60">
                    {resolvedComments.map(renderComment)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex items-start gap-2">
          <img src={state.user?.avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-1" />
          <div className="flex-1">
            <textarea
              ref={inputRef}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="Add a comment..."
              rows={2}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex justify-end mt-1">
              <button type="submit" disabled={!newComment.trim()}
                className={clsx('text-xs px-3 py-1 rounded transition-colors',
                  newComment.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}>
                Comment
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
