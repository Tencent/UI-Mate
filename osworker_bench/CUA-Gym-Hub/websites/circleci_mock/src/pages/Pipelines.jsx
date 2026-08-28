import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { StatusBadge, formatRelativeTime, formatDuration } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

export default function Pipelines() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const [filters, setFilters] = useState({
    ownership: state.pipelineFilters?.ownership || 'everyone',
    projectId: state.pipelineFilters?.projectId || 'all',
    branch: state.pipelineFilters?.branch || 'all'
  });

  const setFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    dispatch({ type: 'SET_PIPELINE_FILTER', payload: next });
  };

  const allBranches = [...new Set(
    state.pipelines
      .filter(p => filters.projectId === 'all' || p.projectId === filters.projectId)
      .map(p => p.vcs.branch)
  )].sort();

  const filteredPipelines = state.pipelines.filter(p => {
    if (filters.ownership === 'mine' && p.trigger.actor.login !== state.currentUser.username) return false;
    if (filters.projectId !== 'all' && p.projectId !== filters.projectId) return false;
    if (filters.branch !== 'all' && p.vcs.branch !== filters.branch) return false;
    return true;
  });

  // Get the "best" workflow status for a pipeline
  const getPipelineStatus = (pipelineId) => {
    const wfs = state.workflows.filter(w => w.pipelineId === pipelineId);
    if (!wfs.length) return 'queued';
    if (wfs.some(w => w.status === 'running')) return 'running';
    if (wfs.some(w => w.status === 'failed')) return 'failed';
    if (wfs.some(w => w.status === 'on_hold')) return 'on_hold';
    if (wfs.some(w => w.status === 'queued')) return 'queued';
    if (wfs.some(w => w.status === 'canceled')) return 'canceled';
    if (wfs.every(w => w.status === 'success')) return 'success';
    return wfs[0].status;
  };

  const handleRerun = (e, pipelineId) => {
    e.stopPropagation();
    dispatch({ type: 'RERUN_PIPELINE', payload: { pipelineId } });
  };

  const handleCancel = (e, workflowId) => {
    e.stopPropagation();
    dispatch({ type: 'CANCEL_WORKFLOW', payload: { workflowId } });
  };

  const getInitials = (login) => login ? login.slice(0, 2).toUpperCase() : '??';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          All Pipelines
        </h1>
      </div>

      <div className="filter-bar">
        <div className="filter-select">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          <select value={filters.ownership} onChange={e => setFilter('ownership', e.target.value)}>
            <option value="everyone">Everyone's Pipelines</option>
            <option value="mine">My Pipelines</option>
          </select>
        </div>

        <div className="filter-select">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          <select value={filters.projectId} onChange={e => setFilter('projectId', e.target.value)}>
            <option value="all">All Projects</option>
            {state.projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-select">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
          <select value={filters.branch} onChange={e => setFilter('branch', e.target.value)}>
            <option value="all">All Branches</option>
            {allBranches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pipeline-header-row">
        <span>Project</span>
        <span>Status</span>
        <span>Workflow</span>
        <span>Trigger Event</span>
        <span>Actions</span>
      </div>

      <div className="pipeline-list" style={{ flex: 1, overflowY: 'auto' }}>
        {filteredPipelines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No pipelines found</div>
            <div className="empty-state-desc">Try changing your filters</div>
          </div>
        ) : (
          filteredPipelines.map(pipeline => {
            const project = state.projects.find(p => p.id === pipeline.projectId);
            const workflows = state.workflows.filter(w => w.pipelineId === pipeline.id);
            const pipelineStatus = getPipelineStatus(pipeline.id);
            const isRunning = pipelineStatus === 'running';
            const runningWf = workflows.find(w => w.status === 'running');

            return (
              <div
                key={pipeline.id}
                className="pipeline-row"
                onClick={() => navigate(toPath(`/pipelines/${pipeline.id}`))}
              >
                {/* Project + number */}
                <div>
                  <div>
                    <span
                      className="pipeline-project-name"
                      onClick={e => { e.stopPropagation(); setFilter('projectId', pipeline.projectId); }}
                    >
                      {project ? project.name : 'Unknown'}
                    </span>
                    <span className="pipeline-number"> #{pipeline.number}</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={pipelineStatus} />
                </div>

                {/* Workflow name(s) */}
                <div>
                  {workflows.slice(0, 2).map(wf => (
                    <div key={wf.id}>
                      <span
                        className="workflow-name"
                        onClick={e => { e.stopPropagation(); navigate(toPath(`/pipelines/${pipeline.id}/workflows/${wf.id}`)); }}
                      >
                        {wf.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Trigger info */}
                <div className="trigger-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="branch-label">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
                      {pipeline.vcs.branch}
                    </span>
                    <span className="commit-msg">{pipeline.vcs.commitMessage.slice(0, 50)}{pipeline.vcs.commitMessage.length > 50 ? '...' : ''}</span>
                  </div>
                  <div className="trigger-user">
                    <div className="user-avatar-sm">{getInitials(pipeline.trigger.actor.login)}</div>
                    <span>{pipeline.trigger.actor.login}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(pipeline.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pipeline-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn-icon"
                    title="Rerun"
                    onClick={e => handleRerun(e, pipeline.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                  </button>
                  {isRunning && runningWf && (
                    <button
                      className="btn-icon"
                      title="Cancel"
                      style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={e => handleCancel(e, runningWf.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
