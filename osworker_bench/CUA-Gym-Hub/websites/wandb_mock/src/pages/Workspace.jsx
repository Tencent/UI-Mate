import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, ChevronDown, ChevronRight, GripVertical, Search, Filter, Columns, Share2, MoreHorizontal, Plus, X, Check, XCircle, Clock, Square, ArrowUp, ArrowDown, Layers, Copy } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';

function middleEllipsis(str, maxLen) {
  if (str.length <= maxLen) return str;
  const keep = Math.floor((maxLen - 1) / 2);
  return str.slice(0, keep) + '…' + str.slice(str.length - keep);
}

function RunNameWithTooltip({ name, onClick }) {
  const wrapperRef = useRef(null);
  const [tip, setTip] = useState(null);
  const [displayName, setDisplayName] = useState(name);

  // Compute middle-ellipsis based on actual container width
  const computeDisplay = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const availWidth = el.offsetWidth;
    // Approximate: 7px per char at 13px font size
    const maxChars = Math.max(10, Math.floor(availWidth / 7));
    setDisplayName(middleEllipsis(name, maxChars));
  }, [name]);

  useEffect(() => {
    computeDisplay();
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(computeDisplay);
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeDisplay]);

  const handleEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTip({ left: rect.left, top: rect.top - 32 });
  };

  return (
    <div className="run-name-wrapper" ref={wrapperRef} onMouseEnter={handleEnter} onMouseLeave={() => setTip(null)}>
      <span className="run-name" onClick={onClick}>{displayName}</span>
      {tip && <div className="run-name-tooltip" style={{ display: 'block', left: tip.left, top: tip.top }}>{name}</div>}
    </div>
  );
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

function StateIcon({ state }) {
  switch (state) {
    case 'finished': return <Check size={12} color="var(--success-green)" />;
    case 'crashed': return <XCircle size={12} color="var(--error-red)" />;
    case 'running': return <Clock size={12} color="var(--warning-amber)" />;
    case 'killed': return <Square size={10} color="var(--text-muted)" />;
    default: return null;
  }
}

function ChartPanel({ panel, runs, allRuns }) {
  const visibleRuns = runs.filter(r => r.visible);

  const chartData = useMemo(() => {
    if (visibleRuns.length === 0) return [];
    const allSteps = new Set();
    visibleRuns.forEach(r => {
      (r.history || []).forEach(h => allSteps.add(h.step));
    });
    const sortedSteps = [...allSteps].sort((a, b) => a - b);
    return sortedSteps.map(step => {
      const point = { step };
      visibleRuns.forEach(r => {
        const h = (r.history || []).find(h => h.step === step);
        if (h && h[panel.metric] !== undefined) {
          point[r.id] = h[panel.metric];
        }
      });
      return point;
    });
  }, [visibleRuns, panel.metric]);

  return (
    <div className="panel-card">
      <div className="panel-header">
        <span className="panel-title">{panel.title || panel.metric}</span>
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="step" stroke="var(--text-muted)" tick={{ fontSize: 11 }} label={{ value: 'Step', position: 'insideBottom', offset: -2, style: { fill: 'var(--text-muted)', fontSize: 11 } }} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={50} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)' }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
              labelFormatter={v => `Step: ${v}`}
              formatter={(value, name) => {
                const run = allRuns.find(r => r.id === name);
                return [typeof value === 'number' ? value.toFixed(4) : value, run ? run.name : name];
              }}
            />
            {/* Legend hidden — run sidebar serves as legend */}
            {visibleRuns.map(r => (
              <Line
                key={r.id}
                type="monotone"
                dataKey={r.id}
                stroke={r.color}
                dot={false}
                strokeWidth={1.5}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BarChartPanel({ panel, runs, allRuns }) {
  const visibleRuns = runs.filter(r => r.visible);

  const chartData = useMemo(() => {
    return visibleRuns.map(r => ({
      name: r.name.length > 14 ? r.name.slice(0, 14) + '...' : r.name,
      value: r.summary?.[panel.metric] ?? null,
      color: r.color,
    })).filter(d => d.value !== null);
  }, [visibleRuns, panel.metric]);

  if (chartData.length === 0) {
    return (
      <div className="panel-card">
        <div className="panel-header"><span className="panel-title">{panel.title || panel.metric}</span></div>
        <div className="text-muted text-small" style={{ padding: '40px 16px', textAlign: 'center' }}>No data</div>
      </div>
    );
  }

  return (
    <div className="panel-card">
      <div className="panel-header"><span className="panel-title">{panel.title || panel.metric}</span></div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={50} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)' }}
              formatter={v => [typeof v === 'number' ? v.toFixed(4) : v, panel.metric]}
            />
            <Bar dataKey="value" fill="var(--accent-blue)" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <rect key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ScatterPanel({ panel, runs, allRuns }) {
  const visibleRuns = runs.filter(r => r.visible);

  const scatterData = useMemo(() => {
    const points = [];
    visibleRuns.forEach(r => {
      (r.history || []).forEach(h => {
        const x = h[panel.xMetric];
        const y = h[panel.yMetric];
        if (x !== undefined && y !== undefined) {
          points.push({ x, y, runId: r.id, color: r.color, name: r.name });
        }
      });
    });
    return points;
  }, [visibleRuns, panel.xMetric, panel.yMetric]);

  if (scatterData.length === 0) {
    return (
      <div className="panel-card">
        <div className="panel-header"><span className="panel-title">{panel.title}</span></div>
        <div className="text-muted text-small" style={{ padding: '40px 16px', textAlign: 'center' }}>No data</div>
      </div>
    );
  }

  // Group by run for coloring
  const byRun = visibleRuns.map(r => ({
    run: r,
    data: scatterData.filter(p => p.runId === r.id).map(p => ({ x: p.x, y: p.y }))
  })).filter(g => g.data.length > 0);

  return (
    <div className="panel-card">
      <div className="panel-header"><span className="panel-title">{panel.title}</span></div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="x" type="number" name={panel.xMetric} stroke="var(--text-muted)" tick={{ fontSize: 11 }} label={{ value: panel.xMetric, position: 'insideBottom', offset: -2, style: { fill: 'var(--text-muted)', fontSize: 10 } }} />
            <YAxis dataKey="y" type="number" name={panel.yMetric} stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={50} />
            <ZAxis range={[20, 20]} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)' }}
              formatter={(v, name) => [typeof v === 'number' ? v.toFixed(4) : v, name]}
            />
            {/* Legend hidden — run sidebar serves as legend */}
            {byRun.map(({ run, data }) => (
              <Scatter key={run.id} name={run.id} data={data} fill={run.color} opacity={0.7} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RunTablePanel({ runs, allRuns }) {
  const visibleRuns = runs.filter(r => r.visible);
  const navigate = useNavigate();
  const { entity, project } = useParams();

  return (
    <div className="panel-card">
      <div className="panel-header"><span className="panel-title">Run Table</span></div>
      <div style={{ overflowX: 'auto', maxHeight: 240, overflowY: 'auto' }}>
        <table className="data-table" style={{ fontSize: 11 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>State</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {visibleRuns.map(r => (
              <tr
                key={r.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/${entity}/${project}/runs/${r.id}/overview`)}
              >
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    {r.name}
                  </span>
                </td>
                <td><span className={`state-badge ${r.state}`}>{r.state}</span></td>
                <td className="text-muted">
                  {r.duration ? `${Math.floor(r.duration / 60)}m` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddPanelModal({ onClose, onAdd, runs }) {
  const [panelType, setPanelType] = useState('line_chart');
  const [metric, setMetric] = useState('');
  const [xMetric, setXMetric] = useState('');
  const [yMetric, setYMetric] = useState('');

  const allMetrics = useMemo(() => {
    const keys = new Set();
    runs.forEach(r => {
      (r.history || []).forEach(h => {
        Object.keys(h).forEach(k => {
          if (k !== 'step' && k !== 'epoch') keys.add(k);
        });
      });
    });
    return [...keys].sort();
  }, [runs]);

  const handleAdd = () => {
    const id = `panel-${Date.now()}`;
    let panel;
    switch (panelType) {
      case 'line_chart':
        if (!metric) return;
        panel = { id, type: 'line_chart', metric, title: metric };
        break;
      case 'bar_chart':
        if (!metric) return;
        panel = { id, type: 'bar_chart', metric, title: `${metric} (bar)` };
        break;
      case 'scatter_plot':
        if (!xMetric || !yMetric) return;
        panel = { id, type: 'scatter_plot', xMetric, yMetric, title: `${yMetric} vs ${xMetric}` };
        break;
      case 'run_table':
        panel = { id, type: 'run_table', title: 'Run Table' };
        break;
      default:
        return;
    }
    onAdd(panel);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Panel</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div className="form-group">
          <label className="form-label">Panel Type</label>
          <select className="form-input" value={panelType} onChange={e => setPanelType(e.target.value)}>
            <option value="line_chart">Line Plot</option>
            <option value="bar_chart">Bar Chart</option>
            <option value="scatter_plot">Scatter Plot</option>
            <option value="run_table">Run Table</option>
          </select>
        </div>

        {(panelType === 'line_chart' || panelType === 'bar_chart') && (
          <div className="form-group">
            <label className="form-label">Metric</label>
            <select className="form-input" value={metric} onChange={e => setMetric(e.target.value)}>
              <option value="">Select metric...</option>
              {allMetrics.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {panelType === 'scatter_plot' && (
          <>
            <div className="form-group">
              <label className="form-label">X-Axis Metric</label>
              <select className="form-input" value={xMetric} onChange={e => setXMetric(e.target.value)}>
                <option value="">Select metric...</option>
                {allMetrics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Y-Axis Metric</label>
              <select className="form-input" value={yMetric} onChange={e => setYMetric(e.target.value)}>
                <option value="">Select metric...</option>
                {allMetrics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}

        <div className="flex gap-2" style={{ marginTop: 16 }}>
          <button className="btn-blue" onClick={handleAdd}>Add Panel</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Helper to get nested value from object
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function getRunValue(run, col) {
  if (col.startsWith('config.')) return getNestedValue(run, col);
  if (col.startsWith('summary.')) return run.summary?.[col.replace('summary.', '')];
  if (['name', 'state', 'createdAt', 'duration', 'user'].includes(col)) return run[col];
  return run.summary?.[col];
}

function getColumnLabel(col) {
  if (col.startsWith('config.')) return col.replace('config.', '');
  if (col.startsWith('summary.')) return col.replace('summary.', '');
  switch (col) {
    case 'createdAt': return 'Created';
    case 'name': return 'Name';
    case 'state': return 'State';
    case 'duration': return 'Duration';
    case 'user': return 'User';
    default: return col;
  }
}

// Sidebar Filter Dropdown
function SidebarFilterDropdown({ filters, allColumns, onChange, onClose }) {
  const operators = ['=', '!=', '>', '<', 'contains'];
  const addFilter = () => {
    onChange([...filters, { column: allColumns[0] || 'name', operator: '=', value: '' }]);
  };
  const updateFilter = (idx, field, val) => {
    const next = filters.map((f, i) => i === idx ? { ...f, [field]: val } : f);
    onChange(next);
  };
  const removeFilter = (idx) => {
    onChange(filters.filter((_, i) => i !== idx));
  };
  return (
    <div className="dropdown-panel" style={{ minWidth: 320, position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Filter runs</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      {filters.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}>
          <select className="form-input" style={{ fontSize: 11, padding: '2px 4px', width: 90 }} value={f.column} onChange={e => updateFilter(i, 'column', e.target.value)}>
            {allColumns.map(c => <option key={c} value={c}>{getColumnLabel(c)}</option>)}
          </select>
          <select className="form-input" style={{ fontSize: 11, padding: '2px 4px', width: 60 }} value={f.operator} onChange={e => updateFilter(i, 'operator', e.target.value)}>
            {operators.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          <input className="form-input" style={{ fontSize: 11, padding: '2px 4px', flex: 1 }} value={f.value} onChange={e => updateFilter(i, 'value', e.target.value)} placeholder="value" />
          <button onClick={() => removeFilter(i)} style={{ color: 'var(--text-muted)' }}><X size={12} /></button>
        </div>
      ))}
      <div style={{ padding: '6px 8px' }}>
        <button className="btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={addFilter}>
          <Plus size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />Add filter
        </button>
      </div>
    </div>
  );
}

// Sidebar Group Dropdown
function SidebarGroupDropdown({ allColumns, groupBy, onChange, onClose }) {
  return (
    <div className="dropdown-panel" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Group runs by</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <label className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>
        <input type="radio" checked={!groupBy} onChange={() => { onChange(null); onClose(); }} /> None
      </label>
      {allColumns.filter(c => c.startsWith('config.') || c === 'state' || c === 'user').map(col => (
        <label key={col} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>
          <input type="radio" checked={groupBy === col} onChange={() => { onChange(col); onClose(); }} /> {getColumnLabel(col)}
        </label>
      ))}
    </div>
  );
}

// Sidebar Sort Dropdown
function SidebarSortDropdown({ allColumns, sortBy, sortOrder, onChange, onClose }) {
  return (
    <div className="dropdown-panel" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4, minWidth: 200 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Sort runs by</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      {allColumns.map(col => (
        <button
          key={col}
          className="dropdown-item"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'left', background: sortBy === col ? 'var(--bg-active)' : 'none' }}
          onClick={() => {
            const newOrder = sortBy === col && sortOrder === 'asc' ? 'desc' : 'asc';
            onChange(col, newOrder);
            onClose();
          }}
        >
          <span>{getColumnLabel(col)}</span>
          {sortBy === col && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
        </button>
      ))}
    </div>
  );
}

// Panels toolbar Columns dropdown
function PanelsColumnsDropdown({ panels, columns, onChange, onClose }) {
  const options = [1, 2, 3, 4];
  return (
    <div className="dropdown-panel" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4, minWidth: 180 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Panel layout</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <div style={{ padding: '6px 8px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{panels} panels shown</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {options.map(n => (
            <button
              key={n}
              onClick={() => { onChange(n); onClose(); }}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: 12,
                border: '1px solid var(--border-color)',
                borderRadius: 4,
                cursor: 'pointer',
                background: columns === n ? 'var(--accent-blue)' : 'var(--bg-active)',
                color: columns === n ? '#1a1c1f' : 'var(--text-primary)',
                fontWeight: columns === n ? 700 : 400,
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>columns per row</div>
      </div>
    </div>
  );
}

// Panels toolbar Share dropdown
function PanelsShareDropdown({ entity, project, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/${entity}/${project}/workspace`;
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };
  return (
    <div className="dropdown-panel" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4, minWidth: 280 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Share workspace</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input className="form-input" readOnly value={url} style={{ flex: 1, fontSize: 12 }} />
          <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Panels toolbar More dropdown
function PanelsMoreDropdown({ onClose, onResetLayout }) {
  return (
    <div className="dropdown-panel" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>More options</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <button
        className="dropdown-item"
        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
        onClick={() => { onResetLayout(); onClose(); }}
      >
        Reset panel layout
      </button>
    </div>
  );
}

// Panels toolbar Filter dropdown (for panels)
function PanelsFilterDropdown({ searchValue, onChange, onClose }) {
  return (
    <div className="dropdown-panel" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4, minWidth: 240 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Filter panels</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <div style={{ padding: '8px 12px' }}>
        <input
          className="form-input"
          style={{ width: '100%', fontSize: 12 }}
          placeholder="Filter by metric name..."
          value={searchValue}
          onChange={e => onChange(e.target.value)}
          autoFocus
        />
      </div>
    </div>
  );
}

function applyRunFilters(runs, filters) {
  if (!filters || filters.length === 0) return runs;
  return runs.filter(run => {
    return filters.every(f => {
      const val = getRunValue(run, f.column);
      const strVal = val !== undefined ? String(val) : '';
      const fVal = f.value;
      switch (f.operator) {
        case '=': return strVal === fVal;
        case '!=': return strVal !== fVal;
        case '>': return Number(val) > Number(fVal);
        case '<': return Number(val) < Number(fVal);
        case 'contains': return strVal.toLowerCase().includes(fVal.toLowerCase());
        default: return true;
      }
    });
  });
}

export default function Workspace() {
  const { entity, project } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const proj = state.projects.find(p => p.name === project && p.entity === entity);
  const projectRuns = state.runs.filter(r => r.projectId === (proj?.id || ''));
  const { workspace } = state;
  const [searchRuns, setSearchRuns] = useState('');
  const [searchPanels, setSearchPanels] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Sidebar filter/group/sort state
  const [showSidebarFilter, setShowSidebarFilter] = useState(false);
  const [showSidebarGroup, setShowSidebarGroup] = useState(false);
  const [showSidebarSort, setShowSidebarSort] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState([]);
  const [sidebarGroupBy, setSidebarGroupBy] = useState(null);
  const [sidebarSortBy, setSidebarSortBy] = useState('name');
  const [sidebarSortOrder, setSidebarSortOrder] = useState('asc');

  // Sidebar resize
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const resizingRef = useRef(false);
  const [isResizing, setIsResizing] = useState(false);
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    resizingRef.current = true;
    setIsResizing(true);
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMove = (ev) => {
      if (!resizingRef.current) return;
      const newW = Math.max(200, Math.min(600, startW + ev.clientX - startX));
      setSidebarWidth(newW);
    };
    const onUp = () => {
      resizingRef.current = false;
      setIsResizing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

  // Panels toolbar dropdown state
  const [showPanelsFilter, setShowPanelsFilter] = useState(false);
  const [showPanelsColumns, setShowPanelsColumns] = useState(false);
  const [showPanelsShare, setShowPanelsShare] = useState(false);
  const [showPanelsMore, setShowPanelsMore] = useState(false);
  const [panelColumns, setPanelColumns] = useState(2);

  const allAvailableColumns = useMemo(() => {
    const cols = new Set(['name', 'state', 'createdAt', 'duration', 'user']);
    projectRuns.forEach(r => {
      Object.keys(r.config || {}).forEach(k => cols.add(`config.${k}`));
      Object.keys(r.summary || {}).forEach(k => cols.add(k));
    });
    return [...cols];
  }, [projectRuns]);

  // Apply sidebar filters, group, sort
  const filteredRuns = useMemo(() => {
    let runs = projectRuns.filter(r =>
      r.name.toLowerCase().includes(searchRuns.toLowerCase())
    );
    runs = applyRunFilters(runs, sidebarFilters);
    // Sort
    runs = [...runs].sort((a, b) => {
      let va = getRunValue(a, sidebarSortBy);
      let vb = getRunValue(b, sidebarSortBy);
      if (va === undefined) va = '';
      if (vb === undefined) vb = '';
      if (typeof va === 'number' && typeof vb === 'number') {
        return sidebarSortOrder === 'asc' ? va - vb : vb - va;
      }
      return sidebarSortOrder === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return runs;
  }, [projectRuns, searchRuns, sidebarFilters, sidebarSortBy, sidebarSortOrder]);

  // Group sidebar runs
  const groupedSidebarRuns = useMemo(() => {
    if (!sidebarGroupBy) return null;
    const groups = {};
    filteredRuns.forEach(run => {
      const val = String(getRunValue(run, sidebarGroupBy) ?? 'N/A');
      if (!groups[val]) groups[val] = [];
      groups[val].push(run);
    });
    return groups;
  }, [filteredRuns, sidebarGroupBy]);

  const handleToggleVisibility = (runId) => {
    dispatch({ type: 'TOGGLE_RUN_VISIBILITY', payload: runId });
  };

  const handleAddPanel = (panel) => {
    const sectionId = workspace.panelSections[0]?.id || 'section-1';
    dispatch({ type: 'ADD_PANEL', payload: { sectionId, panel } });
    setShowAddPanel(false);
  };

  const handleRemovePanel = (panelId) => {
    dispatch({ type: 'REMOVE_PANEL', payload: panelId });
  };

  const handleToggleSection = (sectionId) => {
    dispatch({ type: 'TOGGLE_SECTION_COLLAPSE', payload: sectionId });
  };

  return (
    <div className="workspace-layout">
      {/* Runs Sidebar */}
      <div className="runs-sidebar-wrapper" style={{ width: sidebarWidth }}>
      <div className="runs-sidebar">
        <div className="runs-sidebar-header">
          <span className="runs-sidebar-title">Runs ({projectRuns.length})</span>
        </div>
        <div className="runs-sidebar-search">
          <Search size={13} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search runs..."
            value={searchRuns}
            onChange={e => setSearchRuns(e.target.value)}
          />
        </div>
        <div className="runs-sidebar-toolbar" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <button
              className="toolbar-icon-btn"
              title="Filter"
              style={{ background: showSidebarFilter ? 'var(--bg-active)' : undefined }}
              onClick={() => { setShowSidebarFilter(!showSidebarFilter); setShowSidebarGroup(false); setShowSidebarSort(false); }}
            >
              <Filter size={14} />
            </button>
            {sidebarFilters.length > 0 && !showSidebarFilter && (
              <span style={{ position: 'absolute', top: 1, right: 1, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }} />
            )}
            {showSidebarFilter && (
              <SidebarFilterDropdown
                filters={sidebarFilters}
                allColumns={allAvailableColumns}
                onChange={setSidebarFilters}
                onClose={() => setShowSidebarFilter(false)}
              />
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button
              className="toolbar-icon-btn"
              title="Group"
              style={{ background: showSidebarGroup ? 'var(--bg-active)' : undefined }}
              onClick={() => { setShowSidebarGroup(!showSidebarGroup); setShowSidebarFilter(false); setShowSidebarSort(false); }}
            >
              <Layers size={14} />
            </button>
            {showSidebarGroup && (
              <SidebarGroupDropdown
                allColumns={allAvailableColumns}
                groupBy={sidebarGroupBy}
                onChange={setSidebarGroupBy}
                onClose={() => setShowSidebarGroup(false)}
              />
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button
              className="toolbar-icon-btn"
              title="Sort"
              style={{ background: showSidebarSort ? 'var(--bg-active)' : undefined }}
              onClick={() => { setShowSidebarSort(!showSidebarSort); setShowSidebarFilter(false); setShowSidebarGroup(false); }}
            >
              <GripVertical size={14} />
            </button>
            {showSidebarSort && (
              <SidebarSortDropdown
                allColumns={allAvailableColumns}
                sortBy={sidebarSortBy}
                sortOrder={sidebarSortOrder}
                onChange={(col, order) => { setSidebarSortBy(col); setSidebarSortOrder(order); }}
                onClose={() => setShowSidebarSort(false)}
              />
            )}
          </div>
        </div>
        {sidebarFilters.length > 0 && (
          <div style={{ padding: '0 8px 4px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {sidebarFilters.map((f, i) => (
              <span key={i} className="tag-pill" style={{ fontSize: 10 }}>
                {getColumnLabel(f.column)} {f.operator} {f.value}
                <button className="remove-tag" onClick={() => setSidebarFilters(sidebarFilters.filter((_, j) => j !== i))} style={{ marginLeft: 2 }}><X size={8} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="runs-list">
          {filteredRuns.length === 0 && projectRuns.length > 0 ? (
            <div style={{ padding: '16px 8px', textAlign: 'center' }}>
              <p className="text-muted text-small">No runs match your filters.</p>
              {sidebarFilters.length > 0 && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '2px 8px', marginTop: 6 }}
                  onClick={() => setSidebarFilters([])}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : groupedSidebarRuns ? (
            Object.entries(groupedSidebarRuns).map(([groupVal, groupRuns]) => (
              <div key={groupVal}>
                <div style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', marginBottom: 2 }}>
                  {getColumnLabel(sidebarGroupBy)}: {groupVal} ({groupRuns.length})
                </div>
                {groupRuns.map(run => (
                  <div key={run.id} className="run-row" style={{ opacity: run.visible ? 1 : 0.4 }}>
                    <span className="run-color-dot" style={{ background: run.color }} />
                    <RunNameWithTooltip name={run.name} onClick={() => navigate(`/${entity}/${project}/runs/${run.id}/overview`)} />
                    <StateIcon state={run.state} />
                    <button className="run-visibility-btn" onClick={() => handleToggleVisibility(run.id)} title={run.visible ? 'Hide run' : 'Show run'}>
                      {run.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            filteredRuns.map(run => (
              <div key={run.id} className="run-row" style={{ opacity: run.visible ? 1 : 0.4 }}>
                <span className="run-color-dot" style={{ background: run.color }} />
                <RunNameWithTooltip name={run.name} onClick={() => navigate(`/${entity}/${project}/runs/${run.id}/overview`)} />
                <StateIcon state={run.state} />
                <button className="run-visibility-btn" onClick={() => handleToggleVisibility(run.id)} title={run.visible ? 'Hide run' : 'Show run'}>
                  {run.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
            ))
          )}
        </div>
        <div className="runs-sidebar-footer">
          <span className="text-muted text-small">1-{filteredRuns.length} of {projectRuns.length}</span>
        </div>
        <div className="workspace-label">
          <span>My Workspace</span>
          <span className="text-muted text-small" style={{ marginLeft: 8 }}>{timeAgo(proj?.updatedAt || new Date().toISOString())}</span>
        </div>
      </div>
      <div className={`sidebar-resize-handle${isResizing ? ' dragging' : ''}`} onMouseDown={handleResizeStart} />
      </div>{/* end runs-sidebar-wrapper */}

      {/* Panel Grid Area */}
      <div className="panels-area">
        <div className="panels-toolbar">
          <div className="panels-search">
            <Search size={13} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search panels..."
              value={searchPanels}
              onChange={e => setSearchPanels(e.target.value)}
            />
          </div>
          <div className="panels-actions">
            <div style={{ position: 'relative' }}>
              <button className="toolbar-icon-btn" title="Filter" style={{ background: showPanelsFilter ? 'var(--bg-active)' : undefined }} onClick={() => { setShowPanelsFilter(!showPanelsFilter); setShowPanelsColumns(false); setShowPanelsShare(false); setShowPanelsMore(false); }}><Filter size={14} /></button>
              {showPanelsFilter && (
                <PanelsFilterDropdown searchValue={searchPanels} onChange={setSearchPanels} onClose={() => setShowPanelsFilter(false)} />
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button className="toolbar-icon-btn" title="Columns" style={{ background: showPanelsColumns ? 'var(--bg-active)' : undefined }} onClick={() => { setShowPanelsColumns(!showPanelsColumns); setShowPanelsFilter(false); setShowPanelsShare(false); setShowPanelsMore(false); }}><Columns size={14} /></button>
              {showPanelsColumns && (
                <PanelsColumnsDropdown
                  panels={workspace.panelSections.reduce((sum, s) => sum + s.panels.length, 0)}
                  columns={panelColumns}
                  onChange={setPanelColumns}
                  onClose={() => setShowPanelsColumns(false)}
                />
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button className="toolbar-icon-btn" title="Share" style={{ background: showPanelsShare ? 'var(--bg-active)' : undefined }} onClick={() => { setShowPanelsShare(!showPanelsShare); setShowPanelsFilter(false); setShowPanelsColumns(false); setShowPanelsMore(false); }}><Share2 size={14} /></button>
              {showPanelsShare && (
                <PanelsShareDropdown entity={entity} project={project} onClose={() => setShowPanelsShare(false)} />
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button className="toolbar-icon-btn" title="More" style={{ background: showPanelsMore ? 'var(--bg-active)' : undefined }} onClick={() => { setShowPanelsMore(!showPanelsMore); setShowPanelsFilter(false); setShowPanelsColumns(false); setShowPanelsShare(false); }}><MoreHorizontal size={14} /></button>
              {showPanelsMore && (
                <PanelsMoreDropdown onClose={() => setShowPanelsMore(false)} onResetLayout={() => {
                  // Reset all sections to not collapsed
                  workspace.panelSections.forEach(s => {
                    if (s.collapsed) dispatch({ type: 'TOGGLE_SECTION_COLLAPSE', payload: s.id });
                  });
                }} />
              )}
            </div>
            <button className="btn-blue" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => {
              const report = {
                id: `report-${Date.now()}`,
                title: 'Untitled Report',
                projectId: proj?.id || '',
                description: '',
                authorId: state.currentUser?.id || 'user-1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewCount: 0,
                blocks: [
                  { type: 'heading', level: 1, text: 'Untitled Report' },
                  { type: 'paragraph', text: 'Start writing your report here...' }
                ]
              };
              dispatch({ type: 'CREATE_REPORT', payload: report });
              navigate(`/${entity}/${project}/reports/${report.id}`);
            }}>Create report</button>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => setShowAddPanel(true)}>
              <Plus size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Add Panel
            </button>
          </div>
        </div>

        {workspace.panelSections.map(section => (
          <div key={section.id} className="panel-section">
            <div className="panel-section-header">
              <GripVertical size={14} color="var(--text-muted)" style={{ cursor: 'grab' }} />
              <button
                className="section-collapse-btn"
                onClick={() => handleToggleSection(section.id)}
              >
                {section.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
              <span className="section-title">{section.name}</span>
              <span className="section-badge">{section.panels.length}</span>
              <button className="toolbar-icon-btn" style={{ marginLeft: 'auto' }}>
                <Plus size={14} onClick={() => setShowAddPanel(true)} />
              </button>
            </div>
            {!section.collapsed && (
              <div className="panels-grid" style={{ gridTemplateColumns: `repeat(${panelColumns}, 1fr)` }}>
                {section.panels
                  .filter(p => !searchPanels || p.title?.toLowerCase().includes(searchPanels.toLowerCase()) || p.metric?.toLowerCase().includes(searchPanels.toLowerCase()))
                  .map(panel => (
                    <div key={panel.id} style={{ position: 'relative' }}>
                      <button
                        className="panel-remove-btn"
                        onClick={() => handleRemovePanel(panel.id)}
                        title="Remove panel"
                      >
                        <X size={12} />
                      </button>
                      {panel.type === 'line_chart' ? (
                        <ChartPanel panel={panel} runs={projectRuns} allRuns={state.runs} />
                      ) : panel.type === 'bar_chart' ? (
                        <BarChartPanel panel={panel} runs={projectRuns} allRuns={state.runs} />
                      ) : panel.type === 'scatter_plot' ? (
                        <ScatterPanel panel={panel} runs={projectRuns} allRuns={state.runs} />
                      ) : panel.type === 'run_table' ? (
                        <RunTablePanel runs={projectRuns} allRuns={state.runs} />
                      ) : (
                        <div className="panel-card">
                          <div className="panel-header">
                            <span className="panel-title">{panel.title}</span>
                          </div>
                          <div className="text-muted text-small" style={{ padding: 16 }}>
                            Unsupported panel type: {panel.type}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddPanel && (
        <AddPanelModal
          onClose={() => setShowAddPanel(false)}
          onAdd={handleAddPanel}
          runs={projectRuns}
        />
      )}
    </div>
  );
}
