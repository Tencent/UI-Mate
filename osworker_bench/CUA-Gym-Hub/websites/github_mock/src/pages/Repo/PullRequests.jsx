
    import React, { useState } from 'react';
    import { useOutletContext, Link, useNavigate } from 'react-router-dom';
    import { GitPullRequest, Check, MessageSquare, GitMerge } from 'lucide-react';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';
    import LabelBadge from '../../components/LabelBadge';

    export default function PullRequests() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const navigate = useNavigate();
      const [filter, setFilter] = useState('open');
      const [showNewPRForm, setShowNewPRForm] = useState(false);
      const [newTitle, setNewTitle] = useState('');
      const [newDescription, setNewDescription] = useState('');
      const [baseBranch, setBaseBranch] = useState('main');
      const [compareBranch, setCompareBranch] = useState('');
      const [isDraft, setIsDraft] = useState(false);

      const allPRs = state.pullRequests.filter(pr => pr.repoId === repo.id);
      const openCount = allPRs.filter(p => p.status === 'open').length;
      const closedCount = allPRs.filter(p => p.status === 'closed' || p.status === 'merged').length;
      const prs = allPRs.filter(p => {
        if (filter === 'open') return p.status === 'open';
        return p.status === 'closed' || p.status === 'merged';
      });

      const branches = state.branches?.filter(b => b.repoId === repo.id) || [];

      const handleCreatePR = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const allNumbers = [
          ...state.issues.filter(i => i.repoId === repo.id).map(i => i.number),
          ...allPRs.map(p => p.number)
        ];
        const nextNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 1;

        const newPR = {
          id: generateId(),
          repoId: repo.id,
          number: nextNumber,
          title: newTitle.trim(),
          description: newDescription,
          status: 'open',
          isDraft: isDraft,
          authorId: state.currentUser.id,
          baseBranch: baseBranch || 'main',
          compareBranch: compareBranch || 'feature-branch',
          reviewers: [],
          assignees: [],
          comments: [],
          checks: [],
          createdAt: new Date().toISOString(),
        };

        dispatch({ type: actions.ADD_PULL_REQUEST, payload: newPR });
        navigate(`${newPR.number}`);
      };

      if (showNewPRForm) {
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">New Pull Request</h1>
            <div className="flex gap-4 mb-6 items-center text-sm">
              <span className="text-xithub-muted">base:</span>
              <select
                value={baseBranch}
                onChange={e => setBaseBranch(e.target.value)}
                className="bg-[#21262d] border border-xithub-border rounded-md px-2 py-1 text-sm text-xithub-text"
              >
                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                {branches.length === 0 && <option value="main">main</option>}
              </select>
              <span className="text-xithub-muted">←</span>
              <span className="text-xithub-muted">compare:</span>
              <select
                value={compareBranch}
                onChange={e => setCompareBranch(e.target.value)}
                className="bg-[#21262d] border border-xithub-border rounded-md px-2 py-1 text-sm text-xithub-text"
              >
                <option value="">Select branch</option>
                {branches.filter(b => b.name !== baseBranch).map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <form onSubmit={handleCreatePR} className="bg-xithub-card border border-xithub-border rounded-md p-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text focus:ring-2 focus:ring-xithub-accent focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="Leave a description"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full h-48 bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text focus:ring-2 focus:ring-xithub-accent focus:border-transparent outline-none resize-y"
                ></textarea>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-xithub-text cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDraft}
                    onChange={e => setIsDraft(e.target.checked)}
                    className="accent-xithub-muted rounded"
                  />
                  Create as draft
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowNewPRForm(false)} className="px-4 py-2 text-xithub-muted hover:text-xithub-text">Cancel</button>
                  <button type="submit" className={`px-4 py-2 font-semibold rounded-md hover:bg-opacity-90 ${isDraft ? 'bg-[#30363d] text-white border border-xithub-border' : 'bg-xithub-success text-white'}`}>
                    {isDraft ? 'Create draft pull request' : 'Create pull request'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
      }

      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-4">
             <button
               onClick={() => setShowNewPRForm(true)}
               className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
             >
                New Pull Request
             </button>
          </div>

          <div className="bg-xithub-card border border-xithub-border rounded-md overflow-hidden">
            <div className="bg-[#161b22] border-b border-xithub-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => setFilter('open')}
                  className={`flex items-center gap-1 ${filter === 'open' ? 'font-semibold text-white' : 'text-xithub-muted hover:text-white'}`}
                >
                  <GitPullRequest size={16} /> {openCount} Open
                </button>
                <button
                  onClick={() => setFilter('closed')}
                  className={`flex items-center gap-1 ${filter === 'closed' ? 'font-semibold text-white' : 'text-xithub-muted hover:text-white'}`}
                >
                  <Check size={16} /> {closedCount} Closed
                </button>
              </div>
            </div>

            <div className="divide-y divide-xithub-border">
              {prs.map(pr => {
                const author = state.users.find(u => u.id === pr.authorId);
                const isMerged = pr.status === 'merged';
                return (
                  <div key={pr.id} className="p-3 hover:bg-[#161b22] flex items-start gap-2 group">
                    <div className="pt-1">
                      {isMerged
                        ? <GitMerge size={16} className="text-purple-500" />
                        : pr.isDraft
                          ? <GitPullRequest size={16} className="text-gray-500" />
                          : <GitPullRequest size={16} className={pr.status === 'open' ? "text-green-500" : "text-red-500"} />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`${pr.number}`} className="font-semibold text-white hover:text-xithub-accent hover:underline cursor-pointer">
                          {pr.title}
                        </Link>
                        {(pr.labels || []).map(label => (
                          <LabelBadge key={label} name={label} repoId={pr.repoId} />
                        ))}
                      </div>
                      <div className="text-xs text-xithub-muted">
                        #{pr.number} {isMerged ? 'merged' : 'opened'} on {new Date(pr.createdAt).toLocaleDateString()} by {author?.username}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-xithub-muted">
                       {(() => {
                         if (isMerged) return <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full">Merged</span>;
                         if (pr.isDraft) return <span className="bg-gray-600 text-white px-2 py-0.5 rounded-full">Draft</span>;
                         const reviewers = pr.reviewers || [];
                         if (reviewers.length === 0) {
                           return <span className="bg-[#238636] text-white px-2 py-0.5 rounded-full">Review required</span>;
                         }
                         if (reviewers.some(r => r.status === 'changes_requested')) {
                           return <span className="bg-red-600 text-white px-2 py-0.5 rounded-full">Changes requested</span>;
                         }
                         if (reviewers.every(r => r.status === 'approved')) {
                           return <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full">Approved</span>;
                         }
                         return <span className="bg-[#238636] text-white px-2 py-0.5 rounded-full">Review required</span>;
                       })()}
                    </div>
                  </div>
                );
              })}

               {prs.length === 0 && (
                 <div className="p-12 text-center text-xithub-muted">
                    <GitPullRequest size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-white">No pull requests</h3>
                    <p>There are no {filter} pull requests in this repository.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      );
    }
