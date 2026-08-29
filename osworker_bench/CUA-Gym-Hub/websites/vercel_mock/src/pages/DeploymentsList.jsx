import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { relativeTime, statusBadgeClass, shortSha, truncate } from '../utils/helpers';
import { GitBranch, GitCommit, ExternalLink } from 'lucide-react';

export default function DeploymentsList() {
  const { projectId } = useParams();
  const { state } = useApp();
  const navigate = useNavigate();
  const [envFilter, setEnvFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  let deployments = state.deployments.filter(d => d.projectId === projectId);
  if (envFilter !== 'all') deployments = deployments.filter(d => d.environment === envFilter);
  if (statusFilter !== 'all') deployments = deployments.filter(d => d.status.toLowerCase() === statusFilter);
  if (search) deployments = deployments.filter(d =>
    d.git?.commitMessage?.toLowerCase().includes(search.toLowerCase()) ||
    d.git?.branch?.toLowerCase().includes(search.toLowerCase())
  );
  deployments = [...deployments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Deployments</h1>
      </div>
      <div className="page-body">
        <div className="filter-bar">
          <select value={envFilter} onChange={e => setEnvFilter(e.target.value)}>
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="preview">Preview</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="building">Building</option>
            <option value="error">Error</option>
            <option value="canceled">Canceled</option>
          </select>
          <input
            type="text"
            placeholder="Search by commit message or branch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
        </div>

        <div style={{ boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {deployments.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>
              No deployments found
            </div>
          ) : (
            deployments.map(dep => (
              <div
                key={dep.id}
                className="deployment-row"
                onClick={() => navigate(`/project/${projectId}/deployments/${dep.id}`)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className={`badge ${statusBadgeClass(dep.status)}`}>
                      {dep.status.charAt(0) + dep.status.slice(1).toLowerCase()}
                    </span>
                    <span className={`badge badge-${dep.environment}`}>
                      {dep.environment.charAt(0).toUpperCase() + dep.environment.slice(1)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)' }}>
                      {truncate(dep.url, 50)}
                    </span>
                    <ExternalLink size={12} style={{ color: 'var(--fg-muted)' }} />
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--fg-secondary)', marginBottom: 4 }}>
                    {truncate(dep.git?.commitMessage, 80)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--fg-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitCommit size={12} />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{shortSha(dep.git?.commitSha)}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitBranch size={12} /> {dep.git?.branch}
                    </span>
                    <span>by {dep.git?.author}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {dep.buildDuration && (
                    <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                      {dep.buildDuration}s
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)', minWidth: 60, textAlign: 'right' }}>
                    {relativeTime(dep.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
