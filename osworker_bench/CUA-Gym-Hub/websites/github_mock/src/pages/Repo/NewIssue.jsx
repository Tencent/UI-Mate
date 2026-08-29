
    import React, { useState } from 'react';
    import { useOutletContext, useNavigate } from 'react-router-dom';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';
    import LabelBadge from '../../components/LabelBadge';

    export default function NewIssue() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const navigate = useNavigate();

      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const [selectedAssignees, setSelectedAssignees] = useState([]);
      const [selectedLabels, setSelectedLabels] = useState([]);
      const [selectedMilestone, setSelectedMilestone] = useState(null);
      const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
      const [showLabelMenu, setShowLabelMenu] = useState(false);
      const [showMilestoneMenu, setShowMilestoneMenu] = useState(false);

      const repoLabels = (state.labels || []).filter(l => l.repoId === repo.id);
      const repoMilestones = (state.milestones || []).filter(m => m.repoId === repo.id && m.state === 'open');

      const handleToggleAssignee = (userId) => {
        setSelectedAssignees(prev =>
          prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
      };

      const handleToggleLabel = (labelName) => {
        setSelectedLabels(prev =>
          prev.includes(labelName) ? prev.filter(l => l !== labelName) : [...prev, labelName]
        );
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newIssue = {
          id: generateId(),
          repoId: repo.id,
          number: Math.max(0, ...state.issues.filter(i => i.repoId === repo.id).map(i => i.number), ...state.pullRequests.filter(p => p.repoId === repo.id).map(p => p.number)) + 1,
          title,
          description,
          status: "open",
          authorId: state.currentUser.id,
          assignees: selectedAssignees,
          labels: selectedLabels,
          milestone: selectedMilestone,
          column: "todo",
          createdAt: new Date().toISOString(),
          comments: [],
          reactions: {}
        };

        dispatch({ type: actions.ADD_ISSUE, payload: newIssue });
        navigate(`/${owner.username}/${repo.name}/issues/${newIssue.number}`);
      };

      return (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">New Issue</h1>

          <div className="flex gap-4">
            <img src={state.currentUser.avatar} alt={state.currentUser.username} className="w-10 h-10 rounded-full border border-xithub-border" />

            <form onSubmit={handleSubmit} className="flex-1 bg-xithub-card border border-xithub-border rounded-md p-4 relative">
               <div className="absolute top-4 -left-2 w-3 h-3 bg-xithub-card border-l border-t border-xithub-border transform -rotate-45"></div>

               <div className="mb-4">
                 <input
                   type="text"
                   placeholder="Title"
                   className="w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text focus:ring-2 focus:ring-xithub-accent focus:border-transparent outline-none"
                   value={title}
                   onChange={e => setTitle(e.target.value)}
                   required
                 />
               </div>

               <div className="mb-4">
                 <textarea
                   placeholder="Leave a comment"
                   className="w-full h-48 bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-xithub-text focus:ring-2 focus:ring-xithub-accent focus:border-transparent outline-none resize-y"
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                 ></textarea>
                 <div className="text-xs text-xithub-muted mt-2 text-right">Markdown supported</div>
               </div>

               <div className="flex justify-end gap-2">
                 <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-xithub-muted hover:text-xithub-text">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-xithub-success text-white font-semibold rounded-md hover:bg-opacity-90">
                   Submit new issue
                 </button>
               </div>
            </form>

            {/* Sidebar */}
            <div className="w-64 space-y-4">
              {/* Assignees */}
              <div className="border-b border-xithub-border pb-4 relative">
                <div
                  onClick={() => { setShowAssigneeMenu(!showAssigneeMenu); setShowLabelMenu(false); setShowMilestoneMenu(false); }}
                  className="flex items-center justify-between text-xithub-muted hover:text-xithub-accent cursor-pointer mb-1"
                >
                  <span className="text-sm font-semibold">Assignees</span>
                  <span className="text-xs">&#x2699;</span>
                </div>
                {showAssigneeMenu && (
                  <div className="absolute left-0 top-8 w-full bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                    {state.users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleToggleAssignee(u.id)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] flex items-center gap-2"
                      >
                        <span className={`w-3 h-3 rounded-sm border ${selectedAssignees.includes(u.id) ? 'bg-xithub-accent border-xithub-accent' : 'border-xithub-border'}`}></span>
                        <img src={u.avatar} alt={u.username} className="w-4 h-4 rounded-full" />
                        {u.username}
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-xs text-xithub-muted">
                  {selectedAssignees.length > 0
                    ? selectedAssignees.map(id => state.users.find(u => u.id === id)?.username || id).join(', ')
                    : 'No one\u2014assign yourself'}
                </div>
              </div>

              {/* Labels */}
              <div className="border-b border-xithub-border pb-4 relative">
                <div
                  onClick={() => { setShowLabelMenu(!showLabelMenu); setShowAssigneeMenu(false); setShowMilestoneMenu(false); }}
                  className="flex items-center justify-between text-xithub-muted hover:text-xithub-accent cursor-pointer mb-1"
                >
                  <span className="text-sm font-semibold">Labels</span>
                  <span className="text-xs">&#x2699;</span>
                </div>
                {showLabelMenu && (
                  <div className="absolute left-0 top-8 w-full bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1 max-h-60 overflow-auto">
                    {repoLabels.map(label => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => handleToggleLabel(label.name)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] flex items-center gap-2"
                      >
                        <span className={`w-3 h-3 rounded-sm border ${selectedLabels.includes(label.name) ? 'bg-xithub-accent border-xithub-accent' : 'border-xithub-border'}`}></span>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }}></span>
                        {label.name}
                      </button>
                    ))}
                    {repoLabels.length === 0 && <div className="px-3 py-1.5 text-xs text-xithub-muted">No labels</div>}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedLabels.map(l => (
                    <LabelBadge key={l} name={l} repoId={repo.id} />
                  ))}
                  {selectedLabels.length === 0 && <span className="text-xs text-xithub-muted">None yet</span>}
                </div>
              </div>

              {/* Milestone */}
              <div className="border-b border-xithub-border pb-4 relative">
                <div
                  onClick={() => { setShowMilestoneMenu(!showMilestoneMenu); setShowAssigneeMenu(false); setShowLabelMenu(false); }}
                  className="flex items-center justify-between text-xithub-muted hover:text-xithub-accent cursor-pointer mb-1"
                >
                  <span className="text-sm font-semibold">Milestone</span>
                  <span className="text-xs">&#x2699;</span>
                </div>
                {showMilestoneMenu && (
                  <div className="absolute left-0 top-8 w-full bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedMilestone(null); setShowMilestoneMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${!selectedMilestone ? 'text-white font-semibold' : ''}`}
                    >
                      No milestone
                    </button>
                    {repoMilestones.map(ms => (
                      <button
                        key={ms.id}
                        type="button"
                        onClick={() => { setSelectedMilestone(ms.title); setShowMilestoneMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${selectedMilestone === ms.title ? 'text-white font-semibold' : ''}`}
                      >
                        {ms.title}
                      </button>
                    ))}
                    {repoMilestones.length === 0 && <div className="px-3 py-1.5 text-xs text-xithub-muted">No milestones</div>}
                  </div>
                )}
                <div className="text-xs text-xithub-muted">
                  {selectedMilestone || 'No milestone'}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
