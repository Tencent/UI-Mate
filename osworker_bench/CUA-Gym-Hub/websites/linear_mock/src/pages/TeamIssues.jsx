import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Filter, SlidersHorizontal, List, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import IssueList from '../components/IssueList.jsx';
import BoardView from '../components/BoardView.jsx';
import FilterBar from '../components/FilterBar.jsx';
import DisplayOptions from '../components/DisplayOptions.jsx';
import './TeamIssues.css';

export default function TeamIssues() {
  const { teamId } = useParams();
  const { state } = useApp();
  const location = useLocation();
  const isBoardRoute = location.pathname.endsWith('/board');
  const [layout, setLayout] = useState(isBoardRoute ? 'board' : 'list');
  const [showFilter, setShowFilter] = useState(false);
  const [showDisplay, setShowDisplay] = useState(false);
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('priority');

  useEffect(() => {
    setLayout(isBoardRoute ? 'board' : 'list');
  }, [isBoardRoute]);

  const team = state.teams?.find(t => t.id === teamId);
  if (!team) return <div className="page-not-found">Team not found</div>;

  let issues = (state.issues || []).filter(i => i.teamId === teamId);

  // Apply filters
  if (filters.priority?.length) issues = issues.filter(i => filters.priority.includes(i.priority));
  if (filters.stateIds?.length) issues = issues.filter(i => filters.stateIds.includes(i.stateId));
  if (filters.assigneeIds?.length) issues = issues.filter(i => filters.assigneeIds.includes(i.assigneeId));
  if (filters.labelIds?.length) issues = issues.filter(i => filters.labelIds?.some(l => i.labelIds?.includes(l)));
  if (filters.projectIds?.length) issues = issues.filter(i => filters.projectIds.includes(i.projectId));

  return (
    <div className="team-issues-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="team-icon">{team.icon}</span>
          <h2 className="page-title">{team.name}</h2>
          <span className="issue-count">{issues.length}</span>
        </div>
        <div className="page-header-right">
          <button className={`header-icon-btn ${showFilter ? 'active' : ''}`} onClick={() => setShowFilter(!showFilter)} title="Filters">
            <Filter size={15} />
          </button>
          <button className={`header-icon-btn ${showDisplay ? 'active' : ''}`} onClick={() => setShowDisplay(!showDisplay)} title="Display options">
            <SlidersHorizontal size={15} />
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
        {showDisplay && (
          <DisplayOptions
            groupBy={groupBy}
            sortBy={sortBy}
            onGroupByChange={setGroupBy}
            onSortByChange={setSortBy}
            onClose={() => setShowDisplay(false)}
          />
        )}
      </div>

      {showFilter && (
        <FilterBar team={team} filters={filters} onChange={setFilters} />
      )}

      <div className="team-issues-content">
        {layout === 'board' ? (
          <BoardView issues={issues} team={team} />
        ) : (
          <IssueList issues={issues} groupBy={groupBy} showProject={true} emptyMessage="No issues found" />
        )}
      </div>
    </div>
  );
}
