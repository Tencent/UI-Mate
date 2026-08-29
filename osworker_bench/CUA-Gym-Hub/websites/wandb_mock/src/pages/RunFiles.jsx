import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { File, ArrowUp, ArrowDown, Download } from 'lucide-react';

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
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RunFiles() {
  const { runId } = useParams();
  const { state } = useApp();
  const run = state.runs.find(r => r.id === runId);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  if (!run) return null;

  const files = [...(run.files || [])].sort((a, b) => {
    let va = a[sortBy], vb = b[sortBy];
    if (typeof va === 'number' && typeof vb === 'number') {
      return sortOrder === 'asc' ? va - vb : vb - va;
    }
    return sortOrder === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const handleDownload = (fileName) => {
    // Mock download: create a small placeholder file
    const content = `# ${fileName}\n# This is a mock file from run: ${run.name}\n# In a real W&B environment, this would download the actual file.\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return null;
    return sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              <span className="flex items-center gap-2">Name <SortIcon col="name" /></span>
            </th>
            <th onClick={() => handleSort('size')}>
              <span className="flex items-center gap-2">Size <SortIcon col="size" /></span>
            </th>
            <th>Last Modified</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.name} style={{ cursor: 'pointer' }} onClick={() => handleDownload(f.name)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <td>
                <span className="flex items-center gap-2">
                  <File size={14} color="var(--text-muted)" />
                  <span style={{ color: 'var(--accent-link)' }}>{f.name}</span>
                </span>
              </td>
              <td className="text-muted text-small">{formatSize(f.size)}</td>
              <td className="text-muted text-small">{f.updatedAt ? timeAgo(f.updatedAt) : '-'}</td>
              <td onClick={e => { e.stopPropagation(); handleDownload(f.name); }}>
                <button title="Download" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
                  <Download size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {files.length === 0 && <p className="text-muted text-small" style={{ padding: '16px 0', textAlign: 'center' }}>No files for this run.</p>}
    </div>
  );
}
