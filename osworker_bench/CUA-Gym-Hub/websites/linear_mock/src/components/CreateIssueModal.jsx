import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { PriorityIcon, StatusIcon, PRIORITY_LABELS } from './Icons.jsx';
import './CreateIssueModal.css';

export default function CreateIssueModal({ onClose }) {
  const { state, dispatch } = useApp();
  const [teamId, setTeamId] = useState(state.teams?.[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [stateId, setStateId] = useState('');
  const [assigneeId, setAssigneeId] = useState(null);
  const [labelIds, setLabelIds] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [cycleId, setCycleId] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const titleRef = useRef(null);

  const team = state.teams?.find(t => t.id === teamId);

  useEffect(() => {
    if (team) {
      const firstUnstarted = team.workflowStates?.find(s => s.category === 'unstarted');
      setStateId(firstUnstarted?.id || team.workflowStates?.[0]?.id || '');
    }
  }, [teamId]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleCreate() {
    if (!title.trim()) return;
    const counter = (state.issueCounters?.[teamId] || 0) + 1;
    const identifier = `${team?.key}-${counter}`;
    dispatch({
      type: 'CREATE_ISSUE',
      issue: {
        id: `i${Date.now()}`,
        identifier,
        number: counter,
        title: title.trim(),
        description,
        stateId,
        priority,
        estimate: null,
        assigneeId,
        creatorId: state.currentUserId,
        teamId,
        projectId,
        cycleId,
        labelIds,
        parentId: null,
        dueDate: dueDate || null,
        subscriberIds: [state.currentUserId],
        relationIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        sortOrder: Date.now(),
      },
    });
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCreate();
  }

  const teamMembers = state.users?.filter(u => team?.memberIds?.includes(u.id)) || [];
  const teamProjects = (state.projects || []).filter(p => p.teamIds?.includes(teamId));
  const teamCycles = (state.cycles || []).filter(c => c.teamId === teamId && !c.isCompleted);

  function toggleLabel(labelId) {
    setLabelIds(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={handleKeyDown}>
      <div className="create-modal">
        {/* Team selector */}
        <div className="create-modal-header">
          <select
            className="team-select"
            value={teamId}
            onChange={e => setTeamId(e.target.value)}
          >
            {state.teams?.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
            ))}
          </select>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Title */}
        <input
          ref={titleRef}
          className="create-title-input"
          placeholder="Issue title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Description */}
        <textarea
          className="create-desc-textarea"
          placeholder="Add description..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />

        {/* Property row */}
        <div className="create-props">
          {/* Status */}
          <div className="create-prop-group">
            <label className="create-prop-label">Status</label>
            <select className="create-prop-select" value={stateId} onChange={e => setStateId(e.target.value)}>
              {team?.workflowStates?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="create-prop-group">
            <label className="create-prop-label">Priority</label>
            <select className="create-prop-select" value={priority} onChange={e => setPriority(Number(e.target.value))}>
              {[0,1,2,3,4].map(p => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="create-prop-group">
            <label className="create-prop-label">Assignee</label>
            <select className="create-prop-select" value={assigneeId || ''} onChange={e => setAssigneeId(e.target.value || null)}>
              <option value="">Unassigned</option>
              {teamMembers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="create-prop-group">
            <label className="create-prop-label">Project</label>
            <select className="create-prop-select" value={projectId || ''} onChange={e => setProjectId(e.target.value || null)}>
              <option value="">No project</option>
              {teamProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Cycle */}
          <div className="create-prop-group">
            <label className="create-prop-label">Cycle</label>
            <select className="create-prop-select" value={cycleId || ''} onChange={e => setCycleId(e.target.value || null)}>
              <option value="">No cycle</option>
              {teamCycles.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.isActive ? ' (Active)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div className="create-prop-group">
            <label className="create-prop-label">Due date</label>
            <input
              type="date"
              className="create-prop-select"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Labels */}
        <div className="create-labels-section">
          <label className="create-prop-label">Labels</label>
          <div className="create-labels-row">
            {(state.labels || []).map(l => (
              <button
                key={l.id}
                className={`create-label-chip ${labelIds.includes(l.id) ? 'selected' : ''}`}
                onClick={() => toggleLabel(l.id)}
              >
                <span className="create-label-dot" style={{ background: l.color }} />
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="create-modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <div className="create-footer-right">
            <span className="create-hint">&#x2318;&#x21B5; to create</span>
            <button className="btn-primary" onClick={handleCreate} disabled={!title.trim()}>
              Create issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
