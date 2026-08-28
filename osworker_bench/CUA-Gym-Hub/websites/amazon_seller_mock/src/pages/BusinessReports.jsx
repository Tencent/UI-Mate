import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';

function fmt(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtPct(n) { return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }
function TrendBadge({ n }) {
  return <span style={{ color: n >= 0 ? '#067d62' : '#d13212', fontSize: 12 }}>{n >= 0 ? '▲' : '▼'} {Math.abs(n).toFixed(1)}%</span>;
}

const PRESETS = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];

export default function BusinessReports() {
  const { state } = useApp();
  const [preset, setPreset] = useState('Last 7 Days');
  const [showSales, setShowSales] = useState(true);
  const [showUnits, setShowUnits] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [sortCol, setSortCol] = useState('orderedProductSales');
  const [sortDir, setSortDir] = useState('desc');

  if (!state) return null;
  const { salesData, products } = state;
  const snaps = salesData.dailySnapshots;

  const { current, previous } = useMemo(() => {
    let curr, prev;
    if (preset === 'Today') { curr = snaps.slice(-1); prev = snaps.slice(-2, -1); }
    else if (preset === 'Yesterday') { curr = snaps.slice(-2, -1); prev = snaps.slice(-3, -2); }
    else if (preset === 'Last 7 Days') { curr = snaps.slice(-7); prev = snaps.slice(-14, -7); }
    else { curr = snaps.slice(-30); prev = snaps.slice(-60, -30); }
    return { current: curr, previous: prev };
  }, [preset, snaps]);

  const sumField = (arr, field) => arr.reduce((s, d) => s + (d[field] || 0), 0);

  const stats = {
    sales: sumField(current, 'orderedProductSales'),
    prevSales: sumField(previous, 'orderedProductSales'),
    units: sumField(current, 'unitsOrdered'),
    prevUnits: sumField(previous, 'unitsOrdered'),
    items: sumField(current, 'totalOrderItems'),
    prevItems: sumField(previous, 'totalOrderItems')
  };
  stats.avgPrice = stats.units ? stats.sales / stats.units : 0;
  stats.prevAvgPrice = stats.prevUnits ? stats.prevSales / stats.prevUnits : 0;
  const changePct = (a, b) => b ? ((a - b) / b) * 100 : 0;

  const chartData = current.map((s, i) => ({
    date: s.date.slice(5),
    sales: s.orderedProductSales,
    units: s.unitsOrdered,
    items: s.totalOrderItems
  }));

  // Sales by ASIN
  const asinData = useMemo(() => {
    return products.slice(0, 15).map(p => ({
      asin: p.asin,
      title: p.title,
      sessions: Math.round(Math.random() * 500 + 100),
      unitsOrdered: Math.round(Math.random() * 30 + 5),
      sales: Math.round((Math.random() * 800 + 100) * 100) / 100,
      convRate: Math.round(Math.random() * 3 + 1.5 * 100) / 100
    })).sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [products, sortCol, sortDir]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Business Reports</h1>

      {/* Date Range */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {PRESETS.map(p => (
          <button key={p} onClick={() => setPreset(p)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 3, fontSize: 13, cursor: 'pointer', background: preset === p ? '#fff3cd' : 'white', borderColor: preset === p ? '#ff9900' : '#ddd', fontWeight: preset === p ? 700 : 400 }}>
            {p}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Ordered Product Sales', val: fmt(stats.sales), change: changePct(stats.sales, stats.prevSales) },
          { label: 'Units Ordered', val: stats.units.toLocaleString(), change: changePct(stats.units, stats.prevUnits) },
          { label: 'Total Order Items', val: stats.items.toLocaleString(), change: changePct(stats.items, stats.prevItems) },
          { label: 'Avg Selling Price', val: fmt(stats.avgPrice), change: changePct(stats.avgPrice, stats.prevAvgPrice) }
        ].map((s, i) => (
          <div key={i} className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 12, color: '#555' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px' }}>{s.val}</div>
            <TrendBadge n={s.change} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="card-title" style={{ marginBottom: 0 }}>Sales Overview</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={showSales} onChange={e => setShowSales(e.target.checked)} /> <span style={{ color: '#ff9900', fontWeight: 700 }}>■</span> Sales
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={showUnits} onChange={e => setShowUnits(e.target.checked)} /> <span style={{ color: '#0066c0', fontWeight: 700 }}>■</span> Units
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={showItems} onChange={e => setShowItems(e.target.checked)} /> <span style={{ color: '#067d62', fontWeight: 700 }}>■</span> Items
            </label>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            {showSales && <Line type="monotone" dataKey="sales" name="Sales ($)" stroke="#ff9900" strokeWidth={2} dot={false} />}
            {showUnits && <Line type="monotone" dataKey="units" name="Units" stroke="#0066c0" strokeWidth={2} dot={false} />}
            {showItems && <Line type="monotone" dataKey="items" name="Order Items" stroke="#067d62" strokeWidth={2} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by ASIN */}
      <div className="card">
        <div className="card-title">Sales by ASIN</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ASIN</th>
              <th>Product Title</th>
              <th onClick={() => { setSortCol('sessions'); setSortDir(d => d === 'desc' ? 'asc' : 'desc'); }} style={{ cursor: 'pointer' }}>Sessions</th>
              <th onClick={() => { setSortCol('unitsOrdered'); setSortDir(d => d === 'desc' ? 'asc' : 'desc'); }} style={{ cursor: 'pointer' }}>Units Ordered</th>
              <th onClick={() => { setSortCol('sales'); setSortDir(d => d === 'desc' ? 'asc' : 'desc'); }} style={{ cursor: 'pointer' }}>Sales</th>
              <th onClick={() => { setSortCol('convRate'); setSortDir(d => d === 'desc' ? 'asc' : 'desc'); }} style={{ cursor: 'pointer' }}>Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {asinData.map((row, i) => (
              <tr key={i}>
                <td style={{ fontSize: 12 }}>{row.asin}</td>
                <td><div className="truncate" style={{ maxWidth: 240 }}>{row.title}</div></td>
                <td>{row.sessions.toLocaleString()}</td>
                <td>{row.unitsOrdered}</td>
                <td style={{ fontWeight: 700 }}>{fmt(row.sales)}</td>
                <td>{row.convRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
