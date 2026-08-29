import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

export default function AdminCustomDefinitions() {
  const { state, updateState } = useAppContext();
  const [activeTab, setActiveTab] = useState('dimensions');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', scope: 'event', description: '', parameterName: '' });

  const data = activeTab === 'dimensions' ? state.customDimensions : state.customMetrics;

  const handleCreate = () => {
    if (!formData.name || !formData.parameterName) return;

    if (activeTab === 'dimensions') {
      const newDim = {
        id: `cd_${Date.now()}`,
        name: formData.name,
        scope: formData.scope,
        description: formData.description,
        parameterName: formData.parameterName
      };
      updateState(prev => ({ ...prev, customDimensions: [...prev.customDimensions, newDim] }));
    } else {
      const newMetric = {
        id: `cm_${Date.now()}`,
        name: formData.name,
        scope: formData.scope,
        description: formData.description,
        parameterName: formData.parameterName,
        unit: 'STANDARD'
      };
      updateState(prev => ({ ...prev, customMetrics: [...prev.customMetrics, newMetric] }));
    }

    setFormData({ name: '', scope: 'event', description: '', parameterName: '' });
    setShowModal(false);
  };

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Custom definitions</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('dimensions')}
          style={{
            padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: 14,
            borderBottom: activeTab === 'dimensions' ? '2px solid var(--ga-blue)' : '2px solid transparent',
            color: activeTab === 'dimensions' ? 'var(--ga-blue)' : 'var(--ga-text-secondary)',
            background: 'none', fontWeight: activeTab === 'dimensions' ? 500 : 400
          }}
        >
          Custom dimensions
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: 14,
            borderBottom: activeTab === 'metrics' ? '2px solid var(--ga-blue)' : '2px solid transparent',
            color: activeTab === 'metrics' ? 'var(--ga-blue)' : 'var(--ga-text-secondary)',
            background: 'none', fontWeight: activeTab === 'metrics' ? 500 : 400
          }}
        >
          Custom metrics
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create custom {activeTab === 'dimensions' ? 'dimension' : 'metric'}
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Scope</th>
              <th>Description</th>
              <th>Parameter name</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ga-text-secondary)', padding: 24 }}>No custom {activeTab} defined.</td></tr>
            ) : (
              data.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{item.scope}</td>
                  <td>{item.description}</td>
                  <td><code style={{ fontSize: 12, background: '#f1f3f4', padding: '2px 6px', borderRadius: 3 }}>{item.parameterName}</code></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <span>Create custom {activeTab === 'dimensions' ? 'dimension' : 'metric'}</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#5f6368' }}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g., user_membership_level" />
              </div>
              <div className="form-group">
                <label className="form-label">Scope</label>
                <select className="form-select" value={formData.scope} onChange={e => setFormData(f => ({ ...f, scope: e.target.value }))}>
                  <option value="event">Event</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="What does this dimension track?" />
              </div>
              <div className="form-group">
                <label className="form-label">Event parameter / User property</label>
                <input className="form-input" value={formData.parameterName} onChange={e => setFormData(f => ({ ...f, parameterName: e.target.value }))} placeholder="e.g., membership_level" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
