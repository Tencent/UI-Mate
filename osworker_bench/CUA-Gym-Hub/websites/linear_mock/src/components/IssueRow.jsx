import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckSquare, Square } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { PriorityIcon, StatusIcon, Avatar, LabelPill, LabelDot, formatDateShort, isOverdue, PRIORITY_LABELS } from './Icons.jsx';
import './IssueRow.css';

function PriorityDropdown({ issue, onClose }) {
  const { dispatch } = useApp();
  const priorities = [0, 1, 2, 3, 4];
  return (
    <div className="issue-dropdown" onClick={e => e.stopPropagation()}>
      {priorities.map(p => (
        <button key={p} className={`issue-dropdown-item ${issue.priority === p ? 'selected' : ''}`}
          onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { priority: p } }); onClose(); }}>
          <PriorityIcon priority={p} size={14} />
          <span>{PRIORITY_LABELS[p]}</span>
        </button>
      ))}
    </div>
  );
}

function StatusDropdown({ issue, team, onClose }) {
  const { dispatch } = useApp();
  const states = team?.workflowStates || [];
  return (
    <div className="issue-dropdown" onClick={e => e.stopPropagation()}>
      {states.map(s => (
        <button key={s.id} className={`issue-dropdown-item ${issue.stateId === s.id ? 'selected' : ''}`}
          onClick={() => {
            const updates = { stateId: s.id };
            if (s.category === 'completed' || s.category === 'canceled') {
              updates.completedAt = new Date().toISOString();
            }
            dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates });
            onClose();
          }}>
          <StatusIcon state={s} size={14} />
          <span>{s.name}</span>
        </button>
      ))}
    </div>
  );
}

function AssigneeDropdown({ issue, team, users, onClose }) {
  const { dispatch } = useApp();
  const teamMembers = users.filter(u => team?.memberIds?.includes(u.id));
  return (
    <div className="issue-dropdown" onClick={e => e.stopPropagation()}>
      <button className={`issue-dropdown-item ${!issue.assigneeId ? 'selected' : ''}`}
        onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { assigneeId: null } }); onClose(); }}>
        <Avatar user={null} size={16} />
        <span>Unassigned</span>
      </button>
      {teamMembers.map(u => (
        <button key={u.id} className={`issue-dropdown-item ${issue.assigneeId === u.id ? 'selected' : ''}`}
          onClick={() => { dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { assigneeId: u.id } }); onClose(); }}>
          <Avatar user={u} size={16} />
          <span>{u.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function IssueRow({ issue, showProject = false, selected = false, focused = false, onSelect, onPeek }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');

  const [dropdown, setDropdown] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(issue.title);
  const titleInputRef = useRef(null);

  useEffect(() => {
    setTitleVal(issue.title);
  }, [issue.title]);

  const team = state.teams?.find(t => t.id === issue.teamId);
  const workflowState = team?.workflowStates?.find(s => s.id === issue.stateId);
  const assignee = issue.assigneeId ? state.users?.find(u => u.id === issue.assigneeId) : null;
  const labels = issue.labelIds?.map(id => state.labels?.find(l => l.id === id)).filter(Boolean) || [];
  const project = issue.projectId ? state.projects?.find(p => p.id === issue.projectId) : null;

  const issuePath = sid ? `/issue/${issue.id}?sid=${sid}` : `/issue/${issue.id}`;

  function handleClick(e) {
    if (e.target.closest('.issue-row-control')) return;
    if (editingTitle) return;
    navigate(issuePath);
  }

  function toggleDropdown(name, e) {
    e.stopPropagation();
    setDropdown(dropdown === name ? null : name);
  }

  function handleTitleDoubleClick(e) {
    e.stopPropagation();
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  }

  function saveTitle() {
    if (titleVal.trim() && titleVal !== issue.title) {
      dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { title: titleVal.trim() } });
    } else {
      setTitleVal(issue.title);
    }
    setEditingTitle(false);
  }

  const overdue = isOverdue(issue.dueDate);

  return (
    <div
      className={`issue-row ${selected ? 'selected' : ''} ${focused ? 'focused' : ''}`}
      onClick={handleClick}
      data-issue-id={issue.id}
    >
      <div className="issue-row-left">
        {onSelect && (
          <button
            className="issue-row-control issue-row-selector"
            onClick={e => { e.stopPropagation(); onSelect(issue.id); }}
            title={selected ? 'Deselect issue' : 'Select issue'}
          >
            {selected ? <CheckSquare size={14} /> : <Square size={14} />}
          </button>
        )}

        {/* Priority */}
        <button
          className="issue-row-control issue-row-priority"
          onClick={e => toggleDropdown('priority', e)}
          title={PRIORITY_LABELS[issue.priority]}
        >
          <PriorityIcon priority={issue.priority} size={14} />
          {dropdown === 'priority' && (
            <div className="issue-dropdown-anchor">
              <PriorityDropdown issue={issue} onClose={() => setDropdown(null)} />
            </div>
          )}
        </button>

        {/* Identifier */}
        <span className="issue-row-id">{issue.identifier}</span>

        {/* Status */}
        <button
          className="issue-row-control issue-row-status"
          onClick={e => toggleDropdown('status', e)}
          title={workflowState?.name}
        >
          <StatusIcon state={workflowState} size={14} />
          {dropdown === 'status' && (
            <div className="issue-dropdown-anchor">
              <StatusDropdown issue={issue} team={team} onClose={() => setDropdown(null)} />
            </div>
          )}
        </button>
      </div>

      {/* Title */}
      {editingTitle ? (
        <input
          ref={titleInputRef}
          className="issue-row-title-input"
          value={titleVal}
          onChange={e => setTitleVal(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={e => {
            if (e.key === 'Enter') saveTitle();
            if (e.key === 'Escape') { setTitleVal(issue.title); setEditingTitle(false); }
          }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="issue-row-title" onDoubleClick={handleTitleDoubleClick}>{issue.title}</span>
      )}

      <div className="issue-row-right">
        {/* Labels */}
        {labels.length > 0 && (
          <div className="issue-row-labels">
            {labels.slice(0, 2).map(l => <LabelPill key={l.id} label={l} small />)}
            {labels.length > 2 && <span className="issue-row-more-labels">+{labels.length - 2}</span>}
          </div>
        )}

        {/* Project */}
        {showProject && project && (
          <span className="issue-row-project">{project.name}</span>
        )}

        {/* Due date */}
        {issue.dueDate && (
          <span className={`issue-row-due ${overdue ? 'overdue' : ''}`}>
            {formatDateShort(issue.dueDate)}
          </span>
        )}

        {/* Estimate */}
        {issue.estimate != null && (
          <span className="issue-row-estimate">{issue.estimate}</span>
        )}

        {/* Assignee */}
        <button
          className="issue-row-control issue-row-assignee"
          onClick={e => toggleDropdown('assignee', e)}
          title={assignee?.name || 'Unassigned'}
        >
          <Avatar user={assignee} size={18} />
          {dropdown === 'assignee' && (
            <div className="issue-dropdown-anchor issue-dropdown-right">
              <AssigneeDropdown issue={issue} team={team} users={state.users || []} onClose={() => setDropdown(null)} />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
