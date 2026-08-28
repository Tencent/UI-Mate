import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw, Plus, X, Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { formatDate, StatusIcon } from '../components/Icons.jsx';
import IssueList from '../components/IssueList.jsx';
import './Cycles.css';

function ProgressBar({ progress }) {
  return (
    <div className="progress-track" style={{ height: 6 }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
    </div>
  );
}

function ScopeChart({ cycleIssues, team }) {
  const allStates = team?.workflowStates || [];

  const categoryColors = {
    backlog: '#8a8f98',
    unstarted: '#e2e2e3',
    started: '#f2c94c',
    completed: '#27a644',
    canceled: '#62666d',
  };

  const breakdown = useMemo(() => {
    const counts = { backlog: 0, unstarted: 0, started: 0, completed: 0, canceled: 0, triage: 0 };
    cycleIssues.forEach(issue => {
      const ws = allStates.find(s => s.id === issue.stateId);
      if (ws) {
        counts[ws.category] = (counts[ws.category] || 0) + 1;
      }
    });
    return counts;
  }, [cycleIssues, allStates]);

  const total = cycleIssues.length;
  if (total === 0) return null;

  const segments = ['completed', 'started', 'unstarted', 'backlog', 'canceled']
    .map(cat => ({ category: cat, count: breakdown[cat] || 0, color: categoryColors[cat] || '#62666d' }))
    .filter(s => s.count > 0);

  return (
    <div className="scope-chart">
      <div className="scope-chart-title">Scope breakdown</div>
      <div className="scope-chart-bar">
        {segments.map(seg => (
          <div
            key={seg.category}
            className="scope-chart-segment"
            style={{ width: `${(seg.count / total) * 100}%`, background: seg.color }}
            title={`${seg.category}: ${seg.count}`}
          />
        ))}
      </div>
      <div className="scope-chart-legend">
        {segments.map(seg => (
          <div key={seg.category} className="scope-chart-legend-item">
            <span className="scope-chart-dot" style={{ background: seg.color }} />
            <span className="scope-chart-cat">{seg.category}</span>
            <span className="scope-chart-num">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CycleDetail() {
  const { teamId, cycleId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const [showAddIssues, setShowAddIssues] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const team = state.teams?.find(t => t.id === teamId);
  const cycle = state.cycles?.find(c => c.id === cycleId);
  const cycleIssues = (state.issues || []).filter(i => i.cycleId === cycleId);
  const allStates = team?.workflowStates || [];
  const completed = cycleIssues.filter(i => allStates.find(s => s.id === i.stateId)?.category === 'completed').length;
  const total = cycleIssues.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Issues that could be added (backlog, no cycle)
  const addableIssues = (state.issues || [])
    .filter(i => i.teamId === teamId && !i.cycleId && i.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    if (!cycle?.endsAt) return null;
    const end = new Date(cycle.endsAt);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  }, [cycle]);

  const isFavorite = (state.favorites || []).some(f => f.targetId === cycleId && f.userId === state.currentUserId);

  if (!cycle) return <div className="page-not-found">Cycle not found</div>;

  return (
    <div className="cycle-detail-page">
      <div className="page-header">
        <RefreshCw size={16} style={{ color: cycle.isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="page-title">{cycle.name}</h2>
            {cycle.isActive && <span className="cycle-active-badge">Active</span>}
            {cycle.isCompleted && <span className="cycle-completed-badge">Completed</span>}
          </div>
          <div className="cycle-dates">
            {formatDate(cycle.startsAt)} → {formatDate(cycle.endsAt)}
            {daysRemaining !== null && cycle.isActive && (
              <span className="cycle-days-remaining">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : daysRemaining === 0 ? 'Ends today' : 'Overdue'}
              </span>
            )}
          </div>
        </div>
        <button
          className={`header-icon-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', targetId: cycleId, favType: 'cycle' })}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{ color: isFavorite ? '#f2c94c' : undefined }}
        >
          <Star size={14} />
        </button>
        {cycle.isActive && (
          <button className="btn-primary btn-sm" onClick={() => setShowAddIssues(!showAddIssues)}>
            <Plus size={13} /> Add issues
          </button>
        )}
      </div>

      <div className="cycle-progress-bar-row">
        <ProgressBar progress={progress} />
        <span className="cycle-progress-text">{progress}% complete - {completed}/{total} issues done</span>
      </div>

      <ScopeChart cycleIssues={cycleIssues} team={team} />

      {showAddIssues && (
        <div className="add-issues-panel">
          <div className="add-issues-header">
            <span>Add issues to {cycle.name}</span>
            <button onClick={() => setShowAddIssues(false)}><X size={14} /></button>
          </div>
          <input
            className="add-issues-search"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
          <div className="add-issues-list">
            {addableIssues.map(issue => (
              <div key={issue.id} className="add-issue-row" onClick={() => {
                dispatch({ type: 'UPDATE_ISSUE', issueId: issue.id, updates: { cycleId } });
              }}>
                <span className="add-issue-id">{issue.identifier}</span>
                <span className="add-issue-title">{issue.title}</span>
                <Plus size={12} />
              </div>
            ))}
            {addableIssues.length === 0 && (
              <div className="add-issues-empty">No available issues</div>
            )}
          </div>
        </div>
      )}

      <div className="cycle-issues">
        <IssueList issues={cycleIssues} groupBy="status" showProject={true} emptyMessage="No issues in this cycle" />
      </div>
    </div>
  );
}
