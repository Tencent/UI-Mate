import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronRight, Box, Database, Cpu } from 'lucide-react';

function formatSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function TypeIcon({ type }) {
  switch (type) {
    case 'dataset': return <Database size={14} color="var(--accent-blue)" />;
    case 'model': return <Cpu size={14} color="var(--success-green)" />;
    default: return <Box size={14} color="var(--text-muted)" />;
  }
}

function TypeBadge({ type }) {
  const colors = { dataset: 'var(--accent-blue)', model: 'var(--success-green)', code: 'var(--warning-amber)' };
  const bgs = { dataset: 'rgba(131,179,247,0.15)', model: 'rgba(91,185,140,0.15)', code: 'rgba(229,164,68,0.15)' };
  return (
    <span style={{ background: bgs[type] || 'var(--bg-active)', color: colors[type] || 'var(--text-secondary)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
      {type}
    </span>
  );
}

export default function Artifacts() {
  const { entity, project } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const proj = state.projects.find(p => p.name === project && p.entity === entity);
  const projectArtifacts = state.artifacts.filter(a => a.projectId === (proj?.id || ''));
  const [selectedArtifact, setSelectedArtifact] = useState(projectArtifacts[0]?.id || null);
  const [expandedTypes, setExpandedTypes] = useState(new Set(['dataset', 'model', 'code', 'result']));

  // Group artifacts by type
  const byType = {};
  projectArtifacts.forEach(a => {
    if (!byType[a.type]) byType[a.type] = [];
    byType[a.type].push(a);
  });

  const toggleType = (type) => {
    const next = new Set(expandedTypes);
    if (next.has(type)) next.delete(type); else next.add(type);
    setExpandedTypes(next);
  };

  const selected = projectArtifacts.find(a => a.id === selectedArtifact);

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <div style={{ display: 'flex', height: 'calc(100vh - var(--topbar-height))' }}>
        {/* Left panel - artifact types */}
        <div style={{ width: 240, borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '12px 0' }}>
          <div style={{ padding: '0 12px 8px', fontSize: 14, fontWeight: 600 }}>Artifacts</div>
          {Object.entries(byType).map(([type, arts]) => (
            <div key={type}>
              <button
                onClick={() => toggleType(type)}
                className="flex items-center gap-2"
                style={{ width: '100%', padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'left' }}
              >
                {expandedTypes.has(type) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <TypeIcon type={type} />
                {type} ({arts.length})
              </button>
              {expandedTypes.has(type) && arts.map(art => (
                <button
                  key={art.id}
                  onClick={() => setSelectedArtifact(art.id)}
                  style={{
                    width: '100%', padding: '5px 12px 5px 32px', fontSize: 13, textAlign: 'left',
                    color: selectedArtifact === art.id ? 'var(--accent-blue)' : 'var(--text-primary)',
                    background: selectedArtifact === art.id ? 'var(--bg-hover)' : 'transparent'
                  }}
                >
                  {art.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {selected ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selected.name}</h2>
                <TypeBadge type={selected.type} />
              </div>
              <p className="text-muted mb-4">{selected.description}</p>

              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Versions</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Aliases</th>
                    <th>Size</th>
                    <th>Created By</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.versions.map(v => (
                    <tr
                      key={v.version}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/${entity}/${project}/artifacts/${selected.name}/${v.version}`)}
                    >
                      <td style={{ fontWeight: 500 }}>{v.version}</td>
                      <td>
                        {v.alias.map(a => <span key={a} className="tag-pill" style={{ marginRight: 4 }}>{a}</span>)}
                      </td>
                      <td className="text-muted text-small">{formatSize(v.size)}</td>
                      <td className="text-muted text-small">{v.createdBy}</td>
                      <td className="text-muted text-small">{timeAgo(v.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-muted">Select an artifact to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
