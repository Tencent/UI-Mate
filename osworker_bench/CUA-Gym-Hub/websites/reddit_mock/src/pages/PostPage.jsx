import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import PostCard from '../components/PostCard';
import Comment from '../components/Comment';
import { MessageSquare, ChevronDown, X, ArrowLeft } from 'lucide-react';
import { formatNumber } from '../lib/utils';

const SORT_OPTIONS = [
  { value: 'best', label: 'Best' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'controversial', label: 'Controversial' },
  { value: 'old', label: 'Old' },
];

function sortComments(comments, sortBy) {
  return [...comments].sort((a, b) => {
    const scoreA = a.upvotes - a.downvotes;
    const scoreB = b.upvotes - b.downvotes;
    switch (sortBy) {
      case 'top':
        return scoreB - scoreA;
      case 'new':
        return new Date(b.created) - new Date(a.created);
      case 'old':
        return new Date(a.created) - new Date(b.created);
      case 'controversial': {
        const totalA = a.upvotes + a.downvotes;
        const totalB = b.upvotes + b.downvotes;
        const ratioA = totalA > 0 ? Math.abs(a.upvotes - a.downvotes) / totalA : 1;
        const ratioB = totalB > 0 ? Math.abs(b.upvotes - b.downvotes) / totalB : 1;
        // Lower ratio = more controversial; if tie, sort by total votes desc
        if (ratioA !== ratioB) return ratioA - ratioB;
        return totalB - totalA;
      }
      case 'best':
      default: {
        // Best: score with time decay
        const ageA = (Date.now() - new Date(a.created).getTime()) / 3600000;
        const ageB = (Date.now() - new Date(b.created).getTime()) / 3600000;
        const bestA = scoreA / Math.pow(ageA + 2, 0.5);
        const bestB = scoreB / Math.pow(ageB + 2, 0.5);
        return bestB - bestA;
      }
    }
  });
}

export default function PostPage() {
  const { id } = useParams();
  const { state, actions } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [commentSort, setCommentSort] = useState('best');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);
  const isEditMode = searchParams.get('edit') === 'true';
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const handler = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const post = state.posts.find(p => p.id === id);

  if (!post) return <div className="text-center py-10 text-[#787C7E]">Post not found</div>;

  const subreddit = state.subreddits.find(s => s.id === post.subredditId);
  const isOwn = post.userId === state.currentUser.id;
  const canEdit = isOwn && post.type === 'text' && post.title !== '[deleted]';
  const rootComments = sortComments(
    state.comments.filter(c => c.postId === id && !c.parentId),
    commentSort
  );

  // Initialize edit content when entering edit mode
  useEffect(() => {
    if (isEditMode && canEdit) {
      setEditContent(post.content || '');
    }
  }, [isEditMode]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    actions.addComment(id, commentText);
    setCommentText('');
  };

  return (
    <div className="bg-black/80 min-h-screen py-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-gray-300 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-6">
          <div className="bg-white rounded-md overflow-hidden">
            {/* Post Content */}
            <div className="border-b border-[#EDEFF1]">
              <PostCard post={post} />
            </div>

            {/* Edit Post Mode */}
            {isEditMode && canEdit && (
              <div className="p-4 border-b border-[#EDEFF1] bg-[#F6F7F8]">
                <h4 className="font-bold text-sm text-[#1C1C1C] mb-2">Edit Post</h4>
                <textarea
                  className="w-full p-3 border border-[#EDEFF1] rounded-md min-h-[150px] focus:outline-none focus:ring-1 focus:ring-[#0079D3] text-sm bg-white"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => { searchParams.delete('edit'); setSearchParams(searchParams); }}
                    className="px-4 py-1.5 border border-[#0079D3] text-[#0079D3] font-bold rounded-full hover:bg-blue-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { actions.editPost(post.id, { content: editContent }); searchParams.delete('edit'); setSearchParams(searchParams); }}
                    className="px-4 py-1.5 bg-[#0079D3] text-white font-bold rounded-full hover:bg-[#1484D6] text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Comment Area */}
            <div className="p-4 md:p-6">
              {/* Comment Editor - hide if locked */}
              {post.isLocked ? (
                <div className="mb-6 p-4 bg-[#FFF3CD] border border-[#FFE69C] rounded-md text-sm text-[#856404] flex items-center gap-2">
                  <span>&#128274;</span> Comments are locked. You won't be able to comment.
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-metadata text-[#787C7E] mb-1">
                    Comment as{' '}
                    <Link to={`/user/${state.currentUser.id}`} className="text-[#0079D3] hover:underline">
                      {state.currentUser.username}
                    </Link>
                  </p>
                  <form onSubmit={handleSubmitComment} className="border border-[#EDEFF1] rounded-md overflow-hidden focus-within:border-[#1C1C1C] focus-within:ring-1 focus-within:ring-[#1C1C1C]">
                    <textarea
                      className="w-full p-3 min-h-[120px] focus:outline-none text-comment-body"
                      placeholder="What are your thoughts?"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="bg-[#F6F7F8] p-2 flex justify-end border-t border-[#EDEFF1]">
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="bg-[#0079D3] hover:bg-[#1484D6] text-white font-bold py-1 px-4 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Comment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="border-b border-[#EDEFF1] pb-3 mb-4 flex items-center gap-2">
                <span className="font-bold text-[#787C7E] text-metadata uppercase tracking-wide">Sort By:</span>
                <div className="relative" ref={sortMenuRef}>
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F6F7F8] hover:bg-[#EDEFF1] text-[#0079D3] font-bold text-metadata transition-colors"
                  >
                    {SORT_OPTIONS.find(o => o.value === commentSort)?.label || 'Best'}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showSortMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 min-w-[140px] animate-fade-in">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setCommentSort(opt.value); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F6F7F8] transition-colors ${commentSort === opt.value ? 'text-[#0079D3] font-bold' : 'text-[#1C1C1C]'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                {rootComments.length === 0 ? (
                  <div className="text-center py-10 text-[#A8AAAB]">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No comments yet</p>
                  </div>
                ) : (
                  rootComments.map(comment => (
                    <Comment key={comment.id} comment={comment} postUserId={post.userId} isLocked={post.isLocked} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-md border border-[#CCCCCC] overflow-hidden">
              <div className="p-3 text-white text-sm font-bold" style={{ backgroundColor: subreddit?.bannerColor || '#0079D3' }}>
                About Community
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <img src={subreddit?.icon} className="w-10 h-10 rounded-full" alt="" />
                  <Link to={`/r/${subreddit?.id}`} className="hover:underline font-bold text-[#1C1C1C]">r/{subreddit?.name}</Link>
                </div>
                <p className="text-sm text-[#787C7E] mb-4">{subreddit?.description}</p>
                <div className="flex justify-between text-sm font-medium border-t border-[#EDEFF1] pt-3">
                   <div>{formatNumber(subreddit?.members)} <span className="font-normal text-[#787C7E]">Members</span></div>
                   <div>{formatNumber(subreddit?.online)} <span className="font-normal text-[#787C7E]">Online</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
