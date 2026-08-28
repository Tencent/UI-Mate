
    import React, { useState } from 'react';
    import { useOutletContext, Link, useParams } from 'react-router-dom';
    import { MessageCircle, ArrowLeft } from 'lucide-react';
    import Markdown from 'react-markdown';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';

    const CATEGORIES = ['General', 'Q&A', 'Ideas', 'Show and tell'];

    const categoryColors = {
      'General': 'bg-blue-600',
      'Q&A': 'bg-green-600',
      'Ideas': 'bg-purple-600',
      'Show and tell': 'bg-yellow-600',
    };

    function getRelativeTime(dateStr) {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days}d ago`;
      return new Date(dateStr).toLocaleDateString();
    }

    export default function Discussions() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const [view, setView] = useState('list');
      const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
      const [filterCategory, setFilterCategory] = useState('All');

      // New discussion form
      const [showNewForm, setShowNewForm] = useState(false);
      const [newTitle, setNewTitle] = useState('');
      const [newBody, setNewBody] = useState('');
      const [newCategory, setNewCategory] = useState('General');

      // Reply form
      const [replyContent, setReplyContent] = useState('');

      const discussions = (state.discussions || []).filter(d => d.repoId === repo.id);
      const filteredDiscussions = filterCategory === 'All'
        ? discussions
        : discussions.filter(d => d.category === filterCategory);

      const selectedDiscussion = selectedDiscussionId
        ? discussions.find(d => d.id === selectedDiscussionId)
        : null;

      const handleCreateDiscussion = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const newDisc = {
          id: `d_${generateId()}`,
          repoId: repo.id,
          title: newTitle.trim(),
          body: newBody.trim(),
          category: newCategory,
          authorId: state.currentUser.id,
          replies: [],
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: actions.ADD_DISCUSSION, payload: newDisc });
        setNewTitle('');
        setNewBody('');
        setNewCategory('General');
        setShowNewForm(false);
        setSelectedDiscussionId(newDisc.id);
        setView('detail');
      };

      const handleReply = (e) => {
        e.preventDefault();
        if (!replyContent.trim() || !selectedDiscussion) return;
        const reply = {
          id: `dr_${generateId()}`,
          authorId: state.currentUser.id,
          content: replyContent.trim(),
          date: new Date().toISOString(),
        };
        dispatch({
          type: actions.ADD_DISCUSSION_REPLY,
          payload: { discussionId: selectedDiscussion.id, reply }
        });
        setReplyContent('');
      };

      if (view === 'detail' && selectedDiscussion) {
        const author = state.users.find(u => u.id === selectedDiscussion.authorId);
        return (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => { setView('list'); setSelectedDiscussionId(null); }}
              className="flex items-center gap-2 text-sm text-xithub-accent hover:underline mb-4"
            >
              <ArrowLeft size={16} /> Back to discussions
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${categoryColors[selectedDiscussion.category] || 'bg-gray-600'}`}>
                  {selectedDiscussion.category}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">{selectedDiscussion.title}</h1>
              <div className="text-sm text-xithub-muted">
                Started by <span className="font-semibold text-xithub-text">{author?.username}</span> on {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
                {' '} · {(selectedDiscussion.replies || []).length} replies
              </div>
            </div>

            {/* Original post */}
            <div className="flex gap-4 mb-6">
              <img src={author?.avatar} alt={author?.username} className="w-10 h-10 rounded-full border border-xithub-border" />
              <div className="flex-1 border border-xithub-border rounded-md overflow-hidden">
                <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 text-sm flex justify-between">
                  <span className="font-semibold">{author?.username}</span>
                  <span className="text-xithub-muted">{getRelativeTime(selectedDiscussion.createdAt)}</span>
                </div>
                <div className="p-4 bg-xithub-bg prose prose-invert max-w-none text-sm">
                  <Markdown>{selectedDiscussion.body || '*No description provided.*'}</Markdown>
                </div>
              </div>
            </div>

            {/* Replies */}
            {(selectedDiscussion.replies || []).map(reply => {
              const replyAuthor = state.users.find(u => u.id === reply.authorId);
              return (
                <div key={reply.id} className="flex gap-4 mb-4">
                  <img src={replyAuthor?.avatar} alt={replyAuthor?.username} className="w-10 h-10 rounded-full border border-xithub-border" />
                  <div className="flex-1 border border-xithub-border rounded-md overflow-hidden">
                    <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 text-sm flex justify-between">
                      <span className="font-semibold">{replyAuthor?.username}</span>
                      <span className="text-xithub-muted">{getRelativeTime(reply.date)}</span>
                    </div>
                    <div className="p-4 bg-xithub-bg text-sm text-xithub-text">
                      {reply.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Reply form */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-xithub-border">
              <img src={state.currentUser.avatar} alt={state.currentUser.username} className="w-10 h-10 rounded-full border border-xithub-border" />
              <form onSubmit={handleReply} className="flex-1">
                <div className="border border-xithub-border rounded-md overflow-hidden bg-xithub-bg">
                  <textarea
                    className="w-full h-24 bg-[#0d1117] border-b border-xithub-border p-3 text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none resize-y"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                  />
                  <div className="p-2 flex justify-end bg-[#161b22]">
                    <button
                      type="submit"
                      disabled={!replyContent.trim()}
                      className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      }

      // New discussion form
      if (showNewForm) {
        return (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowNewForm(false)}
              className="flex items-center gap-2 text-sm text-xithub-accent hover:underline mb-4"
            >
              <ArrowLeft size={16} /> Back to discussions
            </button>
            <h1 className="text-2xl font-semibold text-white mb-6">Start a new discussion</h1>
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-xithub-text mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-xithub-text mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Discussion title"
                  className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-xithub-text mb-1">Body</label>
                <textarea
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder="Write your discussion content here... Markdown is supported."
                  className="w-full h-48 bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none resize-y"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="bg-xithub-success text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-opacity-90 disabled:opacity-50"
                >
                  Start discussion
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 text-xithub-muted hover:text-white text-sm border border-xithub-border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );
      }

      // List view
      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageCircle size={20} />
              Discussions
            </h2>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
            >
              New discussion
            </button>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filterCategory === 'All'
                  ? 'bg-[#30363d] text-white'
                  : 'text-xithub-muted hover:text-white'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filterCategory === cat
                    ? 'bg-[#30363d] text-white'
                    : 'text-xithub-muted hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Discussion list */}
          <div className="border border-xithub-border rounded-md divide-y divide-xithub-border">
            {filteredDiscussions.length === 0 ? (
              <div className="p-8 text-center text-xithub-muted text-sm">
                No discussions yet. Start a new discussion to begin a conversation.
              </div>
            ) : (
              filteredDiscussions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(disc => {
                const author = state.users.find(u => u.id === disc.authorId);
                const lastActivity = (disc.replies || []).length > 0
                  ? disc.replies[disc.replies.length - 1].date
                  : disc.createdAt;
                return (
                  <button
                    key={disc.id}
                    onClick={() => { setSelectedDiscussionId(disc.id); setView('detail'); }}
                    className="w-full text-left p-4 hover:bg-[#161b22] flex items-start gap-3"
                  >
                    <MessageCircle size={18} className="text-xithub-muted mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xithub-text hover:text-xithub-accent text-sm">
                          {disc.title}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${categoryColors[disc.category] || 'bg-gray-600'}`}>
                          {disc.category}
                        </span>
                      </div>
                      <div className="text-xs text-xithub-muted">
                        {author?.username} started {getRelativeTime(disc.createdAt)}
                        {' '} · Last activity {getRelativeTime(lastActivity)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-xithub-muted shrink-0">
                      <MessageCircle size={12} />
                      {(disc.replies || []).length}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }
