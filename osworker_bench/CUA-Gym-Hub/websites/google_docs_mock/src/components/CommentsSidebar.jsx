import React, { useState } from 'react';
import { useDocsContext } from '../context/DocsContext';
import { MessageSquare, X, Plus } from 'lucide-react';
import CommentThread from './CommentThread';

function CommentsSidebar({ docId }) {
  const { state, dispatch } = useDocsContext();
  const [newCommentText, setNewCommentText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'open' | 'resolved'

  const doc = state.documents[docId];
  const allComments = state.comments.filter((c) => c.docId === docId);
  const filteredComments = allComments
    .filter((c) => {
      if (filter === 'open') return !c.resolved;
      if (filter === 'resolved') return c.resolved;
      return true;
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  const openCount = allComments.filter((c) => !c.resolved).length;

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    dispatch({
      type: 'ADD_COMMENT',
      payload: { docId, content: newCommentText.trim(), quotedText: '' },
    });
    setNewCommentText('');
    setShowAddForm(false);
  };

  const handleReply = (commentId, content) => {
    dispatch({ type: 'REPLY_COMMENT', payload: { commentId, content } });
  };

  const handleResolve = (commentId) => {
    dispatch({ type: 'RESOLVE_COMMENT', payload: { commentId } });
  };

  const handleDelete = (commentId) => {
    dispatch({ type: 'DELETE_COMMENT', payload: { commentId } });
  };

  const handleClose = () => {
    dispatch({
      type: 'SET_UI',
      payload: { sidebarOpen: false },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!state.ui.sidebarOpen) return null;

  return (
    <div className="w-[300px] min-w-[300px] border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-gray-600" />
          <span className="font-medium text-sm text-gray-900">Comments</span>
          {openCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {openCount}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-200 px-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'resolved', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add comment */}
      <div className="px-3 py-2 border-b border-gray-100">
        {showAddForm ? (
          <div>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-1.5">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCommentText('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 w-full py-1"
          >
            <Plus size={16} />
            Add comment
          </button>
        )}
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare
              size={32}
              className="mx-auto text-gray-300 mb-2"
            />
            <p className="text-sm text-gray-400">
              {filter === 'all'
                ? 'No comments yet'
                : filter === 'open'
                  ? 'No open comments'
                  : 'No resolved comments'}
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onResolve={handleResolve}
              onDelete={handleDelete}
              docOwnerId={doc?.ownerId}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CommentsSidebar;
