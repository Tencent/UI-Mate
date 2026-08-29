import { useAppContext } from '../context/AppContext';
import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { formatNumber, formatPercent, formatDuration, formatCurrency } from '../utils/dataManager';

const availableDimensions = [
  'Country', 'City', 'Page path', 'Source', 'Medium', 'Event name',
  'Device category', 'Browser', 'OS', 'Language', 'Age', 'Gender'
];
const availableMetrics = [
  'Active users', 'New users', 'Sessions', 'Engagement rate',
  'Average engagement time', 'Event count', 'Conversions', 'Total revenue'
];
const visualizations = ['Table', 'Line chart', 'Bar chart', 'Donut chart', 'Scatter plot'];

export default function FreeFormExploration() {
  const { state } = useAppContext();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const exploration = state.explorations.find(e => e.id === id);
  const [vizType, setVizType] = useState('Table');
  const [selectedRows, setSelectedRows] = useState(['Country']);
  const [selectedValues, setSelectedValues] = useState(['Sessions', 'Active users']);

  // Generate table data from state
  const tableData = useMemo(() => {
    const dim = selectedRows[0];
    if (!dim) return [];

    const mapping = {
      'Country': () => state.countries.map(c => ({ dimension: c.country, sessions: c.sessions, users: c.users, engagementRate: c.engagementRate, conversions: c.conversions, revenue: c.revenue })),
      'City': () => state.cities.map(c => ({ dimension: c.city, sessions: c.sessions, users: c.users })),
      'Source': () => state.trafficSources.map(s => ({ dimension: s.source, sessions: s.sessions, users: s.users, engagementRate: s.engagementRate, conversions: s.conversions, revenue: s.totalRevenue })),
      'Medium': () => state.trafficSources.map(s => ({ dimension: s.medium, sessions: s.sessions, users: s.users })),
      'Event name': () => state.events.map(e => ({ dimension: e.name, sessions: e.count, users: e.totalUsers })),
      'Browser': () => state.techPlatforms.browsers.map(b => ({ dimension: b.name, users: b.users })),
      'OS': () => state.techPlatforms.operatingSystems.map(o => ({ dimension: o.name, users: o.users })),
      'Device category': () => state.techPlatforms.devices.map(d => ({ dimension: d.category, users: d.users })),
      'Language': () => state.languages.map(l => ({ dimension: l.language, users: l.users })),
      'Age': () => state.ageBrackets.map(a => ({ dimension: a.bracket, users: a.users })),
      'Gender': () => state.genders.map(g => ({ dimension: g.gender, users: g.users })),
      'Page path': () => state.pages.map(p => ({ dimension: p.pagePath, sessions: p.views, users: p.users, conversions: p.conversions })),
    };

    return (mapping[dim] || (() => []))();
  }, [selectedRows, state]);

  const addRow = (dim) => {
    if (!selectedRows.includes(dim)) setSelectedRows([...selectedRows, dim]);
  };
  const addValue = (metric) => {
    if (!selectedValues.includes(metric)) setSelectedValues([...selectedValues, metric]);
  };
  const removeRow = (dim) => setSelectedRows(selectedRows.filter(d => d !== dim));
  const removeValue = (metric) => setSelectedValues(selectedValues.filter(m => m !== metric));

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--ga-header-height) - 48px)', margin: '-24px', overflow: 'hidden' }}>
      {/* Variables panel */}
      <div style={{ width: 220, borderRight: '1px solid var(--ga-border-light)', padding: 16, overflowY: 'auto', background: '#fff' }}>
        <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: 'var(--ga-text-secondary)', textTransform: 'uppercase' }}>Variables</h3>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ga-text-secondary)', marginBottom: 6 }}>DIMENSIONS</div>
          {availableDimensions.map(d => (
            <div key={d} onClick={() => addRow(d)} style={{
              padding: '4px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 4,
              background: selectedRows.includes(d) ? '#e8f0fe' : 'transparent',
              color: selectedRows.includes(d) ? '#1a73e8' : '#202124',
              marginBottom: 2
            }}>{d}</div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ga-text-secondary)', marginBottom: 6 }}>METRICS</div>
          {availableMetrics.map(m => (
            <div key={m} onClick={() => addValue(m)} style={{
              padding: '4px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 4,
              background: selectedValues.includes(m) ? '#e8f0fe' : 'transparent',
              color: selectedValues.includes(m) ? '#1a73e8' : '#202124',
              marginBottom: 2
            }}>{m}</div>
          ))}
        </div>
      </div>

      {/* Tab Settings panel */}
      <div style={{ width: 220, borderRight: '1px solid var(--ga-border-light)', padding: 16, overflowY: 'auto', background: '#fff' }}>
        <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: 'var(--ga-text-secondary)', textTransform: 'uppercase' }}>Tab Settings</h3>

        <div className="form-group">
          <div className="form-label">Visualization</div>
          <select className="form-select" value={vizType} onChange={e => setVizType(e.target.value)} style={{ height: 32, fontSize: 13 }}>
            {visualizations.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ga-text-secondary)', marginBottom: 6 }}>ROWS</div>
          {selectedRows.map(r => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#e8f0fe', borderRadius: 12, fontSize: 12, marginBottom: 4 }}>
              <span>{r}</span>
              <span onClick={() => removeRow(r)} style={{ cursor: 'pointer', color: '#5f6368' }}>x</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#5f6368', marginTop: 4 }}>Drop dimensions here</div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ga-text-secondary)', marginBottom: 6 }}>VALUES</div>
          {selectedValues.map(v => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#e8f0fe', borderRadius: 12, fontSize: 12, marginBottom: 4 }}>
              <span>{v}</span>
              <span onClick={() => removeValue(v)} style={{ cursor: 'pointer', color: '#5f6368' }}>x</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#5f6368', marginTop: 4 }}>Drop metrics here</div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#f8f9fa' }}>
        <h2 style={{ fontFamily: 'var(--ga-font-heading)', fontSize: 18, fontWeight: 400, marginBottom: 16 }}>
          {exploration ? exploration.name : 'New exploration'}
        </h2>

        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{selectedRows[0] || 'Dimension'}</th>
                {selectedValues.map(v => <th key={v} className="numeric">{v}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 15).map((row, i) => (
                <tr key={i}>
                  <td>{row.dimension}</td>
                  {selectedValues.map(v => {
                    const key = v.toLowerCase().replace(/\s+/g, '');
                    const val = row.sessions || row.users || row.conversions || '-';
                    return <td key={v} className="numeric">{typeof val === 'number' ? formatNumber(val) : val}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
