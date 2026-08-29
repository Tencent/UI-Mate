import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function DomainsPage() {
  const { state, dispatch } = useApp();
  const domains = state.domains;
  const projects = state.projects;
  const [showModal, setShowModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');

  const addDomain = () => {
    if (!newDomain.trim()) return;
    dispatch({ type: 'ADD_DOMAIN', payload: {
      id: `dom_${Date.now()}`,
      projectId: selectedProject || null,
      name: newDomain.trim(),
      apexDomain: newDomain.trim().split('.').slice(-2).join('.'),
      verified: false,
      sslStatus: 'pending',
      dnsRecords: [
        { type: 'A', name: '@', value: '76.76.21.21' },
        { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' },
      ],
      redirectTo: null,
      createdAt: new Date().toISOString(),
    }});
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'domain.created',
      description: `Added domain ${newDomain.trim()}`,
      userId: state.currentUser?.id,
      userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar,
      projectId: selectedProject || null,
      projectName: projects.find(p => p.id === selectedProject)?.name || null,
      metadata: { domain: newDomain.trim() },
    }});
    setNewDomain('');
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Domains</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Domain</button>
      </div>
      <div className="page-body">
        <table className="table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Project</th>
              <th>Status</th>
              <th>SSL</th>
            </tr>
          </thead>
          <tbody>
            {domains.map(dom => {
              const project = projects.find(p => p.id === dom.projectId);
              return (
                <tr key={dom.id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{dom.name}</td>
                  <td>{project ? project.name : '—'}</td>
                  <td>
                    <span className={`badge ${dom.verified ? 'badge-ready' : 'badge-building'}`}>
                      {dom.verified ? 'Valid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${dom.sslStatus === 'active' ? 'badge-ready' : 'badge-building'}`}>
                      {dom.sslStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Add Domain</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--fg-secondary)', display: 'block', marginBottom: 6 }}>Domain name</label>
                <input
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  style={{ width: '100%' }}
                  onKeyDown={e => e.key === 'Enter' && addDomain()}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--fg-secondary)', display: 'block', marginBottom: 6 }}>Project</label>
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ width: '100%' }}>
                  <option value="">— None —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addDomain}>Add Domain</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
