import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { PriorityIcon, StatusIcon, Avatar, LabelPill } from './Icons.jsx';
import { PRIORITY_LABELS } from './Icons.jsx';
import './BoardView.css';

function BoardCard({ issue, states }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');

  const assignee = issue.assigneeId ? state.users?.find(u => u.id === issue.assigneeId) : null;
  const labels = issue.labelIds?.map(id => state.labels?.find(l => l.id === id)).filter(Boolean) || [];
  const workflowState = states?.find(s => s.id === issue.stateId);

  function handleDragStart(e) {
    e.dataTransfer.setData('issueId', issue.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      className="board-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => navigate(sid ? `/issue/${issue.id}?sid=${sid}` : `/issue/${issue.id}`)}
    >
      <div className="board-card-id">{issue.identifier}</div>
      <div className="board-card-title">{issue.title}</div>
      <div className="board-card-footer">
        <div className="board-card-footer-left">
          <PriorityIcon priority={issue.priority} size={13} />
          {labels.slice(0, 2).map(l => <LabelPill key={l.id} label={l} small />)}
        </div>
        <Avatar user={assignee} size={18} />
      </div>
      {issue.estimate != null && (
        <span className="board-card-estimate">{issue.estimate}</span>
      )}
    </div>
  );
}

export default function BoardView({ issues, team }) {
  const { dispatch } = useApp();
  const states = team?.workflowStates || [];

  // Show only non-triage states
  const visibleStates = states.filter(s => s.category !== 'triage');

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, stateId) {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('issueId');
    if (issueId) {
      dispatch({ type: 'UPDATE_ISSUE', issueId, updates: { stateId } });
    }
  }

  return (
    <div className="board-view">
      {visibleStates.map(s => {
        const colIssues = issues.filter(i => i.stateId === s.id);
        return (
          <div
            key={s.id}
            className="board-column"
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, s.id)}
          >
            <div className="board-column-header">
              <StatusIcon state={s} size={14} />
              <span className="board-column-name">{s.name}</span>
              <span className="board-column-count">{colIssues.length}</span>
            </div>
            <div className="board-column-body">
              {colIssues.map(issue => (
                <BoardCard key={issue.id} issue={issue} states={states} />
              ))}
              {colIssues.length === 0 && (
                <div className="board-column-empty">
                  <span>No issues</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
