import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Avatar } from '../components/Icons.jsx';
import './Roadmap.css';

const STATUS_COLORS = {
  backlog: '#8a8f98', planned: '#8a8f98', started: '#5e6ad2',
  paused: '#f2c94c', completed: '#27a644', canceled: '#e5484d',
};

const HEALTH_CONFIG = {
  onTrack: { label: 'On track', color: '#27a644' },
  atRisk: { label: 'At risk', color: '#f2c94c' },
  offTrack: { label: 'Off track', color: '#e5484d' },
};

function getQuarterMonths(year, quarter) {
  const startMonth = (quarter - 1) * 3;
  return [0, 1, 2].map(i => new Date(year, startMonth + i, 1));
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getMonthShort(date) {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function Roadmap() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const [viewMode, setViewMode] = useState('quarter'); // 'quarter' | 'month'
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewQuarter, setViewQuarter] = useState(Math.ceil((now.getMonth() + 1) / 3));
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const projects = state.projects || [];

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (viewMode === 'quarter') {
      const months = getQuarterMonths(viewYear, viewQuarter);
      const start = months[0];
      const lastMonth = months[2];
      const end = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      return { start, end, months };
    } else {
      const start = new Date(viewYear, viewMonth, 1);
      const end = new Date(viewYear, viewMonth + 1, 0);
      const weeks = [];
      const d = new Date(start);
      while (d <= end) {
        weeks.push(new Date(d));
        d.setDate(d.getDate() + 7);
      }
      return { start, end, weeks };
    }
  }, [viewMode, viewYear, viewQuarter, viewMonth]);

  // Calculate total days in range
  const totalDays = Math.ceil((visibleRange.end - visibleRange.start) / (1000 * 60 * 60 * 24)) + 1;

  function getBarPosition(project) {
    const pStart = project.startDate ? new Date(project.startDate) : null;
    const pEnd = project.targetDate ? new Date(project.targetDate) : null;

    if (!pStart && !pEnd) return null;

    const effectiveStart = pStart || new Date(visibleRange.start);
    const effectiveEnd = pEnd || new Date(visibleRange.end);

    const rangeStart = visibleRange.start.getTime();
    const rangeEnd = visibleRange.end.getTime();
    const rangeMs = rangeEnd - rangeStart;

    const barStartMs = Math.max(effectiveStart.getTime(), rangeStart);
    const barEndMs = Math.min(effectiveEnd.getTime(), rangeEnd);

    if (barStartMs > rangeEnd || barEndMs < rangeStart) return null;

    const left = ((barStartMs - rangeStart) / rangeMs) * 100;
    const width = ((barEndMs - barStartMs) / rangeMs) * 100;

    return { left: Math.max(0, left), width: Math.max(2, Math.min(100 - left, width)) };
  }

  function navigatePrev() {
    if (viewMode === 'quarter') {
      if (viewQuarter === 1) { setViewYear(viewYear - 1); setViewQuarter(4); }
      else setViewQuarter(viewQuarter - 1);
    } else {
      if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
      else setViewMonth(viewMonth - 1);
    }
  }

  function navigateNext() {
    if (viewMode === 'quarter') {
      if (viewQuarter === 4) { setViewYear(viewYear + 1); setViewQuarter(1); }
      else setViewQuarter(viewQuarter + 1);
    } else {
      if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
      else setViewMonth(viewMonth + 1);
    }
  }

  function navigateToday() {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewQuarter(Math.ceil((today.getMonth() + 1) / 3));
    setViewMonth(today.getMonth());
  }

  // Today line position
  const todayPos = (() => {
    const todayTime = now.getTime();
    const startTime = visibleRange.start.getTime();
    const endTime = visibleRange.end.getTime();
    if (todayTime < startTime || todayTime > endTime) return null;
    return ((todayTime - startTime) / (endTime - startTime)) * 100;
  })();

  const headerLabel = viewMode === 'quarter'
    ? `Q${viewQuarter} ${viewYear}`
    : new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="roadmap-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Roadmap</h2>
          <span className="issue-count">{projects.length} projects</span>
        </div>
        <div className="page-header-right">
          <div className="roadmap-view-toggle">
            <button
              className={`roadmap-view-btn ${viewMode === 'quarter' ? 'active' : ''}`}
              onClick={() => setViewMode('quarter')}
            >
              Quarter
            </button>
            <button
              className={`roadmap-view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
          <div className="roadmap-nav-group">
            <button className="roadmap-nav-btn" onClick={navigatePrev}><ChevronLeft size={14} /></button>
            <button className="roadmap-today-btn" onClick={navigateToday}>Today</button>
            <button className="roadmap-nav-btn" onClick={navigateNext}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <div className="roadmap-content">
        {/* Timeline header */}
        <div className="roadmap-timeline-header">
          <div className="roadmap-sidebar-col">
            <span className="roadmap-col-label">Project</span>
          </div>
          <div className="roadmap-timeline-col">
            <div className="roadmap-period-label">{headerLabel}</div>
            <div className="roadmap-months-row">
              {viewMode === 'quarter' && visibleRange.months?.map((m, i) => (
                <div key={i} className="roadmap-month-cell">{getMonthShort(m)}</div>
              ))}
              {viewMode === 'month' && visibleRange.weeks?.map((w, i) => (
                <div key={i} className="roadmap-week-cell">
                  Week {Math.ceil(w.getDate() / 7)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project rows */}
        <div className="roadmap-rows">
          {projects.map(project => {
            const barPos = getBarPosition(project);
            const lead = project.leadId ? state.users?.find(u => u.id === project.leadId) : null;
            const health = project.health ? HEALTH_CONFIG[project.health] : null;
            const statusColor = STATUS_COLORS[project.status] || '#8a8f98';
            const projectIssues = (state.issues || []).filter(i => i.projectId === project.id);
            const allStates = state.teams?.flatMap(t => t.workflowStates) || [];
            const doneCount = projectIssues.filter(i => {
              const s = allStates.find(s => s.id === i.stateId);
              return s?.category === 'completed';
            }).length;

            return (
              <div key={project.id} className="roadmap-row" onClick={() => navigate(toPath(`/project/${project.id}`))}>
                <div className="roadmap-sidebar-col">
                  <div className="roadmap-project-info">
                    <span className="roadmap-project-icon">{project.icon}</span>
                    <div className="roadmap-project-meta">
                      <span className="roadmap-project-name">{project.name}</span>
                      <div className="roadmap-project-sub">
                        {lead && <Avatar user={lead} size={14} />}
                        <span className="roadmap-project-status" style={{ color: statusColor }}>
                          {project.status}
                        </span>
                        {health && (
                          <span className="roadmap-health-dot" style={{ background: health.color }} title={health.label} />
                        )}
                        <span className="roadmap-project-count">{doneCount}/{projectIssues.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="roadmap-timeline-col">
                  <div className="roadmap-bar-area">
                    {/* Grid lines */}
                    {viewMode === 'quarter' && [0, 1, 2].map(i => (
                      <div key={i} className="roadmap-grid-line" style={{ left: `${(i / 3) * 100}%` }} />
                    ))}
                    {/* Today line */}
                    {todayPos !== null && (
                      <div className="roadmap-today-line" style={{ left: `${todayPos}%` }} />
                    )}
                    {/* Project bar */}
                    {barPos && (
                      <div
                        className="roadmap-bar"
                        style={{
                          left: `${barPos.left}%`,
                          width: `${barPos.width}%`,
                          background: project.color || '#5e6ad2',
                        }}
                      >
                        <div
                          className="roadmap-bar-progress"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="roadmap-empty">
              <p>No projects to show on roadmap</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
