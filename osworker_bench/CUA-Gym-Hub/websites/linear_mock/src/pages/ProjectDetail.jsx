import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Avatar, formatDate, StatusIcon } from '../components/Icons.jsx';
import IssueList from '../components/IssueList.jsx';
import './Projects.css';

const STATUS_OPTIONS = ['backlog', 'planned', 'started', 'paused', 'completed', 'canceled'];
const HEALTH_OPTIONS = [null, 'onTrack', 'atRisk', 'offTrack'];
const HEALTH_CONFIG = {
  onTrack: { label: 'On track', color: '#27a644' },
  atRisk: { label: 'At risk', color: '#f2c94c' },
  offTrack: { label: 'Off track', color: '#e5484d' },
};

function ProgressBar({ progress }) {
  return (
    <div className="progress-track" style={{ height: 6 }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');

  const project = state.projects?.find(p => p.id === projectId);
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(project?.name || '');
  const [editDesc, setEditDesc] = useState(false);
  const [descVal, setDescVal] = useState(project?.description || '');

  useEffect(() => {
    if (project) {
      setNameVal(project.name || '');
      setDescVal(project.description || '');
    }
  }, [project?.id]);

  if (!project) return <div className="page-not-found">Project not found</div>;

  const lead = project.leadId ? state.users?.find(u => u.id === project.leadId) : null;
  const projectIssues = (state.issues || []).filter(i => i.projectId === projectId);
  const health = project.health ? HEALTH_CONFIG[project.health] : null;
  const isFavorite = (state.favorites || []).some(f => f.targetId === projectId && f.userId === state.currentUserId);

  // Compute actual progress from issues
  const allStates = state.teams?.flatMap(t => t.workflowStates) || [];
  const doneCount = projectIssues.filter(i => {
    const s = allStates.find(s => s.id === i.stateId);
    return s?.category === 'completed';
  }).length;
  const computedProgress = projectIssues.length > 0 ? Math.round((doneCount / projectIssues.length) * 100) : 0;

  function updateProject(updates) {
    dispatch({ type: 'UPDATE_PROJECT', projectId, updates });
  }

  return (
    <div className="project-detail-page">
      {/* Left: issue list */}
      <div className="project-detail-main">
        <div className="page-header">
          <span className="project-detail-icon">{project.icon}</span>
          <div style={{ flex: 1 }}>
            {editName ? (
              <input
                className="project-name-input"
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={() => { updateProject({ name: nameVal }); setEditName(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { updateProject({ name: nameVal }); setEditName(false); } }}
                autoFocus
              />
            ) : (
              <h2 className="page-title" onClick={() => setEditName(true)} style={{ cursor: 'text' }}>{project.name}</h2>
            )}
          </div>
          <button
            className={`header-icon-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', targetId: projectId, favType: 'project' })}
            style={{ color: isFavorite ? '#f2c94c' : undefined }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={14} />
          </button>
        </div>
        <div className="project-progress-header">
          <ProgressBar progress={computedProgress} />
          <span className="cycle-progress-text">{computedProgress}% complete - {doneCount}/{projectIssues.length} issues done</span>
        </div>
        <div className="project-issues">
          <IssueList issues={projectIssues} groupBy="status" showProject={false} emptyMessage="No issues in this project" />
        </div>
      </div>

      {/* Right: sidebar */}
      <div className="project-detail-sidebar">
        <div className="prop-row">
          <span className="prop-label">Status</span>
          <select
            className="create-prop-select"
            value={project.status}
            onChange={e => updateProject({ status: e.target.value })}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        <div className="prop-row">
          <span className="prop-label">Health</span>
          <select
            className="create-prop-select"
            value={project.health || ''}
            onChange={e => updateProject({ health: e.target.value || null })}
          >
            <option value="">No health</option>
            {HEALTH_OPTIONS.filter(Boolean).map(h => (
              <option key={h} value={h}>{HEALTH_CONFIG[h].label}</option>
            ))}
          </select>
        </div>

        <div className="prop-row">
          <span className="prop-label">Lead</span>
          <select
            className="create-prop-select"
            value={project.leadId || ''}
            onChange={e => updateProject({ leadId: e.target.value || null })}
          >
            <option value="">No lead</option>
            {(state.users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        <div className="prop-row">
          <span className="prop-label">Target date</span>
          <input
            type="date"
            className="prop-date-input"
            value={project.targetDate || ''}
            onChange={e => updateProject({ targetDate: e.target.value || null })}
          />
        </div>

        <div className="prop-row">
          <span className="prop-label">Start date</span>
          <input
            type="date"
            className="prop-date-input"
            value={project.startDate || ''}
            onChange={e => updateProject({ startDate: e.target.value || null })}
          />
        </div>

        <div className="prop-row">
          <span className="prop-label">Description</span>
          {editDesc ? (
            <textarea
              className="project-desc-textarea"
              value={descVal}
              onChange={e => setDescVal(e.target.value)}
              onBlur={() => { updateProject({ description: descVal }); setEditDesc(false); }}
              rows={4}
              autoFocus
            />
          ) : (
            <div className="project-desc-display" onClick={() => setEditDesc(true)}>
              {project.description || <span style={{ color: 'var(--text-tertiary)' }}>Add description...</span>}
            </div>
          )}
        </div>

        <div className="prop-row">
          <span className="prop-label">Teams</span>
          <div className="project-teams-row">
            {(project.teamIds || []).map(tid => {
              const t = state.teams?.find(t => t.id === tid);
              return t ? (
                <span key={tid} className="project-team-badge" style={{ background: t.color + '22', color: t.color }}>
                  {t.icon} {t.name}
                </span>
              ) : null;
            })}
          </div>
        </div>

        <div className="prop-row">
          <span className="prop-label">Members</span>
          <div className="subscribers-row">
            {(project.memberIds || []).map(uid => {
              const u = state.users?.find(u => u.id === uid);
              return u ? <Avatar key={uid} user={u} size={20} /> : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
