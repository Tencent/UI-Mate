import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { File, ArrowRight, Download } from 'lucide-react';

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

export default function ArtifactDetail() {
  const { entity, project, artifactName, version } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const artifact = state.artifacts.find(a => a.name === artifactName);

  if (!artifact) return <div className="page-container"><p className="text-muted">Artifact not found.</p></div>;

  const ver = artifact.versions.find(v => v.version === version);
  if (!ver) return <div className="page-container"><p className="text-muted">Version not found.</p></div>;

  const usedByRuns = (ver.usedBy || []).map(id => state.runs.find(r => r.id === id)).filter(Boolean);

  // Derive lineage from runs: which artifacts are inputs (used by runs that produce this) vs outputs
  const producedByRuns = state.runs.filter(r => (r.outputArtifacts || []).includes(artifact.id));
  const usedAsInputRuns = state.runs.filter(r => (r.inputArtifacts || []).includes(artifact.id));
  const inputArtifacts = [...new Set(producedByRuns.flatMap(r => r.inputArtifacts || []))].map(id => state.artifacts.find(a => a.id === id)).filter(Boolean);
  const outputArtifacts = [...new Set(usedAsInputRuns.flatMap(r => r.outputArtifacts || []))].map(id => state.artifacts.find(a => a.id === id)).filter(Boolean);

  const handleDownload = (fileName) => {
    const content = `# ${fileName}\n# Artifact: ${artifact.name} @ ${version}\n# In a real W&B environment, this would download the actual artifact file.\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Main content */}
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-3 mb-2">
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{artifact.name}:{version}</h1>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {ver.alias.map(a => (
              <span key={a} className="tag-pill">{a}</span>
            ))}
          </div>
          <p className="text-muted mb-4">{artifact.description}</p>

          {/* Metadata */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Metadata</h3>
          <table className="data-table mb-4">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              {Object.entries(ver.metadata || {}).map(([k, v], i) => (
                <tr key={k} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-primary)' }}>
                  <td>{k}</td><td>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Files */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Files</h3>
          <table className="data-table mb-4">
            <thead><tr><th>Name</th><th>Size</th><th></th></tr></thead>
            <tbody>
              {(ver.files || []).map(f => (
                <tr key={f.name} style={{ cursor: 'pointer' }}
                  onClick={() => handleDownload(f.name)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="flex items-center gap-2"><File size={14} color="var(--text-muted)" /> <span style={{ color: 'var(--accent-link)' }}>{f.name}</span></td>
                  <td className="text-muted text-small">{formatSize(f.size)}</td>
                  <td onClick={e => { e.stopPropagation(); handleDownload(f.name); }}>
                    <button title="Download" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Used By */}
          {usedByRuns.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Used By</h3>
              <div className="flex flex-col gap-2">
                {usedByRuns.map(run => (
                  <div key={run.id}
                    className="card flex items-center gap-3"
                    style={{ padding: '8px 12px', cursor: 'pointer' }}
                    onClick={() => navigate(`/${entity}/${project}/runs/${run.id}/overview`)}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: run.color }} />
                    <span style={{ fontWeight: 500, color: 'var(--accent-link)' }}>{run.name}</span>
                    <span className={`state-badge ${run.state}`} style={{ marginLeft: 'auto' }}>{run.state}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ width: 250 }}>
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Lineage</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {inputArtifacts.length > 0 && (
                <>
                  {inputArtifacts.map(a => (
                    <div key={a.id} style={{ background: 'var(--bg-active)', borderRadius: 6, padding: '6px 12px', fontSize: 12, width: '100%', textAlign: 'center' }}>
                      Input: {a.name}
                    </div>
                  ))}
                  <ArrowRight size={14} color="var(--text-muted)" style={{ transform: 'rotate(90deg)' }} />
                </>
              )}
              {inputArtifacts.length === 0 && artifact.type === 'dataset' && (
                <>
                  <div style={{ background: 'var(--bg-active)', borderRadius: 6, padding: '6px 12px', fontSize: 12, width: '100%', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Source data
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" style={{ transform: 'rotate(90deg)' }} />
                </>
              )}
              <div style={{ background: 'var(--accent-blue)', color: '#1a1c1f', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontWeight: 600, width: '100%', textAlign: 'center' }}>
                {artifact.name}:{version}
              </div>
              {outputArtifacts.length > 0 && (
                <>
                  <ArrowRight size={14} color="var(--text-muted)" style={{ transform: 'rotate(90deg)' }} />
                  {outputArtifacts.map(a => (
                    <div key={a.id} style={{ background: 'var(--bg-active)', borderRadius: 6, padding: '6px 12px', fontSize: 12, width: '100%', textAlign: 'center' }}>
                      Output: {a.name}
                    </div>
                  ))}
                </>
              )}
              {outputArtifacts.length === 0 && usedByRuns.length > 0 && (
                <>
                  <ArrowRight size={14} color="var(--text-muted)" style={{ transform: 'rotate(90deg)' }} />
                  <div style={{ background: 'var(--bg-active)', borderRadius: 6, padding: '6px 12px', fontSize: 12, width: '100%', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Used by {usedByRuns.length} run{usedByRuns.length > 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
            <div className="text-muted text-small mt-4">
              <div>Size: {formatSize(ver.size)}</div>
              <div>Created: {timeAgo(ver.createdAt)}</div>
              <div>By: {ver.createdBy}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
