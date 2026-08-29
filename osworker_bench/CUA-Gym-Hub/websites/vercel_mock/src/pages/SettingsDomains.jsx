import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/helpers';
import { Shield, CheckCircle, AlertTriangle, Trash2, Pencil } from 'lucide-react';

export default function SettingsDomains() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const [newDomain, setNewDomain] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const domains = state.domains.filter(d => d.projectId === projectId);

  const addDomain = () => {
    if (!newDomain.trim()) return;
    dispatch({ type: 'ADD_DOMAIN', payload: {
      id: generateId('dom'), projectId, name: newDomain.trim(),
      apexDomain: newDomain.trim().split('.').slice(-2).join('.'),
      verified: false, sslStatus: 'pending',
      dnsRecords: [
        { type: 'A', name: '@', value: '76.76.21.21' },
        { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' },
      ],
      redirectTo: null, createdAt: new Date().toISOString(),
    }});
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'domain.created', description: `Added domain ${newDomain.trim()}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId,
      projectName: state.projects.find(p => p.id === projectId)?.name,
      metadata: { domain: newDomain.trim() },
    }});
    setNewDomain('');
  };

  const removeDomain = (domainId) => {
    const domain = state.domains.find(d => d.id === domainId);
    dispatch({ type: 'DELETE_DOMAIN', payload: domainId });
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'domain.removed', description: `Removed domain ${domain?.name}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId,
      projectName: state.projects.find(p => p.id === projectId)?.name,
      metadata: { domain: domain?.name },
    }});
    setDeleteTarget(null);
  };

  const startEdit = (dom) => { setEditingId(dom.id); setEditValue(dom.name); };
  const cancelEdit = () => { setEditingId(null); setEditValue(''); };
  const saveEdit = (domId) => {
    if (!editValue.trim()) return;
    dispatch({ type: 'UPDATE_DOMAIN', payload: { id: domId, name: editValue.trim(), apexDomain: editValue.trim().split('.').slice(-2).join('.') } });
    setEditingId(null); setEditValue('');
  };

  const verifyDomain = (domId) => {
    dispatch({ type: 'UPDATE_DOMAIN', payload: { id: domId, verified: true, sslStatus: 'active' } });
  };

  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-title">Domains</div>
        <div className="settings-section-desc">
          These domains are assigned to your Production Deployments. Optionally, a different Git branch can be assigned for each domain.
        </div>
        <div className="settings-row">
          <input
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            placeholder="myapp.com"
            onKeyDown={e => e.key === 'Enter' && addDomain()}
          />
          <button className="btn btn-primary btn-sm" onClick={addDomain}>Add</button>
        </div>
      </div>

      <div className="settings-section">
        {domains.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--fg-muted)' }}>
            No custom domains configured. Add a domain above to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {domains.map(dom => (
              <div key={dom.id} className="domain-card">
                <div className="domain-card-row">
                  {editingId === dom.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 14, flex: 1 }}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(dom.id); if (e.key === 'Escape') cancelEdit(); }}
                        autoFocus
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(dom.id)}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500 }}>{dom.name}</span>
                        {dom.verified ? (
                          <span className="badge badge-ready" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={11} /> Valid Configuration
                          </span>
                        ) : (
                          <span className="badge badge-building" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={11} /> Pending Verification
                          </span>
                        )}
                        {dom.sslStatus === 'active' ? (
                          <span className="badge badge-ready" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Shield size={11} /> SSL
                          </span>
                        ) : (
                          <span className="badge badge-building">SSL Pending</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!dom.verified && (
                          <button className="btn btn-secondary btn-sm" onClick={() => verifyDomain(dom.id)}>
                            Verify
                          </button>
                        )}
                        <button className="btn-icon" onClick={() => startEdit(dom)} title="Edit" aria-label={`Edit ${dom.name}`}><Pencil size={14} /></button>
                        <button className="btn-icon" style={{ color: 'var(--error)' }} onClick={() => setDeleteTarget(dom.id)} title="Remove" aria-label={`Remove ${dom.name}`}><Trash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
                {!dom.verified && (
                  <div className="domain-dns">
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>
                      Add the following DNS records to verify ownership:
                    </div>
                    <table className="table" style={{ fontSize: 12 }}>
                      <thead><tr><th>Type</th><th>Name</th><th>Value</th></tr></thead>
                      <tbody>
                        {dom.dnsRecords.map((rec, i) => (
                          <tr key={i}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{rec.type}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{rec.name}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', userSelect: 'all' }}>{rec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Remove Domain</h3>
            <p className="modal-desc">Are you sure you want to remove this domain? This will remove the domain from all deployments.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => removeDomain(deleteTarget)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
