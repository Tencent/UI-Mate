
    import React, { useState } from 'react';
    import { useOutletContext, Link } from 'react-router-dom';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';
    import { Milestone as MilestoneIcon, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

    export default function Milestones() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const [filter, setFilter] = useState('open');
      const [showNewForm, setShowNewForm] = useState(false);
      const [newTitle, setNewTitle] = useState('');
      const [newDescription, setNewDescription] = useState('');
      const [newDueDate, setNewDueDate] = useState('');

      const allMilestones = (state.milestones || []).filter(m => m.repoId === repo.id);
      const openMilestones = allMilestones.filter(m => m.state === 'open');
      const closedMilestones = allMilestones.filter(m => m.state === 'closed');
      const filteredMilestones = filter === 'open' ? openMilestones : closedMilestones;

      const getMilestoneIssueStats = (milestoneTitle) => {
        const issues = state.issues.filter(i => i.repoId === repo.id && i.milestone === milestoneTitle);
        const total = issues.length;
        const closed = issues.filter(i => i.status === 'closed').length;
        const open = total - closed;
        const progress = total > 0 ? Math.round((closed / total) * 100) : 0;
        return { total, open, closed, progress };
      };

      const handleCreateMilestone = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const newMilestone = {
          id: generateId(),
          repoId: repo.id,
          title: newTitle.trim(),
          description: newDescription.trim(),
          dueDate: newDueDate || null,
          state: 'open',
          createdAt: new Date().toISOString()
        };

        dispatch({ type: actions.ADD_MILESTONE, payload: newMilestone });
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setShowNewForm(false);
      };

      const handleToggleMilestoneState = (ms) => {
        dispatch({
          type: actions.UPDATE_MILESTONE,
          payload: {
            milestoneId: ms.id,
            updates: { state: ms.state === 'open' ? 'closed' : 'open' }
          }
        });
      };

      const formatDate = (dateStr) => {
        if (!dateStr) return 'No due date';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      };

      const isDueSoon = (dateStr) => {
        if (!dateStr) return false;
        const diff = new Date(dateStr).getTime() - Date.now();
        return diff > 0 && diff < 7 * 24 * 3600000;
      };

      const isPastDue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr).getTime() < Date.now();
      };

      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/${owner.username}/${repo.name}/issues`}
                className="text-sm text-xithub-muted hover:text-xithub-accent"
              >
                &larr; Back to Issues
              </Link>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
            >
              New milestone
            </button>
          </div>

          {/* New Milestone Form */}
          {showNewForm && (
            <form onSubmit={handleCreateMilestone} className="bg-xithub-card border border-xithub-border rounded-md p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">New milestone</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-xithub-text mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text text-sm focus:ring-2 focus:ring-xithub-accent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-xithub-text mb-1">Due date (optional)</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text text-sm focus:ring-2 focus:ring-xithub-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-xithub-text mb-1">Description (optional)</label>
                  <textarea
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full h-24 bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text text-sm focus:ring-2 focus:ring-xithub-accent outline-none resize-y"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-1.5 text-xithub-muted text-sm hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90">
                    Create milestone
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Filter tabs */}
          <div className="bg-xithub-card border border-xithub-border rounded-md overflow-hidden">
            <div className="bg-[#161b22] border-b border-xithub-border p-3 flex items-center gap-4 text-sm">
              <button
                onClick={() => setFilter('open')}
                className={`flex items-center gap-1 ${filter === 'open' ? 'font-semibold text-white' : 'text-xithub-muted hover:text-white'}`}
              >
                <MilestoneIcon size={16} /> {openMilestones.length} Open
              </button>
              <button
                onClick={() => setFilter('closed')}
                className={`flex items-center gap-1 ${filter === 'closed' ? 'font-semibold text-white' : 'text-xithub-muted hover:text-white'}`}
              >
                <CheckCircle size={16} /> {closedMilestones.length} Closed
              </button>
            </div>

            <div className="divide-y divide-xithub-border">
              {filteredMilestones.map(ms => {
                const stats = getMilestoneIssueStats(ms.title);
                return (
                  <div key={ms.id} className="p-4 hover:bg-[#161b22]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          to={`/${owner.username}/${repo.name}/issues?milestone=${encodeURIComponent(ms.title)}`}
                          className="text-lg font-semibold text-xithub-accent hover:underline"
                        >
                          {ms.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-xithub-muted mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {ms.dueDate ? (
                              <span className={isPastDue(ms.dueDate) ? 'text-red-400' : isDueSoon(ms.dueDate) ? 'text-yellow-400' : ''}>
                                Due by {formatDate(ms.dueDate)}
                              </span>
                            ) : (
                              'No due date'
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleMilestoneState(ms)}
                        className="text-xs px-3 py-1 border border-xithub-border rounded-md text-xithub-muted hover:text-white hover:bg-[#30363d]"
                      >
                        {ms.state === 'open' ? 'Close' : 'Reopen'}
                      </button>
                    </div>
                    {ms.description && (
                      <p className="text-sm text-xithub-muted mb-3">{ms.description}</p>
                    )}
                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="w-full bg-[#21262d] rounded-full h-2.5">
                        <div
                          className="bg-xithub-success h-2.5 rounded-full transition-all"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-xithub-muted">
                      <span>{stats.progress}% complete</span>
                      <span className="flex items-center gap-1">
                        <AlertCircle size={12} className="text-green-500" />
                        {stats.open} open
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-purple-500" />
                        {stats.closed} closed
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredMilestones.length === 0 && (
                <div className="p-12 text-center text-xithub-muted">
                  <MilestoneIcon size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {filter === 'open' ? 'No open milestones' : 'No closed milestones'}
                  </h3>
                  <p className="text-sm">
                    {filter === 'open' ? 'Create a new milestone to track progress.' : 'Closed milestones will appear here.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
