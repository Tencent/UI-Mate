import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, X } from 'lucide-react';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function MethodBadge({ method }) {
  const colors = { bayes: '#83b3f7', grid: '#5bb98c', random: '#e5a444' };
  const bg = { bayes: 'rgba(131,179,247,0.15)', grid: 'rgba(91,185,140,0.15)', random: 'rgba(229,164,68,0.15)' };
  return (
    <span style={{ background: bg[method] || bg.random, color: colors[method] || colors.random, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
      {method}
    </span>
  );
}

function CreateSweepModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState('bayes');
  const [metricName, setMetricName] = useState('');
  const [goal, setGoal] = useState('maximize');
  const [params, setParams] = useState([]);

  const addParam = () => setParams([...params, { name: '', type: 'continuous', min: '', max: '', values: '' }]);
  const updateParam = (i, field, val) => setParams(params.map((p, j) => j === i ? { ...p, [field]: val } : p));
  const removeParam = (i) => setParams(params.filter((_, j) => j !== i));

  const handleSubmit = () => {
    if (!name.trim() || !metricName.trim()) return;
    const parameters = {};
    params.forEach(p => {
      if (!p.name.trim()) return;
      if (p.type === 'continuous') {
        parameters[p.name] = { min: parseFloat(p.min) || 0, max: parseFloat(p.max) || 1, distribution: 'uniform' };
      } else {
        parameters[p.name] = { values: p.values.split(',').map(v => v.trim()).filter(Boolean) };
      }
    });
    onSubmit({ name: name.trim(), method, metric: { name: metricName.trim(), goal }, parameters });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
        <div className="modal-header">
          <span className="modal-title">Create Sweep</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="My Sweep" />
        </div>
        <div className="form-group">
          <label className="form-label">Method</label>
          <select className="form-input" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="bayes">Bayesian</option>
            <option value="grid">Grid</option>
            <option value="random">Random</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Metric</label>
            <input className="form-input" value={metricName} onChange={e => setMetricName(e.target.value)} placeholder="val_acc" />
          </div>
          <div className="form-group" style={{ width: 140 }}>
            <label className="form-label">Goal</label>
            <select className="form-input" value={goal} onChange={e => setGoal(e.target.value)}>
              <option value="maximize">Maximize</option>
              <option value="minimize">Minimize</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Parameters</label>
          {params.map((p, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input className="form-input" style={{ width: 100, padding: '4px 8px', fontSize: 12 }} value={p.name} onChange={e => updateParam(i, 'name', e.target.value)} placeholder="param" />
              <select className="form-input" style={{ width: 110, padding: '4px 8px', fontSize: 12 }} value={p.type} onChange={e => updateParam(i, 'type', e.target.value)}>
                <option value="continuous">Continuous</option>
                <option value="categorical">Categorical</option>
              </select>
              {p.type === 'continuous' ? (
                <>
                  <input className="form-input" style={{ width: 70, padding: '4px 8px', fontSize: 12 }} value={p.min} onChange={e => updateParam(i, 'min', e.target.value)} placeholder="min" />
                  <input className="form-input" style={{ width: 70, padding: '4px 8px', fontSize: 12 }} value={p.max} onChange={e => updateParam(i, 'max', e.target.value)} placeholder="max" />
                </>
              ) : (
                <input className="form-input" style={{ flex: 1, padding: '4px 8px', fontSize: 12 }} value={p.values} onChange={e => updateParam(i, 'values', e.target.value)} placeholder="val1, val2" />
              )}
              <button onClick={() => removeParam(i)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
          ))}
          <button className="btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={addParam}>
            <Plus size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Add parameter
          </button>
        </div>
        <div className="flex gap-2" style={{ marginTop: 16 }}>
          <button className="btn-blue" onClick={handleSubmit}>Launch Sweep</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Sweeps() {
  const { entity, project } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const proj = state.projects.find(p => p.name === project && p.entity === entity);
  const projectSweeps = state.sweeps.filter(s => s.projectId === (proj?.id || ''));
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = (data) => {
    const sweep = {
      id: `sweep-${Date.now()}`,
      sweepId: Math.random().toString(36).slice(2, 10),
      projectId: proj.id,
      name: data.name,
      state: 'running',
      createdAt: new Date().toISOString(),
      method: data.method,
      metric: data.metric,
      parameters: data.parameters,
      runCount: 0,
      bestRun: null,
      sweepRuns: []
    };
    dispatch({ type: 'ADD_SWEEP', payload: sweep });
    setShowCreate(false);
    navigate(`/${entity}/${project}/sweeps/${sweep.id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sweeps</h1>
        <button className="btn-blue" onClick={() => setShowCreate(true)}>
          <Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Create Sweep
        </button>
      </div>
      {projectSweeps.length === 0 ? (
        <p className="text-muted">No sweeps in this project.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Sweep ID</th>
              <th>Name</th>
              <th>Method</th>
              <th>State</th>
              <th>Metric</th>
              <th>Runs</th>
              <th>Best Value</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {projectSweeps.map(sweep => (
              <tr key={sweep.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/${entity}/${project}/sweeps/${sweep.id}`)}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-link)' }}>{sweep.sweepId}</td>
                <td style={{ fontWeight: 500 }}>{sweep.name}</td>
                <td><MethodBadge method={sweep.method} /></td>
                <td><span className={`state-badge ${sweep.state}`}>{sweep.state}</span></td>
                <td className="text-muted text-small">{sweep.metric.name} ({sweep.metric.goal})</td>
                <td className="text-muted">{sweep.runCount}</td>
                <td style={{ fontWeight: 500 }}>{sweep.bestRun?.[sweep.metric.name] != null ? sweep.bestRun[sweep.metric.name].toFixed(4) : '-'}</td>
                <td className="text-muted text-small">{timeAgo(sweep.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && <CreateSweepModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
    </div>
  );
}
