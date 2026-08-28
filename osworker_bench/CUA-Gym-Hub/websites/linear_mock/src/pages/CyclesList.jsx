import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { formatDate } from '../components/Icons.jsx';
import './Cycles.css';

function ProgressBar({ progress, height = 4 }) {
  return (
    <div className="progress-track" style={{ height }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
    </div>
  );
}

function CycleCard({ cycle, team, issues, onClick }) {
  const cycleIssues = issues.filter(i => i.cycleId === cycle.id);
  const allStates = team?.workflowStates || [];
  const completed = cycleIssues.filter(i => {
    const s = allStates.find(s => s.id === i.stateId);
    return s?.category === 'completed';
  }).length;
  const inProgress = cycleIssues.filter(i => {
    const s = allStates.find(s => s.id === i.stateId);
    return s?.category === 'started';
  }).length;
  const total = cycleIssues.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`cycle-card ${cycle.isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="cycle-card-header">
        <RefreshCw size={14} style={{ color: cycle.isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
        <span className="cycle-card-name">{cycle.name}</span>
        {cycle.isActive && <span className="cycle-active-badge">Active</span>}
        {cycle.isCompleted && <span className="cycle-completed-badge">Completed</span>}
      </div>
      <div className="cycle-card-dates">
        {formatDate(cycle.startsAt)} → {formatDate(cycle.endsAt)}
      </div>
      <ProgressBar progress={progress} height={4} />
      <div className="cycle-card-stats">
        <span>{completed} completed</span>
        <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>·</span>
        <span>{inProgress} in progress</span>
        <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>·</span>
        <span>{total - completed - inProgress} unstarted</span>
        <span className="cycle-card-total">{total} total</span>
      </div>
    </div>
  );
}

export default function CyclesList() {
  const { teamId } = useParams();
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const team = state.teams?.find(t => t.id === teamId);
  const cycles = (state.cycles || []).filter(c => c.teamId === teamId);
  const issues = state.issues || [];

  const active = cycles.filter(c => c.isActive);
  const upcoming = cycles.filter(c => !c.isActive && !c.isCompleted);
  const completed = cycles.filter(c => c.isCompleted);

  return (
    <div className="cycles-page">
      <div className="page-header">
        <span className="team-icon">{team?.icon}</span>
        <h2 className="page-title">Cycles</h2>
      </div>
      <div className="cycles-content">
        {active.length > 0 && (
          <section className="cycles-section">
            <h3 className="cycles-section-title">Active</h3>
            {active.map(c => (
              <CycleCard key={c.id} cycle={c} team={team} issues={issues} onClick={() => navigate(toPath(`/team/${teamId}/cycles/${c.id}`))} />
            ))}
          </section>
        )}
        {upcoming.length > 0 && (
          <section className="cycles-section">
            <h3 className="cycles-section-title">Upcoming</h3>
            {upcoming.map(c => (
              <CycleCard key={c.id} cycle={c} team={team} issues={issues} onClick={() => navigate(toPath(`/team/${teamId}/cycles/${c.id}`))} />
            ))}
          </section>
        )}
        {completed.length > 0 && (
          <section className="cycles-section">
            <h3 className="cycles-section-title">Completed</h3>
            {completed.map(c => (
              <CycleCard key={c.id} cycle={c} team={team} issues={issues} onClick={() => navigate(toPath(`/team/${teamId}/cycles/${c.id}`))} />
            ))}
          </section>
        )}
        {cycles.length === 0 && (
          <div className="cycles-empty">
            <RefreshCw size={36} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
            <p>No cycles yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
