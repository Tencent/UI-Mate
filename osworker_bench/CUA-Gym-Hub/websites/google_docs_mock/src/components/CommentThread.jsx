import React, { useState } from 'react';
import { useDocsContext } from '../context/DocsContext';
import { formatDistanceToNow } from 'date-fns';
import { Check, Trash2, RotateCcw } from 'lucide-react';

function CommentThread({ comment, onReply, onResolve, onDelete, docOwnerId }) {
  const { state } = useDocsContext();
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  const getUser = (userId) => state.users.find((u) => u.id === userId) || { id: userId, name: 'Unknown User', avatar: '', email: '' };
  const author = getUser(comment.userId);
  const canDelete = comment.userId === state.currentUser.id || docOwnerId === state.currentUser.id;

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText.trim());
    setReplyText('');
    setShowReplyInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
    if (e.key === 'Escape') {
      setShowReplyInput(false);
      setReplyText('');
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white shadow-sm ${
        comment.resolved ? 'opacity-60' : ''
      }`}
    >
      {/* Main comment */}
      <div className="p-3">
        {/* Author header */}
        <div className="flex items-center gap-2 mb-2">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
              {(author.name || '?')[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate block">
              {author.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Resolve / Unresolve button */}
            <button
              onClick={() => onResolve(comment.id)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600"
              title={comment.resolved ? 'Reopen' : 'Resolve'}
            >
              {comment.resolved ? (
                <RotateCcw size={16} />
              ) : (
                <Check size={16} />
              )}
            </button>
            {/* Delete button (author or doc owner) */}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
                title="Delete comment"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Quoted text */}
        {comment.quotedText && (
          <div className="mb-2 px-2 py-1 bg-yellow-50 border-l-2 border-yellow-400 text-sm text-gray-700 italic rounded-r">
            "{comment.quotedText}"
          </div>
        )}

        {/* Comment content */}
        <p className="text-sm text-gray-800">{comment.content}</p>

        {/* Resolved badge */}
        {comment.resolved && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
            <Check size={12} />
            Resolved
          </span>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-t border-gray-100">
          {comment.replies.map((reply) => {
            const replyAuthor = getUser(reply.userId);
            return (
              <div key={reply.id} className="px-3 py-2 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  {replyAuthor.avatar ? (
                    <img
                      src={replyAuthor.avatar}
                      alt={replyAuthor.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-600">
                      {(replyAuthor.name || '?')[0]}
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-900">
                    {replyAuthor.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(reply.created), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 ml-7">{reply.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply input */}
      <div className="border-t border-gray-100 px-3 py-2">
        {showReplyInput ? (
          <div className="flex items-center gap-2">
            <img
              src={state.currentUser.avatar}
              alt={state.currentUser.name}
              className="w-5 h-5 rounded-full"
            />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply..."
              className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
              autoFocus
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="text-sm text-blue-600 font-medium hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Reply
            </button>
            <button
              onClick={() => {
                setShowReplyInput(false);
                setReplyText('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowReplyInput(true)}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

export default CommentThread;
