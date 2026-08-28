import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';

export const Comments = ({ pageId }) => {
  const { state, dispatch } = useStore();
  const [newComment, setNewComment] = useState('');

  const comments = state.comments.filter(c => c.pageId === pageId);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    dispatch({
      type: 'ADD_COMMENT',
      payload: {
        pageId,
        userId: state.currentUser.id,
        content: newComment
      }
    });
    setNewComment('');
  };

  const getUser = (userId) => state.users.find(u => u.id === userId) || {};

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MessageSquare size={20} /> Comments ({comments.length})
      </h3>
      
      <div className="space-y-6 mb-8">
        {comments.map(comment => {
          const user = getUser(comment.userId);
          return (
            <div key={comment.id} className="flex gap-3">
              <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-gray-900">{user.displayName}</span>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created))} ago</span>
                  </div>
                  <p className="text-gray-800 text-sm">{comment.content}</p>
                </div>
                <div className="flex gap-3 mt-1 ml-1 text-xs text-gray-500">
                  <button className="hover:text-blue-600">Reply</button>
                  <button className="hover:text-blue-600">Like</button>
                </div>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <p className="text-gray-400 italic text-sm">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>

      <div className="flex gap-3">
        <img src={state.currentUser.avatar} alt="Current User" className="w-8 h-8 rounded-full" />
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
            <div className="absolute bottom-2 right-2">
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Send size={14} /> Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
