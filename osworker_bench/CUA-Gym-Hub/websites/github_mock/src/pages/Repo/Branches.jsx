
    import React, { useState } from 'react';
    import { useOutletContext } from 'react-router-dom';
    import { GitBranch, Trash2, Plus } from 'lucide-react';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';

    function getRelativeTime(dateStr) {
      if (!dateStr) return 'unknown';
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'just now';
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    export default function Branches() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const [showNewForm, setShowNewForm] = useState(false);
      const [newBranchName, setNewBranchName] = useState('');
      const [baseBranch, setBaseBranch] = useState(repo.defaultBranch || 'main');
      const [confirmDelete, setConfirmDelete] = useState(null);
      const [branchError, setBranchError] = useState('');

      const branches = state.branches.filter(b => b.repoId === repo.id);
      const defaultBranch = branches.find(b => b.name === repo.defaultBranch);

      const getAheadBehind = (branch) => {
        // Deterministic values based on branch id to avoid re-renders changing values
        const hash = branch.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return { ahead: (hash % 5) + 1, behind: (hash % 3) };
      };
      const getLastCommit = (branch) => {
        return state.commits.find(c => c.id === branch.lastCommitId) ||
               state.commits.find(c => c.repoId === repo.id && c.branch === branch.name);
      };

      const handleCreateBranch = (e) => {
        e.preventDefault();
        setBranchError('');
        if (!newBranchName.trim()) return;
        if (branches.some(b => b.name === newBranchName.trim())) {
          setBranchError('Branch name already exists');
          return;
        }
        setBranchError('');
        const base = branches.find(b => b.name === baseBranch);
        const newBranch = {
          id: `b_${generateId()}`,
          repoId: repo.id,
          name: newBranchName.trim(),
          lastCommitId: base?.lastCommitId || '',
        };
        dispatch({ type: actions.ADD_BRANCH, payload: newBranch });
        setNewBranchName('');
        setBranchError('');
        setShowNewForm(false);
      };

      const handleDeleteBranch = (branchId) => {
        dispatch({ type: actions.DELETE_BRANCH, payload: { branchId } });
        setConfirmDelete(null);
      };

      return (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <GitBranch size={20} />
              Branches
            </h2>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90 flex items-center gap-2"
            >
              <Plus size={16} /> New branch
            </button>
          </div>

          {showNewForm && (
            <form onSubmit={handleCreateBranch} className="mb-6 border border-xithub-border rounded-md p-4 bg-xithub-card">
              <h3 className="font-semibold text-white mb-3">Create a branch</h3>
              {branchError && (
                <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-md text-sm text-red-400">
                  {branchError}
                </div>
              )}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-xithub-muted mb-1">Branch name</label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={e => { setNewBranchName(e.target.value); setBranchError(''); }}
                    placeholder="new-feature"
                    className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-1.5 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                    required
                  />
                  {branchError && <p className="mt-1 text-xs text-red-400">{branchError}</p>}
                </div>
                <div>
                  <label className="block text-xs text-xithub-muted mb-1">Base branch</label>
                  <select
                    value={baseBranch}
                    onChange={e => setBaseBranch(e.target.value)}
                    className="bg-[#0d1117] border border-xithub-border rounded-md px-3 py-1.5 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
                >
                  Create branch
                </button>
              </div>
              {branchError && <div className="text-sm text-red-400 mt-3">{branchError}</div>}
            </form>
          )}

          {/* Default branch */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-xithub-muted mb-2">Default branch</h3>
          </div>

          <div className="border border-xithub-border rounded-md divide-y divide-xithub-border">
            {branches.map(branch => {
              const lastCommit = getLastCommit(branch);
              const isDefault = branch.name === repo.defaultBranch;
              const aheadBehind = isDefault ? null : getAheadBehind(branch);

              return (
                <div key={branch.id} className="p-4 flex items-center justify-between hover:bg-[#161b22]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <GitBranch size={14} className="text-xithub-muted shrink-0" />
                      <span className="font-mono text-sm text-xithub-text font-semibold">
                        {branch.name}
                      </span>
                      {isDefault && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#1f6feb33] text-[#58a6ff]">
                          default
                        </span>
                      )}
                      {branch.isProtected && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-yellow-900/30 text-yellow-400">
                          protected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-xithub-muted flex items-center gap-3">
                      {lastCommit && (
                        <>
                          <span className="truncate max-w-[300px]">{lastCommit.message}</span>
                          <span>{getRelativeTime(lastCommit.date)}</span>
                        </>
                      )}
                      {!lastCommit && <span>No commits</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {aheadBehind && (
                      <div className="text-xs text-xithub-muted">
                        <span className="text-green-400">{aheadBehind.ahead} ahead</span>
                        {' / '}
                        <span className="text-red-400">{aheadBehind.behind} behind</span>
                      </div>
                    )}
                    {!isDefault && (
                      <div className="relative">
                        {confirmDelete === branch.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-400">Delete?</span>
                            <button
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="px-2 py-0.5 text-xs text-red-400 border border-red-700 rounded hover:bg-red-900/30"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-0.5 text-xs text-xithub-muted border border-xithub-border rounded hover:bg-[#30363d]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(branch.id)}
                            className="p-1.5 text-xithub-muted hover:text-red-400 rounded hover:bg-[#30363d]"
                            title="Delete branch"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {branches.length === 0 && (
              <div className="p-8 text-center text-xithub-muted text-sm">
                No branches found for this repository.
              </div>
            )}
          </div>
        </div>
      );
    }
