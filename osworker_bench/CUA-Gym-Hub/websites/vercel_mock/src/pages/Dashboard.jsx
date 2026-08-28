import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, GitBranch, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { relativeTime, statusDotClass, frameworkLabel } from '../utils/helpers';

const FRAMEWORK_ICONS = {
  nextjs: { symbol: '\u25B2', bg: '#000', color: '#fff' },
  vite: { symbol: '\u26A1', bg: '#646cff', color: '#fff' },
  astro: { symbol: '\u2605', bg: '#FF5D01', color: '#fff' },
  nuxt: { symbol: 'N', bg: '#00DC82', color: '#fff' },
  sveltekit: { symbol: 'S', bg: '#FF3E00', color: '#fff' },
  gatsby: { symbol: 'G', bg: '#663399', color: '#fff' },
  remix: { symbol: 'R', bg: '#121212', color: '#fff' },
};

function FrameworkIcon({ framework }) {
  const f = FRAMEWORK_ICONS[framework] || { symbol: '\u25CB', bg: '#666', color: '#fff' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: 6, background: f.bg,
      color: f.color, fontSize: 13, fontWeight: 700, flexShrink: 0,
      boxShadow: 'var(--shadow-border)',
    }}>
      {f.symbol}
    </span>
  );
}

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { state } = useApp();
  const [previewUrl, setPreviewUrl] = useState(null);
  const deployment = state.deployments.find(d => d.id === project.latestDeployment);

  return (
    <div
      className="card card-hover"
      onClick={() => navigate(`/project/${project.id}/overview`)}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 150 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FrameworkIcon framework={project.framework} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {project.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <GitBranch size={11} />
            {project.gitRepo.owner}/{project.gitRepo.name}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13 }}>
        <button
          type="button"
          style={{ color: 'var(--fg-secondary)', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit' }}
          onClick={e => {
            e.stopPropagation();
            setPreviewUrl(project.productionUrl);
          }}
        >
          {project.productionUrl}
          <ExternalLink size={11} />
        </button>
      </div>

      {project.customDomains.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {project.customDomains.map(d => (
            <span key={d} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-secondary)', color: 'var(--fg-secondary)', border: '1px solid var(--border)' }}>
              {d}
            </span>
          ))}
        </div>
      )}

      {deployment && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <span className={`status-dot ${statusDotClass(deployment.status)}`} />
          <span style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>
            {deployment.status.charAt(0) + deployment.status.slice(1).toLowerCase()}
          </span>
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', marginLeft: 'auto' }}>
            {relativeTime(deployment.createdAt)}
          </span>
        </div>
      )}
      {previewUrl && (
        <div className="modal-overlay" onClick={e => { e.stopPropagation(); setPreviewUrl(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Deployment Preview</h3>
            <p className="modal-desc">Local sandbox preview for <strong>{previewUrl}</strong>.</p>
            <div className="code-block" style={{ marginBottom: 16 }}>{previewUrl}</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setPreviewUrl(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setPreviewUrl(null); navigate(`/project/${project.id}/overview`); }}>
                Open Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  const filtered = state.projects.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="dropdown-wrap">
            <button
              className="btn btn-primary"
              onClick={() => setShowNewDropdown(s => !s)}
            >
              <Plus size={16} /> Add New...
            </button>
            {showNewDropdown && (
              <div className="dropdown-menu" style={{ right: 0, left: 'auto' }}>
                <button className="dropdown-item" onClick={() => { setShowNewDropdown(false); navigate('/new'); }}>
                  Project
                </button>
                <button className="dropdown-item" onClick={() => { setShowNewDropdown(false); navigate('/domains'); }}>
                  Domain
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="search-bar" style={{ marginBottom: 24 }}>
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search Projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: 40 }}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No projects found</div>
            <div style={{ fontSize: 14 }}>Try a different search term or create a new project.</div>
          </div>
        ) : (
          <div className="project-grid">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
