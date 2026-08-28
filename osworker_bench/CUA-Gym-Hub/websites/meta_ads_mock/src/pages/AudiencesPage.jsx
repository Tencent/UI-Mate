import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import './AudiencesPage.css';

function formatSize(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

function AvailabilityBadge({ availability }) {
  const map = {
    ready: { label: 'Ready', bg: '#E6F4EA', color: '#31A24C' },
    populating: { label: 'Populating', bg: '#FFF9E6', color: '#F7B928' },
    too_small: { label: 'Too small', bg: '#FFF0F0', color: '#FA383E' },
    error: { label: 'Error', bg: '#FFF0F0', color: '#FA383E' },
  };
  const s = map[availability] || map['ready'];
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}

function TypeBadge({ type }) {
  const map = {
    custom: { label: 'Custom', bg: '#EBF5FF', color: '#0866FF' },
    lookalike: { label: 'Lookalike', bg: '#E6F4EA', color: '#31A24C' },
    saved: { label: 'Saved', bg: '#F0F2F5', color: '#65676B' },
  };
  const s = map[type] || map['saved'];
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}

export default function AudiencesPage() {
  const { state, createAudience, deleteAudience } = useApp();
  const { showToast } = useToast();
  const [selected, setSelected] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('custom');

  // Create audience form
  const [audName, setAudName] = useState('');
  const [audSource, setAudSource] = useState('website');
  const [retentionDays, setRetentionDays] = useState(30);
  const [urlRule, setUrlRule] = useState('');
  // Lookalike
  const [llSource, setLlSource] = useState('');
  const [llCountry, setLlCountry] = useState('US');
  const [llRatio, setLlRatio] = useState(1);

  function handleCreate() {
    const id = `aud_${Date.now()}`;
    createAudience({
      id,
      name: audName || `New Audience ${Date.now()}`,
      type: createType,
      source: createType === 'custom' ? audSource : null,
      size: 0,
      sizeRange: '0',
      availability: 'populating',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: '',
      lookalikeSpec: createType === 'lookalike' ? { sourceAudienceId: llSource, country: llCountry, ratio: llRatio / 100 } : null
    });
    setShowCreateModal(false);
    setAudName('');
    showToast('Audience created successfully.');
  }

  function handleDelete() {
    selected.forEach(id => deleteAudience(id));
    setSelected([]);
    showToast(`${selected.length} audience(s) deleted.`);
  }

  return (
    <div className="audiences-page">
      <div className="page-card">
        <div className="page-card-header">
          <h2 className="page-title">Audiences</h2>
          <div className="page-actions">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={14} />
              Create Audience
            </button>
            {selected.length > 0 && (
              <button className="btn-outline btn-danger" onClick={handleDelete}>
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        </div>
        <table className="data-table-basic">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={e => setSelected(e.target.checked ? state.audiences.map(a => a.id) : [])} /></th>
              <th>Name</th>
              <th>Type</th>
              <th>Source</th>
              <th>Size</th>
              <th>Availability</th>
              <th>Date created</th>
            </tr>
          </thead>
          <tbody>
            {state.audiences.map(aud => (
              <tr key={aud.id} className={selected.includes(aud.id) ? 'row-selected' : ''}>
                <td><input type="checkbox" checked={selected.includes(aud.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, aud.id] : prev.filter(i => i !== aud.id))} /></td>
                <td style={{ fontWeight: 500 }}>{aud.name}</td>
                <td><TypeBadge type={aud.type} /></td>
                <td style={{ textTransform: 'capitalize' }}>{aud.source?.replace(/_/g, ' ') || '—'}</td>
                <td>{formatSize(aud.size)}</td>
                <td><AvailabilityBadge availability={aud.availability} /></td>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(aud.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="modal-container" style={{ width: 480 }}>
            <div className="modal-header">
              <div className="modal-tabs">
                <button className="modal-tab modal-tab--active">Create Audience</button>
              </div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: 20 }}>
              <div className="field-group">
                <label className="field-label">Audience type</label>
                <div className="radio-group radio-group--row">
                  {['custom', 'lookalike', 'saved'].map(t => (
                    <label key={t}><input type="radio" value={t} checked={createType === t} onChange={() => setCreateType(t)} /> <span style={{ textTransform: 'capitalize' }}>{t}</span></label>
                  ))}
                </div>
              </div>
              {createType === 'custom' && (
                <>
                  <div className="field-group">
                    <label className="field-label">Source</label>
                    <select className="field-select" value={audSource} onChange={e => setAudSource(e.target.value)}>
                      <option value="website">Website</option>
                      <option value="customer_list">Customer list</option>
                      <option value="app_activity">App activity</option>
                      <option value="engagement">Engagement</option>
                    </select>
                  </div>
                  {audSource === 'website' && (
                    <>
                      <div className="field-group">
                        <label className="field-label">Retention days</label>
                        <input className="field-input" type="number" min="1" max="180" value={retentionDays} onChange={e => setRetentionDays(e.target.value)} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">URL contains</label>
                        <input className="field-input" value={urlRule} onChange={e => setUrlRule(e.target.value)} placeholder="example.com/shop" />
                      </div>
                    </>
                  )}
                </>
              )}
              {createType === 'lookalike' && (
                <>
                  <div className="field-group">
                    <label className="field-label">Source audience</label>
                    <select className="field-select" value={llSource} onChange={e => setLlSource(e.target.value)}>
                      <option value="">Select an audience...</option>
                      {state.audiences.filter(a => a.type === 'custom').map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Country</label>
                    <input className="field-input" value={llCountry} onChange={e => setLlCountry(e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Audience size: {llRatio}%</label>
                    <input type="range" min="1" max="10" value={llRatio} onChange={e => setLlRatio(parseInt(e.target.value))} style={{ width: '100%' }} />
                  </div>
                </>
              )}
              <div className="field-group">
                <label className="field-label">Audience name</label>
                <input className="field-input" value={audName} onChange={e => setAudName(e.target.value)} placeholder="My custom audience" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <div style={{ flex: 1 }} />
              <button className="btn-primary" onClick={handleCreate}>Create Audience</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
