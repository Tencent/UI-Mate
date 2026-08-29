
    import React, { useState, useRef, useEffect } from 'react';
    import { useOutletContext, useParams } from 'react-router-dom';
    import { GitPullRequest, Check, MessageSquare, GitMerge, Circle, X, ChevronDown, MoreHorizontal, AlertTriangle, Clock } from 'lucide-react';
    import Markdown from 'react-markdown';
    import { useStore } from '../../lib/store';
    import LinkedMarkdown from '../../components/LinkedMarkdown';

    export default function PullRequestDetail() {
      const { repo } = useOutletContext();
      const { prNumber } = useParams();
      const { state, dispatch, actions } = useStore();
      const [comment, setComment] = useState('');
      const [isEditing, setIsEditing] = useState(false);
      const [editTitle, setEditTitle] = useState('');
      const [editDescription, setEditDescription] = useState('');
      const [showReviewerMenu, setShowReviewerMenu] = useState(false);
      const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
      const [showMergeDropdown, setShowMergeDropdown] = useState(false);
      const [showReviewForm, setShowReviewForm] = useState(false);
      const [reviewBody, setReviewBody] = useState('');
      const [reviewType, setReviewType] = useState('comment');
      const [editingCommentId, setEditingCommentId] = useState(null);
      const [editCommentContent, setEditCommentContent] = useState('');
      const [showCommentMenu, setShowCommentMenu] = useState(null);

      const pr = state.pullRequests.find(p => p.repoId === repo.id && p.number === parseInt(prNumber));
      const author = state.users.find(u => u.id === pr?.authorId);

      const [mergeStrategy, setMergeStrategy] = useState(() => pr?.mergeStrategy || 'merge');

      if (!pr) return <div className="p-8 text-center text-xithub-muted">Pull Request not found</div>;

      const isMerged = pr.status === 'merged';
      const isClosed = pr.status === 'closed';
      const isOpen = pr.status === 'open';

      const handleMerge = () => {
        dispatch({
          type: actions.MERGE_PR,
          payload: { prId: pr.id, userId: state.currentUser.id, mergeStrategy }
        });
      };

      const mergeStrategies = [
        { id: 'merge', label: 'Create a merge commit', desc: 'All commits from this branch will be added to the base branch via a merge commit.' },
        { id: 'squash', label: 'Squash and merge', desc: 'The commits from this branch will be combined into one commit in the base branch.' },
        { id: 'rebase', label: 'Rebase and merge', desc: 'The commits from this branch will be rebased and added to the base branch.' },
      ];
      const selectedStrategy = mergeStrategies.find(s => s.id === mergeStrategy) || mergeStrategies[0];

      const handleToggleStatus = () => {
        if (isMerged) return;
        dispatch({
          type: actions.UPDATE_PR_STATUS,
          payload: {
            prId: pr.id,
            status: isOpen ? 'closed' : 'open'
          }
        });
      };

      const handleEdit = () => {
        setEditTitle(pr.title);
        setEditDescription(pr.description || '');
        setIsEditing(true);
      };

      const handleSaveEdit = () => {
        if (!editTitle.trim()) return;
        dispatch({
          type: actions.UPDATE_PR,
          payload: {
            prId: pr.id,
            updates: { title: editTitle.trim(), description: editDescription }
          }
        });
        setIsEditing(false);
      };

      const handleComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        dispatch({
          type: actions.ADD_PR_COMMENT,
          payload: {
            prId: pr.id,
            comment: {
              id: `prc_${Date.now()}`,
              authorId: state.currentUser.id,
              content: comment.trim(),
              date: new Date().toISOString()
            }
          }
        });
        setComment('');
      };

      const handleToggleReviewer = (userId) => {
        const currentReviewers = pr.reviewers || [];
        const exists = currentReviewers.find(r => r.userId === userId);
        const newReviewers = exists
          ? currentReviewers.filter(r => r.userId !== userId)
          : [...currentReviewers, { userId, status: 'pending' }];
        dispatch({
          type: actions.UPDATE_PR,
          payload: { prId: pr.id, updates: { reviewers: newReviewers } }
        });
      };

      const handleSubmitReview = () => {
        const reviewComment = {
          id: `prc_${Date.now()}`,
          authorId: state.currentUser.id,
          content: reviewBody.trim() || (reviewType === 'approve' ? 'Approved' : reviewType === 'request_changes' ? 'Changes requested' : 'Review comment'),
          date: new Date().toISOString(),
          isReview: true,
          reviewType
        };
        const reviewStatusMap = { comment: 'commented', approve: 'approved', request_changes: 'changes_requested' };
        dispatch({
          type: actions.ADD_PR_COMMENT,
          payload: {
            prId: pr.id,
            comment: reviewComment,
            review: {
              userId: state.currentUser.id,
              status: reviewStatusMap[reviewType],
              date: new Date().toISOString(),
              body: reviewBody.trim()
            }
          }
        });
        setShowReviewForm(false);
        setReviewBody('');
        setReviewType('comment');
      };

      const handleEditComment = (commentId) => {
        const c = (pr.comments || []).find(c => c.id === commentId);
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
          payload: { targetType: 'pr', parentId: pr.id, commentId, content: editCommentContent.trim() }
        });
        setEditingCommentId(null);
        setEditCommentContent('');
      };

      const handleDeleteComment = (commentId) => {
        dispatch({
          type: actions.DELETE_COMMENT,
          payload: { targetType: 'pr', parentId: pr.id, commentId }
        });
        setShowCommentMenu(null);
      };

      const handleToggleAssignee = (userId) => {
        const currentAssignees = pr.assignees || [];
        const newAssignees = currentAssignees.includes(userId)
          ? currentAssignees.filter(id => id !== userId)
          : [...currentAssignees, userId];
        dispatch({
          type: actions.UPDATE_PR,
          payload: { prId: pr.id, updates: { assignees: newAssignees } }
        });
      };

      const isDraft = pr.isDraft || false;

      const statusBadge = isMerged
        ? 'bg-purple-600'
        : isClosed
          ? 'bg-red-600'
          : isDraft
            ? 'bg-gray-600'
            : 'bg-xithub-success';

      const statusIcon = isMerged
        ? <GitMerge size={16} />
        : isClosed
          ? <GitPullRequest size={16} />
          : <GitPullRequest size={16} />;

      const statusText = isMerged ? 'Merged' : isClosed ? 'Closed' : isDraft ? 'Draft' : 'Open';

      const handleMarkReady = () => {
        dispatch({
          type: actions.UPDATE_PR,
          payload: { prId: pr.id, updates: { isDraft: false } }
        });
      };

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
                    {pr.title} <span className="text-xithub-muted">#{pr.number}</span>
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
               <span className={`px-3 py-1 rounded-full text-white font-semibold flex items-center gap-1 ${statusBadge}`}>
                  {statusIcon} {statusText}
               </span>
               <span className="text-xithub-muted">
                 <span className="font-semibold text-xithub-text">{author?.username}</span> wants to merge 1 commit into <span className="font-mono bg-[#21262d] px-1 rounded">{pr.baseBranch}</span> from <span className="font-mono bg-[#21262d] px-1 rounded">{pr.compareBranch}</span>
               </span>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
               {/* Description */}
               <div className="border border-xithub-border rounded-md mb-6">
                  <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 text-sm flex justify-between">
                     <span className="font-semibold">{author?.username}</span>
                     <span className="text-xithub-muted">commented on {new Date(pr.createdAt).toLocaleDateString()}</span>
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
                       <LinkedMarkdown repoId={pr.repoId}>{pr.description}</LinkedMarkdown>
                    </div>
                  )}
               </div>

               {/* Comments */}
               {(pr.comments || []).map(c => {
                 const commentAuthor = state.users.find(u => u.id === c.authorId);
                 const isOwnComment = c.authorId === state.currentUser.id;
                 return (
                   <div key={c.id} className="border border-xithub-border rounded-md mb-6">
                     <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 text-sm flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         <span className="font-semibold">{commentAuthor?.username}</span>
                         {c.isReview && (
                           <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                             c.reviewType === 'approve' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                             c.reviewType === 'request_changes' ? 'bg-red-900/50 text-red-400 border border-red-700' :
                             'bg-gray-700/50 text-gray-300 border border-gray-600'
                           }`}>
                             {c.reviewType === 'approve' ? 'Approved' : c.reviewType === 'request_changes' ? 'Changes requested' : 'Reviewed'}
                           </span>
                         )}
                       </div>
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
                       <div className="p-4 bg-xithub-bg text-sm prose prose-invert max-w-none"><LinkedMarkdown repoId={pr.repoId}>{c.content}</LinkedMarkdown></div>
                     )}
                   </div>
                 );
               })}

               {/* Merge Box */}
               {isOpen && isDraft && (
                 <div className="border border-xithub-border rounded-md bg-[#161b22] mb-6">
                    <div className="p-4 flex items-start gap-4">
                       <div className="bg-gray-500/20 p-2 rounded-full text-gray-400 border border-gray-500/50">
                          <GitPullRequest size={20} />
                       </div>
                       <div className="flex-1">
                          <h3 className="font-semibold text-white">This pull request is still a work in progress</h3>
                          <p className="text-sm text-xithub-muted mb-3">Draft pull requests cannot be merged.</p>
                          <button
                            onClick={handleMarkReady}
                            className="bg-xithub-success text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-opacity-90"
                          >
                             Ready for review
                          </button>
                       </div>
                    </div>
                 </div>
               )}
               {isOpen && !isDraft && (
                 <div className="border border-xithub-border rounded-md bg-[#161b22] mb-6">
                    {/* CI Checks */}
                    {(pr.checks || []).length > 0 && (
                      <div className="border-b border-xithub-border">
                        {(() => {
                          const checks = pr.checks || [];
                          const hasFailure = checks.some(c => c.status === 'failure');
                          const allSuccess = checks.every(c => c.status === 'success');
                          const successCount = checks.filter(c => c.status === 'success').length;
                          const failureCount = checks.filter(c => c.status === 'failure').length;
                          const pendingCount = checks.filter(c => c.status === 'pending').length;
                          return (
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                {hasFailure ? (
                                  <>
                                    <X size={16} className="text-red-500" />
                                    <span className="text-sm font-semibold text-white">Some checks were not successful</span>
                                  </>
                                ) : allSuccess ? (
                                  <>
                                    <Check size={16} className="text-green-500" />
                                    <span className="text-sm font-semibold text-white">All checks have passed</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={16} className="text-yellow-500" />
                                    <span className="text-sm font-semibold text-white">Some checks are pending</span>
                                  </>
                                )}
                                <span className="text-xs text-xithub-muted ml-1">
                                  {successCount} successful, {failureCount} failing, {pendingCount} pending
                                </span>
                              </div>
                              <div className="space-y-2">
                                {checks.map((check, idx) => (
                                  <div key={idx} className="flex items-center gap-3 text-sm pl-2">
                                    {check.status === 'success' && <Check size={14} className="text-green-500 shrink-0" />}
                                    {check.status === 'failure' && <X size={14} className="text-red-500 shrink-0" />}
                                    {check.status === 'pending' && <Clock size={14} className="text-yellow-500 shrink-0" />}
                                    <span className="text-white font-medium">{check.name}</span>
                                    <span className="text-xithub-muted text-xs">{check.detail}</span>
                                  </div>
                                ))}
                              </div>
                              {hasFailure && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-800/50 rounded-md px-3 py-2">
                                  <AlertTriangle size={14} />
                                  <span>Some checks were not successful. Merging is still possible.</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    <div className="p-4 flex items-start gap-4">
                       <div className="bg-green-500/20 p-2 rounded-full text-green-500 border border-green-500/50">
                          <Check size={20} />
                       </div>
                       <div className="flex-1">
                          <h3 className="font-semibold text-white">This branch has no conflicts with the base branch</h3>
                          <p className="text-sm text-xithub-muted mb-3">Merging can be performed automatically.</p>
                          <div className="relative inline-flex">
                            <button
                              onClick={handleMerge}
                              className="bg-xithub-success text-white px-4 py-2 rounded-l-md font-semibold text-sm hover:bg-opacity-90 flex items-center gap-2"
                            >
                               <GitMerge size={16} /> {selectedStrategy.label}
                            </button>
                            <button
                              onClick={() => setShowMergeDropdown(!showMergeDropdown)}
                              className="bg-xithub-success text-white px-2 py-2 rounded-r-md font-semibold text-sm hover:bg-opacity-90 border-l border-green-700"
                            >
                              <ChevronDown size={16} />
                            </button>
                            {showMergeDropdown && (
                              <div className="absolute top-full left-0 mt-1 w-80 bg-[#161b22] border border-xithub-border rounded-md shadow-xl z-50 overflow-hidden">
                                {mergeStrategies.map(strategy => (
                                  <button
                                    key={strategy.id}
                                    onClick={() => {
                                      setMergeStrategy(strategy.id);
                                      setShowMergeDropdown(false);
                                      dispatch({
                                        type: actions.UPDATE_PR,
                                        payload: { prId: pr.id, updates: { mergeStrategy: strategy.id } }
                                      });
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-[#21262d] flex items-start gap-3 ${mergeStrategy === strategy.id ? 'bg-[#21262d]' : ''}`}
                                  >
                                    <div className="pt-0.5">
                                      {mergeStrategy === strategy.id ? (
                                        <Check size={14} className="text-xithub-accent" />
                                      ) : (
                                        <div className="w-3.5" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-white">{strategy.label}</div>
                                      <div className="text-xs text-xithub-muted mt-0.5">{strategy.desc}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {isMerged && (
                 <div className="border border-purple-600 rounded-md bg-purple-900/20 mb-6">
                    <div className="p-4 flex items-center gap-4">
                       <div className="bg-purple-500/20 p-2 rounded-full text-purple-400 border border-purple-500/50">
                          <GitMerge size={20} />
                       </div>
                       <div>
                          <h3 className="font-semibold text-white">Pull request successfully merged and closed</h3>
                          <p className="text-sm text-xithub-muted">You're all set—the {pr.compareBranch} branch can be safely deleted.</p>
                       </div>
                    </div>
                 </div>
               )}

               {/* Comment form */}
               <form onSubmit={handleComment} className="border border-xithub-border rounded-md overflow-hidden bg-xithub-bg mb-6">
                 <div className="bg-[#161b22] border-b border-xithub-border p-2">
                   <span className="text-sm font-semibold px-2">Write</span>
                 </div>
                 <div className="p-2">
                   <textarea
                     className="w-full h-24 bg-[#0d1117] border border-xithub-border rounded-md p-2 text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                     placeholder="Leave a comment"
                     value={comment}
                     onChange={e => setComment(e.target.value)}
                   ></textarea>
                 </div>
                 <div className="p-2 flex justify-end gap-2 bg-[#161b22] border-t border-xithub-border">
                   {!isMerged && (
                     <button
                       type="button"
                       onClick={handleToggleStatus}
                       className={`px-4 py-1.5 rounded-md font-semibold text-sm border border-xithub-border hover:bg-[#30363d] ${isOpen ? 'text-red-400' : 'text-green-400'}`}
                     >
                       {isOpen ? 'Close pull request' : 'Reopen pull request'}
                     </button>
                   )}
                   <button type="submit" className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90">
                     Comment
                   </button>
                 </div>
               </form>

               {/* Mock Diff for PR */}
               <div className="flex items-center justify-between mb-4">
                 <span className="font-semibold text-lg">Files changed</span>
                 {isOpen && (
                   <div className="relative">
                     <button
                       onClick={() => setShowReviewForm(!showReviewForm)}
                       className="px-4 py-1.5 bg-xithub-success text-white rounded-md font-semibold text-sm hover:bg-opacity-90"
                     >
                       Review changes
                     </button>
                     {showReviewForm && (
                       <div className="absolute right-0 top-full mt-2 w-96 bg-[#161b22] border border-xithub-border rounded-md shadow-xl z-50">
                         <div className="p-4">
                           <textarea
                             value={reviewBody}
                             onChange={e => setReviewBody(e.target.value)}
                             placeholder="Leave a review comment..."
                             className="w-full h-24 bg-[#0d1117] border border-xithub-border rounded-md p-2 text-xithub-text text-sm focus:ring-1 focus:ring-xithub-accent outline-none resize-y mb-3"
                           />
                           <div className="space-y-2 mb-4">
                             <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-[#21262d]">
                               <input type="radio" name="reviewType" value="comment" checked={reviewType === 'comment'} onChange={() => setReviewType('comment')} className="mt-0.5 accent-xithub-accent" />
                               <div>
                                 <div className="text-sm font-medium text-white">Comment</div>
                                 <div className="text-xs text-xithub-muted">Submit general feedback without explicit approval.</div>
                               </div>
                             </label>
                             <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-[#21262d]">
                               <input type="radio" name="reviewType" value="approve" checked={reviewType === 'approve'} onChange={() => setReviewType('approve')} className="mt-0.5 accent-green-500" />
                               <div>
                                 <div className="text-sm font-medium text-green-400">Approve</div>
                                 <div className="text-xs text-xithub-muted">Submit feedback and approve merging these changes.</div>
                               </div>
                             </label>
                             <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-[#21262d]">
                               <input type="radio" name="reviewType" value="request_changes" checked={reviewType === 'request_changes'} onChange={() => setReviewType('request_changes')} className="mt-0.5 accent-red-500" />
                               <div>
                                 <div className="text-sm font-medium text-red-400">Request changes</div>
                                 <div className="text-xs text-xithub-muted">Submit feedback that must be addressed before merging.</div>
                               </div>
                             </label>
                           </div>
                           <div className="flex justify-end">
                             <button
                               onClick={handleSubmitReview}
                               className={`px-4 py-1.5 rounded-md font-semibold text-sm text-white ${
                                 reviewType === 'approve' ? 'bg-xithub-success hover:bg-opacity-90' :
                                 reviewType === 'request_changes' ? 'bg-red-600 hover:bg-opacity-90' :
                                 'bg-xithub-success hover:bg-opacity-90'
                               }`}
                             >
                               Submit review
                             </button>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
               </div>
               <div className="border border-xithub-border rounded-md overflow-hidden">
                  <div className="bg-[#161b22] border-b border-xithub-border p-2 px-4 flex items-center justify-between">
                     <div className="font-mono text-sm text-xithub-text">src/auth/Login.js</div>
                     <button className="text-xs text-xithub-muted hover:text-xithub-accent">View file</button>
                  </div>
                  <div className="bg-[#0d1117] font-mono text-sm overflow-x-auto p-4">
                     <div className="text-green-500">+ function login() {'{'}</div>
                     <div className="text-green-500">+   return true;</div>
                     <div className="text-green-500">+ {'}'}</div>
                  </div>
               </div>
            </div>

            {/* Sidebar */}
            <div className="w-64 space-y-6">
               <div className="border-b border-xithub-border pb-4 relative">
                  <div
                    onClick={() => setShowReviewerMenu(!showReviewerMenu)}
                    className="flex items-center justify-between text-xithub-muted hover:text-xithub-accent cursor-pointer mb-1"
                  >
                     <span className="text-sm font-semibold">Reviewers</span>
                     <span className="text-xs">⚙</span>
                  </div>
                  {showReviewerMenu && (
                    <div className="absolute left-0 top-8 w-full bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                      {state.users.filter(u => u.id !== pr.authorId).map(u => {
                        const isReviewer = (pr.reviewers || []).some(r => r.userId === u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => handleToggleReviewer(u.id)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] flex items-center gap-2"
                          >
                            <span className={`w-3 h-3 rounded-sm border ${isReviewer ? 'bg-xithub-accent border-xithub-accent' : 'border-xithub-border'}`}></span>
                            <img src={u.avatar} alt={u.username} className="w-4 h-4 rounded-full" />
                            {u.username}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {(!pr.reviewers || pr.reviewers.length === 0) ? (
                    <div className="text-xs text-xithub-muted">No reviews yet</div>
                  ) : (
                    <div className="space-y-2">
                      {pr.reviewers.map(reviewer => {
                        const reviewerUser = state.users.find(u => u.id === reviewer.userId);
                        return (
                          <div key={reviewer.userId} className="flex items-center gap-2 text-xs">
                            {reviewer.status === 'approved' && (
                              <Check size={14} className="text-green-500" />
                            )}
                            {reviewer.status === 'pending' && (
                              <Circle size={14} className="text-yellow-500 fill-yellow-500" />
                            )}
                            {reviewer.status === 'changes_requested' && (
                              <X size={14} className="text-red-500" />
                            )}
                            <span className="text-xithub-text">{reviewerUser?.username || 'Unknown'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
               </div>

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
                      {state.users.map(u => {
                        const isAssigned = (pr.assignees || []).includes(u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => handleToggleAssignee(u.id)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] flex items-center gap-2"
                          >
                            <span className={`w-3 h-3 rounded-sm border ${isAssigned ? 'bg-xithub-accent border-xithub-accent' : 'border-xithub-border'}`}></span>
                            <img src={u.avatar} alt={u.username} className="w-4 h-4 rounded-full" />
                            {u.username}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="text-xs text-xithub-muted">
                    {(pr.assignees || []).length > 0
                      ? (pr.assignees || []).map(id => state.users.find(u => u.id === id)?.username || id).join(', ')
                      : 'No one assigned'}
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
    }
