import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Avatar, formatDate } from '../components/Icons.jsx';
import './Projects.css';

const STATUS_LABELS = {
  backlog: 'Backlog', planned: 'Planned', started: 'Started',
  paused: 'Paused', completed: 'Completed', canceled: 'Canceled',
};

const STATUS_COLORS = {
  backlog: '#8a8f98', planned: '#8a8f98', started: '#5e6ad2',
  paused: '#f2c94c', completed: '#27a644', canceled: '#e5484d',
};

const HEALTH_CONFIG = {
  onTrack: { label: 'On track', color: '#27a644' },
  atRisk: { label: 'At risk', color: '#f2c94c' },
  offTrack: { label: 'Off track', color: '#e5484d' },
};

function ProgressBar({ progress }) {
  return (
    <div className="progress-track" style={{ height: 4 }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
    </div>
  );
}

export default function ProjectsList() {
  const { teamId } = useParams();
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const team = state.teams?.find(t => t.id === teamId);
  const projects = teamId
    ? (state.projects || []).filter(p => p.teamIds?.includes(teamId))
    : (state.projects || []);

  return (
    <div className="projects-page">
      <div className="page-header">
        {team && <span className="team-icon">{team.icon}</span>}
        <h2 className="page-title">{team ? `${team.name} Projects` : 'Projects'}</h2>
        <span className="issue-count">{projects.length}</span>
      </div>
      <div className="projects-grid">
        {projects.map(p => {
          const lead = p.leadId ? state.users?.find(u => u.id === p.leadId) : null;
          const health = p.health ? HEALTH_CONFIG[p.health] : null;
          return (
            <div key={p.id} className="project-card" onClick={() => navigate(toPath(`/project/${p.id}`))}>
              <div className="project-card-top" style={{ background: p.color + '22', borderBottom: `1px solid ${p.color}40` }}>
                <span className="project-card-icon">{p.icon}</span>
              </div>
              <div className="project-card-body">
                <div className="project-card-header">
                  <span className="project-card-name">{p.name}</span>
                  <span className="project-status-badge" style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status] }}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>
                {p.description && <p className="project-card-desc">{p.description}</p>}
                <div className="project-card-progress">
                  <ProgressBar progress={p.progress} />
                  <span className="project-progress-text">{p.progress}%</span>
                </div>
                <div className="project-card-footer">
                  {lead && (
                    <div className="project-card-lead">
                      <Avatar user={lead} size={16} />
                      <span>{lead.displayName}</span>
                    </div>
                  )}
                  {health && (
                    <span className="project-health" style={{ color: health.color }}>
                      {health.label}
                    </span>
                  )}
                  {p.targetDate && (
                    <span className="project-target-date">{formatDate(p.targetDate)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div className="projects-empty">
            <FolderOpen size={36} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
            <p>No projects</p>
          </div>
        )}
      </div>
    </div>
  );
}
