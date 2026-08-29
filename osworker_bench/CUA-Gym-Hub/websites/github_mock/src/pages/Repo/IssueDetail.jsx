
    import React, { useState } from 'react';
    import { useOutletContext, useParams } from 'react-router-dom';
    import { AlertCircle, CheckCircle, MessageSquare, MoreHorizontal, Pin } from 'lucide-react';
    import Markdown from 'react-markdown';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';
    import LabelBadge from '../../components/LabelBadge';
    import ReactionBar from '../../components/ReactionBar';
    import LinkedMarkdown from '../../components/LinkedMarkdown';

    export default function IssueDetail() {
      const { repo } = useOutletContext();
      const { issueNumber } = useParams();
      const { state, dispatch, actions } = useStore();
      const [comment, setComment] = useState('');
      const [isEditing, setIsEditing] = useState(false);
      const [editTitle, setEditTitle] = useState('');
      const [editDescription, setEditDescription] = useState('');
      const [commentTab, setCommentTab] = useState('write');
      const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
      const [showLabelMenu, setShowLabelMenu] = useState(false);
      const [editingCommentId, setEditingCommentId] = useState(null);
      const [editCommentContent, setEditCommentContent] = useState('');
      const [showCommentMenu, setShowCommentMenu] = useState(null);

      const issue = state.issues.find(i => i.repoId === repo.id && i.number === parseInt(issueNumber));
      const author = state.users.find(u => u.id === issue?.authorId);

      if (!issue) return <div className="p-8 text-center text-xithub-muted">Issue not found</div>;

      const handleComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const newComment = {
          id: `cm_${Date.now()}`,
          authorId: state.currentUser.id,
          content: comment.trim(),
          date: new Date().toISOString()
        };

        dispatch({
          type: actions.ADD_COMMENT,
          payload: {
            issueId: issue.id,
            comment: newComment
          }
        });

        setComment("");
      };

      const handleEdit = () => {
        setEditTitle(issue.title);
        setEditDescription(issue.description || '');
        setIsEditing(true);
      };

      const handleSaveEdit = () => {
        if (!editTitle.trim()) return;
        dispatch({
          type: actions.UPDATE_ISSUE,
          payload: {
            issueId: issue.id,
            updates: { title: editTitle.trim(), description: editDescription }
          }
        });
        setIsEditing(false);
      };

      const handleToggleStatus = () => {
        dispatch({
          type: actions.UPDATE_ISSUE_STATUS,
          payload: {
            issueId: issue.id,
            status: issue.status === 'open' ? 'closed' : 'open'
          }
        });
      };

      const handleAssignUser = (userId) => {
        const currentAssignees = issue.assignees || [];
        const newAssignees = currentAssignees.includes(userId)
          ? currentAssignees.filter(id => id !== userId)
          : [...currentAssignees, userId];
        dispatch({
          type: actions.UPDATE_ISSUE,
          payload: { issueId: issue.id, updates: { assignees: newAssignees } }
        });
      };

      const handleToggleLabel = (label) => {
        const currentLabels = issue.labels || [];
        const newLabels = currentLabels.includes(label)
          ? currentLabels.filter(l => l !== label)
          : [...currentLabels, label];
        dispatch({
          type: actions.UPDATE_ISSUE,
          payload: { issueId: issue.id, updates: { labels: newLabels } }
        });
      };

      const handleEditComment = (commentId) => {
        const c = (issue.comments || []).find(c => c.id === commentId);
        if (c) {
          setEditingCommentId(commentId);
          setEditCommentContent(c.content);
          setShowCommentMenu(null);
        }
      };

      const handleSaveCommentEdit = (commentId) => {
        if (!editCommentContent.trim()) return;
        dispatch({
          type: actions.UPDATE_COMMENT,
          payload: { targetType: 'issue', parentId: issue.id, commentId, content: editCommentContent.trim() }
        });
        setEditingCommentId(null);
        setEditCommentContent('');
      };

      const handleDeleteComment = (commentId) => {
        dispatch({
          type: actions.DELETE_COMMENT,
          payload: { targetType: 'issue', parentId: issue.id, commentId }
        });
        setShowCommentMenu(null);
      };

      const availableLabels = ['bug', 'enhancement', 'documentation', 'good first issue', 'help wanted', 'question'];

      return (
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 pb-6 border-b border-xithub-border">
            <div className="flex items-center justify-between mb-2">
              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="flex-1 text-2xl bg-[#0d1117] border border-xithub-border rounded-md px-3 py-1 text-white focus:ring-2 focus:ring-xithub-accent outline-none"
                  />
                  <button onClick={handleSaveEdit} className="px-3 py-1 bg-xithub-success text-white rounded-md text-sm font-semibold hover:bg-opacity-90">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xithub-muted hover:text-white text-sm">Cancel</button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-normal text-white">
                    {issue.title} <span className="text-xithub-muted">#{issue.number}</span>
                  </h1>
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 bg-[#21262d] border border-xithub-border rounded-md text-sm font-semibold hover:bg-[#30363d]"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
               <span className={`px-3 py-1 rounded-full text-white font-semibold flex items-center gap-1 ${issue.status === 'open' ? 'bg-xithub-success' : 'bg-purple-600'}`}>
                  {issue.status === 'open' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                  {issue.status === 'open' ? 'Open' : 'Closed'}
               </span>
               <span className="text-xithub-muted">
                 <span className="font-semibold text-xithub-text">{author?.username}</span> opened this issue on {new Date(issue.createdAt).toLocaleDateString()} · {issue.comments.length} comments
               </span>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1 space-y-6">
               {/* Main Description */}
               <div className="flex gap-4">
                  <img src={author?.avatar} alt={author?.username} className="w-10 h-10 rounded-full border border-xithub-border" />
                  <div className="flex-1 border border-xithub-border rounded-md overflow-hidden">
                     <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 text-sm flex justify-between">
                        <span className="font-semibold">{author?.username}</span>
                        <span className="text-xithub-muted">commented on {new Date(issue.createdAt).toLocaleDateString()}</span>
                     </div>
                     {isEditing ? (
                       <div className="p-4 bg-xithub-bg">
                         <textarea
                           value={editDescription}
                           onChange={e => setEditDescription(e.target.value)}
                           className="w-full h-48 bg-[#0d1117] border border-xithub-border rounded-md p-3 text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none resize-y"
                         />
                       </div>
                     ) : (
                       <div className="p-4 bg-xithub-bg prose prose-invert max-w-none text-sm">
                          <LinkedMarkdown repoId={issue.repoId}>{issue.description}</LinkedMarkdown>
                       </div>
                     )}
                     <div className="px-4 pb-3">
                       <ReactionBar
                         reactions={issue.reactions}
                         targetType="issue"
                         targetId={issue.id}
                       />
                     </div>
                  </div>
               </div>

               {/* Comments */}
               {issue.comments.map(c => {
                 const commentAuthor = state.users.find(u => u.id === c.authorId);
                 const isOwnComment = c.authorId === state.currentUser.id;
                 return (
                   <div key={c.id} className="flex gap-4">
                      <img src={commentAuthor?.avatar} alt={commentAuthor?.username} className="w-10 h-10 rounded-full border border-xithub-border" />
                      <div className="flex-1 border border-xithub-border rounded-md overflow-hidden">
                         <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 text-sm flex justify-between items-center">
                            <span className="font-semibold">{commentAuthor?.username}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xithub-muted">commented on {new Date(c.date).toLocaleDateString()}</span>
                              {isOwnComment && (
                                <div className="relative">
                                  <button
                                    onClick={() => setShowCommentMenu(showCommentMenu === c.id ? null : c.id)}
                                    className="p-1 rounded hover:bg-[#30363d] text-xithub-muted hover:text-white"
                                  >
                                    <MoreHorizontal size={14} />
                                  </button>
                                  {showCommentMenu === c.id && (
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-50">
                                      <button
                                        onClick={() => handleEditComment(c.id)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#21262d]"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(c.id)}
                                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#21262d]"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                         </div>
                         {editingCommentId === c.id ? (
                           <div className="p-4 bg-xithub-bg">
                             <textarea
                               value={editCommentContent}
                               onChange={e => setEditCommentContent(e.target.value)}
                               className="w-full h-24 bg-[#0d1117] border border-xithub-border rounded-md p-2 text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none resize-y mb-2"
                             />
                             <div className="flex gap-2 justify-end">
                               <button
                                 onClick={() => { setEditingCommentId(null); setEditCommentContent(''); }}
                                 className="px-3 py-1 text-xithub-muted hover:text-white text-sm"
                               >
                                 Cancel
                               </button>
                               <button
                                 onClick={() => handleSaveCommentEdit(c.id)}
                                 className="px-3 py-1 bg-xithub-success text-white rounded-md text-sm font-semibold hover:bg-opacity-90"
                               >
                                 Save
                               </button>
                             </div>
                           </div>
                         ) : (
                           <div className="p-4 bg-xithub-bg text-sm prose prose-invert max-w-none">
                              <LinkedMarkdown repoId={issue.repoId}>{c.content}</LinkedMarkdown>
                           </div>
                         )}
                         <div className="px-4 pb-3 bg-xithub-bg">
                            <ReactionBar
                              reactions={c.reactions}
                              targetType="comment"
                              targetId={c.id}
                              issueId={issue.id}
                            />
                         </div>
                      </div>
                   </div>
                 );
               })}

               {/* New Comment Form */}
               <div className="flex gap-4 pt-6 border-t border-xithub-border">
                  <img src={state.currentUser.avatar} alt={state.currentUser.username} className="w-10 h-10 rounded-full border border-xithub-border" />
                  <form onSubmit={handleComment} className="flex-1">
                     <div className="border border-xithub-border rounded-md overflow-hidden bg-xithub-bg">
                        <div className="bg-[#161b22] border-b border-xithub-border p-2">
                           <ul className="flex gap-4 text-sm">
                              <li
                                onClick={() => setCommentTab('write')}
                                className={`cursor-pointer px-2 ${commentTab === 'write' ? 'font-semibold border-b-2 border-xithub-accent' : 'text-xithub-muted hover:text-white'}`}
                              >
                                Write
                              </li>
                              <li
                                onClick={() => setCommentTab('preview')}
                                className={`cursor-pointer px-2 ${commentTab === 'preview' ? 'font-semibold border-b-2 border-xithub-accent' : 'text-xithub-muted hover:text-white'}`}
                              >
                                Preview
                              </li>
                           </ul>
                        </div>
                        <div className="p-2">
                          {commentTab === 'write' ? (
                            <textarea
                              className="w-full h-32 bg-[#0d1117] border border-xithub-border rounded-md p-2 text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                              placeholder="Leave a comment"
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                            ></textarea>
                          ) : (
                            <div className="w-full min-h-[8rem] bg-[#0d1117] border border-xithub-border rounded-md p-2 text-xithub-text prose prose-invert max-w-none text-sm">
                              {comment.trim() ? <Markdown>{comment}</Markdown> : <span className="text-xithub-muted">Nothing to preview</span>}
                            </div>
                          )}
                        </div>
                        <div className="p-2 flex justify-end gap-2 bg-[#161b22] border-t border-xithub-border">
                           <button
                             type="button"
                             onClick={handleToggleStatus}
                             className={`px-4 py-1.5 rounded-md font-semibold text-sm border border-xithub-border hover:bg-[#30363d] ${issue.status === 'open' ? 'text-red-400' : 'text-green-400'}`}
                           >
                             {issue.status === 'open' ? 'Close issue' : 'Reopen issue'}
                           </button>
                           <button type="submit" className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90">
                              Comment
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>

            {/* Sidebar */}
            <div className="w-64 space-y-6">
               <div className="border-b border-xithub-border pb-4 relative">
                  <div
                    onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                    className="flex items-center justify-between text-xithub-muted hover:text-xithub-accent cursor-pointer mb-1"
                  >
                     <span className="text-sm font-semibold">Assignees</span>
                     <span className="text-xs">⚙</span>
                  </div>
                  {showAssigneeMenu && (
                    <div className="absolute left-0 top-8 w-full bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                      {state.users.map(u => (
                        <button
                          key={u.id}
                          onClick={() => handleAssignUser(u.id)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] flex items-center gap-2"
                        >
                          <span className={`w-3 h-3 rounded-sm border ${(issue.assignees || []).includes(u.id) ? 'bg-xithub-accent border-xithub-accent' : 'border-xithub-border'}`}></span>
                          <img src={u.avatar} alt={u.username} className="w-4 h-4 rounded-full" />
                          {u.username}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-xithub-muted">
                     {(issue.assignees || []).length > 0
                       ? (issue.assignees || []).map(id => state.users.find(u => u.id === id)?.username || id).join(', ')
                       : 'No one assigned'}
                  </div>
               </div>

               <div className="border-b border-xithub-border pb-4 relative">
                  <div
                    onClick={() => setShowLabelMenu(!showLabelMenu)}
                    className="flex items-center justify-between text-xithub-muted hover:text-xithub-accent cursor-pointer mb-1"
                  >
                     <span className="text-sm font-semibold">Labels</span>
                     <span className="text-xs">⚙</span>
                  </div>
                  {showLabelMenu && (
                    <div className="absolute left-0 top-8 w-full bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                      {availableLabels.map(label => (
                        <button
                          key={label}
                          onClick={() => handleToggleLabel(label)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] flex items-center gap-2"
                        >
                          <span className={`w-3 h-3 rounded-sm border ${(issue.labels || []).includes(label) ? 'bg-xithub-accent border-xithub-accent' : 'border-xithub-border'}`}></span>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                     {(issue.labels || []).map(l => (
                        <LabelBadge key={l} name={l} repoId={issue.repoId} />
                     ))}
                     {(issue.labels || []).length === 0 && <span className="text-xs text-xithub-muted">None yet</span>}
                  </div>
               </div>

               {/* Pin Issue */}
               <div className="border-b border-xithub-border pb-4">
                 <div className="flex items-center justify-between text-xithub-muted mb-1">
                   <span className="text-sm font-semibold">Pin</span>
                 </div>
                 {(() => {
                   const isPinned = issue.isPinned || false;
                   const pinnedCount = state.issues.filter(i => i.repoId === repo.id && i.isPinned).length;
                   const canPin = isPinned || pinnedCount < 3;
                   return (
                     <button
                       onClick={() => {
                         if (!canPin) return;
                         dispatch({
                           type: actions.UPDATE_ISSUE,
                           payload: {
                             issueId: issue.id,
                             updates: { isPinned: !isPinned }
                           }
                         });
                       }}
                       disabled={!canPin && !isPinned}
                       className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-colors ${
                         isPinned
                           ? 'bg-[#1f6feb33] text-xithub-accent border-xithub-accent hover:bg-[#1f6feb55]'
                           : canPin
                             ? 'border-xithub-border text-xithub-muted hover:text-white hover:bg-[#21262d]'
                             : 'border-xithub-border text-xithub-muted opacity-50 cursor-not-allowed'
                       }`}
                     >
                       <Pin size={12} />
                       {isPinned ? 'Unpin issue' : 'Pin issue'}
                     </button>
                   );
                 })()}
                 {!issue.isPinned && state.issues.filter(i => i.repoId === repo.id && i.isPinned).length >= 3 && (
                   <div className="text-xs text-xithub-muted mt-1">Max 3 pinned issues reached</div>
                 )}
               </div>
            </div>
          </div>
        </div>
      );
    }
