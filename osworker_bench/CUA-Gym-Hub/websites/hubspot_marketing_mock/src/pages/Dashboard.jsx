import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronDown, Plus, MoreHorizontal } from 'lucide-react';
import { TrendIndicator, Modal, FormField } from '../components/ui/index.jsx';

// --- SVG Charts ---

function LineChart({ data, color = '#00A4BD', height = 120 }) {
  if (!data || data.values.length < 2) return null;
  const { labels, values } = data;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 400;
  const h = height;
  const pad = 8;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1][0]} ${h} L ${points[0][0]} ${h} Z`;

  // Show only a few labels
  const labelStep = Math.ceil(labels.length / 6);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: height }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color.replace('#','')})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
        {points.map((p, i) => (
          i % labelStep === 0 && (
            <text key={i} x={p[0]} y={h - 1} textAnchor="middle" fontSize="9" fill="#7C98B6">{labels[i]}</text>
          )
        ))}
      </svg>
    </div>
  );
}

function BarChart({ data, color = '#00A4BD', height = 120 }) {
  if (!data || !data.values.length) return null;
  const { labels, values } = data;
  const max = Math.max(...values);
  const barColors = ['#FF7A59', '#00A4BD', '#00BDA5', '#DBAE17', '#516F90', '#8C4FFF'];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 4px' }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--hs-text-muted)', fontWeight: 500 }}>
            {(v/1000).toFixed(1)}k
          </div>
          <div style={{
            width: '100%',
            background: barColors[i % barColors.length],
            height: (v / max) * (height - 32),
            borderRadius: '2px 2px 0 0',
            minHeight: 2,
            transition: 'height 0.3s ease'
          }} />
          <div style={{ fontSize: 9, color: 'var(--hs-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
            {labels[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 120 }) {
  if (!data || !data.values.length) return null;
  const { labels, values, colors } = data;
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return <div style={{ color: 'var(--hs-text-muted)', fontSize: 13 }}>No data</div>;

  const defaultColors = ['#FF7A59', '#00A4BD', '#00BDA5', '#DBAE17', '#516F90'];
  const cx = size / 2, cy = size / 2, r = size * 0.4, innerR = size * 0.25;
  let currentAngle = -Math.PI / 2;

  const segments = values.map((v, i) => {
    const angle = (v / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    currentAngle += angle;
    const x2 = cx + r * Math.cos(currentAngle);
    const y2 = cy + r * Math.sin(currentAngle);
    const ix1 = cx + innerR * Math.cos(currentAngle - angle);
    const iy1 = cy + innerR * Math.sin(currentAngle - angle);
    const ix2 = cx + innerR * Math.cos(currentAngle);
    const iy2 = cy + innerR * Math.sin(currentAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const color = (colors || defaultColors)[i % (colors || defaultColors).length];
    return { d: `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`, color };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size}>
        {segments.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#33475B">
          {total.toLocaleString()}
        </text>
      </svg>
      <div style={{ flex: 1 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: (colors || ['#FF7A59','#00A4BD','#00BDA5','#DBAE17','#516F90'])[i] }} />
            <span style={{ color: 'var(--hs-text-secondary)', flex: 1 }}>{l}</span>
            <span style={{ fontWeight: 500 }}>{values[i].toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableWidget({ data }) {
  if (!data) return null;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="hs-table" style={{ fontSize: 12 }}>
        <thead>
          <tr>{data.headers.map((h, i) => <th key={i} style={{ fontSize: 10, padding: '6px 10px' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} style={{ padding: '6px 10px', fontSize: 12 }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NumberCard({ report }) {
  const { value, trend, comparisonPeriod, unit } = report.data;
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--hs-text-primary)', lineHeight: 1.1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}{unit || ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <TrendIndicator value={trend} />
        {comparisonPeriod && <span style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>{comparisonPeriod}</span>}
      </div>
    </div>
  );
}

function ReportWidget({ report, currentDashboard, onRemove, onClone }) {
  const [showMenu, setShowMenu] = useState(false);

  const dateRangeLabel = {
    last_30_days: 'Last 30 days',
    last_7_days: 'Last 7 days',
    this_month: 'This month',
    this_quarter: 'This quarter',
    last_month: 'Last month'
  }[report.dateRange] || report.dateRange;

  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 200 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--hs-text-primary)' }}>{report.name}</div>
          <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 2 }}>{dateRangeLabel}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)', padding: 4, borderRadius: 3 }}>
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="dropdown-menu" style={{ right: 0, top: '100%' }}>
              <div className="dropdown-item" onClick={() => setShowMenu(false)}>Edit</div>
              <div className="dropdown-item" onClick={() => { setShowMenu(false); onClone && onClone(report); }}>Clone</div>
              <div className="dropdown-item" style={{ color: 'var(--hs-danger)' }} onClick={() => { setShowMenu(false); onRemove && onRemove(report.id); }}>Remove</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {report.type === 'number' && <NumberCard report={report} />}
        {report.type === 'line_chart' && <LineChart data={report.data} />}
        {report.type === 'bar_chart' && <BarChart data={report.data} />}
        {report.type === 'donut_chart' && <DonutChart data={report.data} />}
        {report.type === 'table' && <TableWidget data={report.data} />}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, updateState, addItem, deleteItem, updateItem, showToast } = useApp();
  const navigate = useNavigate();
  const [showDashMenu, setShowDashMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState('number');
  const [newReportRange, setNewReportRange] = useState('last_30_days');

  const currentDashboard = state.dashboards?.find(d => d.id === state.selectedDashboardId)
    || state.dashboards?.[0];

  const dashboardReports = state.reports?.filter(r => r.dashboardId === currentDashboard?.id) || [];

  const selectDashboard = (id) => {
    updateState({ selectedDashboardId: id });
    setShowDashMenu(false);
  };

  const handleCloneDashboard = () => {
    if (!currentDashboard) return;
    const cloned = {
      ...currentDashboard,
      id: `dashboard-${Date.now()}`,
      name: currentDashboard.name + ' (copy)',
      reports: [...(currentDashboard.reports || [])],
      isDefault: false,
    };
    addItem('dashboards', cloned);
    showToast('Dashboard cloned', 'success');
    setShowActionsMenu(false);
  };

  const handleDeleteDashboard = () => {
    if (!currentDashboard) return;
    const dashboards = state.dashboards || [];
    if (dashboards.length <= 1) {
      showToast('Cannot delete the last dashboard', 'error');
      setShowActionsMenu(false);
      return;
    }
    deleteItem('dashboards', currentDashboard.id);
    const remaining = dashboards.filter(d => d.id !== currentDashboard.id);
    updateState({ selectedDashboardId: remaining[0].id });
    showToast('Dashboard deleted', 'success');
    setShowActionsMenu(false);
  };

  const handleSetDefault = () => {
    if (!currentDashboard) return;
    (state.dashboards || []).forEach(d => {
      if (d.id !== currentDashboard.id && d.isDefault) {
        updateItem('dashboards', d.id, { isDefault: false });
      }
    });
    updateItem('dashboards', currentDashboard.id, { isDefault: true });
    showToast('Set as default dashboard', 'success');
    setShowActionsMenu(false);
  };

  const handleAddReport = () => {
    if (!newReportName.trim() || !currentDashboard) return;
    const newReport = {
      id: `report-${Date.now()}`,
      name: newReportName.trim(),
      type: newReportType,
      dashboardId: currentDashboard.id,
      dateRange: newReportRange,
      data: newReportType === 'number'
        ? { value: 0, trend: 0, comparisonPeriod: 'vs last period' }
        : newReportType === 'line_chart' || newReportType === 'bar_chart'
        ? { labels: ['Jan','Feb','Mar','Apr','May','Jun'], values: [0,0,0,0,0,0] }
        : newReportType === 'donut_chart'
        ? { labels: ['Category A','Category B'], values: [50, 50] }
        : { headers: ['Metric','Value'], rows: [['Total','0']] }
    };
    addItem('reports', newReport);
    showToast('Report added to dashboard', 'success');
    setShowAddReport(false);
    setNewReportName('');
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowDashMenu(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>{currentDashboard?.name || 'Dashboard'}</h1>
            <ChevronDown size={20} style={{ color: 'var(--hs-text-muted)' }} />
          </div>
          {showDashMenu && (
            <div className="dropdown-menu" style={{ top: '100%', left: 0, minWidth: 240 }}>
              {(state.dashboards || []).map(d => (
                <div key={d.id} className="dropdown-item" onClick={() => selectDashboard(d.id)}
                  style={{ fontWeight: d.id === currentDashboard?.id ? 600 : 400 }}>
                  {d.name} {d.isDefault && <span style={{ fontSize: 11, color: 'var(--hs-text-muted)', marginLeft: 6 }}>(default)</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost" onClick={() => setShowActionsMenu(v => !v)}>Actions ▾</button>
            {showActionsMenu && (
              <div className="dropdown-menu" style={{ right: 0, top: '100%', minWidth: 200 }}>
                <div className="dropdown-item" onClick={handleCloneDashboard}>Clone dashboard</div>
                <div className="dropdown-item" onClick={handleSetDefault}>Set as default</div>
                <div className="dropdown-item" style={{ color: 'var(--hs-danger)' }} onClick={handleDeleteDashboard}>Delete dashboard</div>
              </div>
            )}
          </div>
          <button className="btn btn-secondary" onClick={() => setShowAddReport(true)}>
            <Plus size={16} /> Add report
          </button>
        </div>
      </div>

      {/* Widget grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {dashboardReports.map(report => (
          <div key={report.id} style={{
            gridColumn: report.type === 'line_chart' || report.type === 'bar_chart' ? 'span 2' : 'span 1'
          }}>
            <ReportWidget
              report={report}
              currentDashboard={currentDashboard}
              onRemove={(reportId) => {
                deleteItem('reports', reportId);
                showToast('Report removed', 'success');
              }}
              onClone={(report) => {
                const cloned = { ...report, id: `report-${Date.now()}`, name: report.name + ' (copy)' };
                addItem('reports', cloned);
                showToast('Report cloned', 'success');
              }}
            />
          </div>
        ))}
        {dashboardReports.length === 0 && (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 60, color: 'var(--hs-text-muted)' }}>
            No reports yet. Click "Add report" to get started.
          </div>
        )}
      </div>

      {/* Add report modal */}
      {showAddReport && (
        <Modal title="Add report" onClose={() => setShowAddReport(false)} width={480}>
          <FormField label="Report name" required>
            <input autoFocus value={newReportName} onChange={e => setNewReportName(e.target.value)} placeholder="e.g. Email Open Rate" onKeyDown={e => e.key === 'Enter' && handleAddReport()} />
          </FormField>
          <FormField label="Chart type">
            <select value={newReportType} onChange={e => setNewReportType(e.target.value)}>
              <option value="number">Number card</option>
              <option value="line_chart">Line chart</option>
              <option value="bar_chart">Bar chart</option>
              <option value="donut_chart">Donut chart</option>
              <option value="table">Table</option>
            </select>
          </FormField>
          <FormField label="Date range">
            <select value={newReportRange} onChange={e => setNewReportRange(e.target.value)}>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_7_days">Last 7 days</option>
              <option value="this_month">This month</option>
              <option value="this_quarter">This quarter</option>
            </select>
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowAddReport(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddReport}>Add to dashboard</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
