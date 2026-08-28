import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Star, Filter, List, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { PRIORITY_LABELS } from '../components/Icons.jsx';
import IssueList from '../components/IssueList.jsx';
import BoardView from '../components/BoardView.jsx';
import './TeamIssues.css';

export default function ViewDetail() {
  const { viewId } = useParams();
  const { state, dispatch } = useApp();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');

  const view = state.views?.find(v => v.id === viewId);
  const [layout, setLayout] = useState(view?.layout || 'list');

  if (!view) return <div className="page-not-found">View not found</div>;

  let issues = state.issues || [];
  const f = view.filters || {};

  if (f.priority?.length) issues = issues.filter(i => f.priority.includes(i.priority));
  if (f.labelIds?.length) issues = issues.filter(i => f.labelIds.some(l => i.labelIds?.includes(l)));
  if (f.assigneeId) issues = issues.filter(i => i.assigneeId === f.assigneeId);
  if (f.stateCategory) {
    const allStates = state.teams?.flatMap(t => t.workflowStates) || [];
    issues = issues.filter(i => {
      const s = allStates.find(s => s.id === i.stateId);
      return s?.category === f.stateCategory;
    });
  }
  if (f.stateIds?.length) issues = issues.filter(i => f.stateIds.includes(i.stateId));

  const isFavorite = (state.favorites || []).some(fav => fav.targetId === viewId && fav.userId === state.currentUserId);

  // Build filter summary
  const filterParts = [];
  if (f.priority?.length) filterParts.push(`Priority: ${f.priority.map(p => PRIORITY_LABELS[p]).join(', ')}`);
  if (f.labelIds?.length) {
    const names = f.labelIds.map(id => state.labels?.find(l => l.id === id)?.name).filter(Boolean);
    if (names.length) filterParts.push(`Labels: ${names.join(', ')}`);
  }
  if (f.assigneeId) {
    const user = state.users?.find(u => u.id === f.assigneeId);
    filterParts.push(`Assignee: ${user?.name || f.assigneeId}`);
  }
  if (f.stateCategory) filterParts.push(`State: ${f.stateCategory}`);

  // For board view, we need a team - pick first team that has matching issues
  const boardTeam = issues.length > 0 ? state.teams?.find(t => t.id === issues[0].teamId) : state.teams?.[0];

  return (
    <div className="team-issues-page">
      <div className="page-header">
        <div className="page-header-left">
          <span style={{ fontSize: 16 }}>{view.icon || '👁'}</span>
          <h2 className="page-title">{view.name}</h2>
          <span className="issue-count">{issues.length}</span>
        </div>
        <div className="page-header-right">
          <button
            className={`header-icon-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', targetId: viewId, favType: 'view' })}
            style={{ color: isFavorite ? '#f2c94c' : undefined }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={14} />
          </button>
          <div className="layout-toggle">
            <button className={`layout-btn ${layout === 'list' ? 'active' : ''}`} onClick={() => setLayout('list')} title="List view">
              <List size={15} />
            </button>
            <button className={`layout-btn ${layout === 'board' ? 'active' : ''}`} onClick={() => setLayout('board')} title="Board view">
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {filterParts.length > 0 && (
        <div className="view-filter-summary">
          <Filter size={12} style={{ color: 'var(--text-tertiary)' }} />
          <span>{filterParts.join(' | ')}</span>
        </div>
      )}

      <div className="team-issues-content">
        {layout === 'board' && boardTeam ? (
          <BoardView issues={issues} team={boardTeam} />
        ) : (
          <IssueList issues={issues} groupBy={view.groupBy || 'status'} showProject={true} emptyMessage="No issues match this view" />
        )}
      </div>
    </div>
  );
}
