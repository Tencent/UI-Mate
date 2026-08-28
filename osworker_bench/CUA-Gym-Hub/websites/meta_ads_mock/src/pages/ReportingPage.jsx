import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import './ReportingPage.css';

function formatCurrency(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatNum(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function ReportingPage() {
  const { state, createSavedReport } = useApp();
  const { showToast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState(['results', 'amountSpent', 'reach', 'impressions']);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('last_7_days');
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const campaigns = state.campaigns.filter(c => c.status !== 'deleted' && c.amountSpent > 0);

  const METRIC_OPTIONS = [
    { key: 'results', label: 'Results' },
    { key: 'reach', label: 'Reach' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'clicks', label: 'Clicks' },
    { key: 'amountSpent', label: 'Amount Spent' },
    { key: 'costPerResult', label: 'Cost/Result' },
    { key: 'roas', label: 'ROAS' },
    { key: 'ctr', label: 'CTR %' },
  ];

  function toggleMetric(key) {
    setSelectedMetrics(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]);
  }

  function formatMetricValue(key, val) {
    if (!val) return '—';
    if (key === 'amountSpent' || key === 'costPerResult') return formatCurrency(val);
    if (key === 'ctr') return val.toFixed(2) + '%';
    if (key === 'roas') return val.toFixed(2) + 'x';
    return formatNum(val);
  }

  const maxBars = { results: 0, amountSpent: 0 };
  campaigns.forEach(c => {
    if (selectedMetrics.includes('results')) maxBars.results = Math.max(maxBars.results, c.results || 0);
    if (selectedMetrics.includes('amountSpent')) maxBars.amountSpent = Math.max(maxBars.amountSpent, c.amountSpent || 0);
  });

  return (
    <div className="reporting-page">
      <div className="reporting-header">
        <h2 className="page-title">Reporting</h2>
        <div className="page-actions">
          <select className="field-select" style={{ width: 200 }} value={selectedReport || ''} onChange={e => setSelectedReport(e.target.value || null)}>
            <option value="">Select saved report...</option>
            {state.savedReports.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className="btn-outline" onClick={() => showToast('Report exported.')}>Export</button>
          <button className="btn-primary" onClick={() => setShowSaveDialog(true)}>Save Report</button>
        </div>
      </div>

      <div className="reporting-card">
        <div className="reporting-controls">
          <div className="metrics-select">
            <div className="control-label">Metrics</div>
            <div className="metrics-checkboxes">
              {METRIC_OPTIONS.map(m => (
                <label key={m.key} className="metric-check-label">
                  <input type="checkbox" checked={selectedMetrics.includes(m.key)} onChange={() => toggleMetric(m.key)} />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bar-chart-section">
          <div className="bar-chart-title">Campaign Comparison — {METRIC_OPTIONS.find(m => m.key === selectedMetrics[0])?.label || 'Results'}</div>
          <div className="bar-chart">
            {campaigns.map(c => {
              const metric = selectedMetrics[0] || 'results';
              const val = c[metric] || 0;
              const max = campaigns.reduce((m, x) => Math.max(m, x[metric] || 0), 1);
              const pct = max ? (val / max) * 100 : 0;
              return (
                <div key={c.id} className="bar-row">
                  <div className="bar-label" title={c.name}>{c.name.length > 25 ? c.name.slice(0, 25) + '…' : c.name}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="bar-value">{formatMetricValue(metric, val)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data table */}
        <div className="reporting-table-wrap">
          <table className="data-table-basic">
            <thead>
              <tr>
                <th>Campaign</th>
                {selectedMetrics.map(m => (
                  <th key={m} style={{ textAlign: 'right' }}>{METRIC_OPTIONS.find(o => o.key === m)?.label || m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  {selectedMetrics.map(m => (
                    <td key={m} style={{ textAlign: 'right' }}>{formatMetricValue(m, c[m])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSaveDialog && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSaveDialog(false); }}>
          <div className="modal-container" style={{ width: 380 }}>
            <div className="modal-header">
              <div className="modal-tabs"><button className="modal-tab modal-tab--active">Save Report</button></div>
              <button className="modal-close" onClick={() => setShowSaveDialog(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: 20 }}>
              <div className="field-group">
                <label className="field-label">Report name</label>
                <input className="field-input" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="My report" autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowSaveDialog(false)}>Cancel</button>
              <div style={{ flex: 1 }} />
              <button className="btn-primary" onClick={() => {
                if (!saveName.trim()) return;
                const newReport = {
                  id: `report_${Date.now()}`,
                  name: saveName.trim(),
                  metrics: selectedMetrics,
                  dateRange,
                  createdAt: new Date().toISOString()
                };
                createSavedReport(newReport);
                showToast('Report saved.');
                setShowSaveDialog(false);
                setSaveName('');
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
