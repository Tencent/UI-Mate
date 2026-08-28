import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { StatusBadge, formatRelativeTime } from '../components/StatusBadge.jsx';
import { VcsIcon } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

export default function Projects() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const [search, setSearch] = useState('');

  const filtered = state.projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFollow = (project) => {
    dispatch({
      type: project.isFollowed ? 'UNFOLLOW_PROJECT' : 'FOLLOW_PROJECT',
      payload: { projectId: project.id }
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          Projects
        </h1>
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '7px 12px 7px 32px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, width: 240, outline: 'none' }}
          />
        </div>
      </div>

      <div className="projects-list">
        {filtered.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-vcs-icon">
              <VcsIcon provider={project.vcsProvider} />
            </div>

            <div className="project-info">
              <div
                className="project-name"
                onClick={() => navigate(toPath(`/projects/${project.slug}/settings`))}
              >
                {project.name}
              </div>
              <div className="project-url">{project.vcsUrl}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
                  {project.defaultBranch}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Last build: {formatRelativeTime(project.lastBuildAt)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusBadge status={project.lastBuildStatus} />
              <button
                className="btn"
                style={project.isFollowed ? { background: 'var(--content-secondary-bg)' } : { color: 'var(--green)', borderColor: 'var(--green)' }}
                onClick={() => toggleFollow(project)}
              >
                {project.isFollowed ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Following
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Follow
                  </>
                )}
              </button>
              <button
                className="btn-icon"
                title="Project Settings"
                onClick={() => navigate(toPath(`/projects/${project.slug}/settings`))}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
