import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Users, Mail, Eye, MousePointer, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

function LineChart({ data, height = 200, color = '#007C89', label = '' }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const svgW = 500;
  const svgH = height;
  const pad = { top: 16, right: 16, bottom: 32, left: 50 };
  const chartW = svgW - pad.left - pad.right;
  const chartH = svgH - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * chartW,
    y: pad.top + chartH - ((d.value - min) / range) * chartH,
    ...d
  }));

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = [...points.map(p => `${p.x},${p.y}`), `${pad.left + chartW},${pad.top + chartH}`, `${pad.left},${pad.top + chartH}`].join(' ');

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(min + (range / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yLabels.map((val, i) => {
        const y = pad.top + chartH - ((val - min) / range) * chartH;
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={pad.left + chartW} y2={y} stroke="#F0F0F0" strokeWidth="1" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#707070">{val.toLocaleString()}</text>
          </g>
        );
      })}
      {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 6)) === 0 || i === points.length - 1).map((p, i) => (
        <text key={i} x={p.x} y={svgH - 6} textAnchor="middle" fontSize="10" fill="#707070">{p.label}</text>
      ))}
      <polygon points={areaPoints} fill={`url(#grad-${label})`} />
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export default function Analytics() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30');
  const [compareIds, setCompareIds] = useState([]);

  const sentCampaigns = state.campaigns.filter(c => c.status === 'sent' && c.report);
  const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.report?.sent || 0), 0);
  const totalDelivered = sentCampaigns.reduce((sum, c) => sum + (c.report?.delivered || 0), 0);
  const avgOpenRate = sentCampaigns.length > 0 ? sentCampaigns.reduce((sum, c) => sum + (c.report?.openRate || 0), 0) / sentCampaigns.length : 0;
  const avgClickRate = sentCampaigns.length > 0 ? sentCampaigns.reduce((sum, c) => sum + (c.report?.clickRate || 0), 0) / sentCampaigns.length : 0;
  const totalRevenue = sentCampaigns.reduce((sum, c) => sum + (c.report?.revenue || 0), 0);
  const totalBounces = sentCampaigns.reduce((sum, c) => sum + (c.report?.bounces || 0), 0);
  const totalUnsubs = sentCampaigns.reduce((sum, c) => sum + (c.report?.unsubscribes || 0), 0);

  // Audience growth chart
  const growthData = (state.audiences[0]?.growthHistory || []).map(d => ({
    value: d.total,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Revenue chart
  const revenueData = (state.ecommerce?.revenueByMonth || []).map(r => ({
    value: r.revenue,
    label: r.month
  }));

  // Email performance over time
  const emailPerfData = sentCampaigns
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
    .map(c => ({
      value: Math.round(c.report.openRate * 100),
      label: c.name.length > 12 ? c.name.slice(0, 12) + '...' : c.name
    }));

  const toggleCompare = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(x => x !== id));
    } else if (compareIds.length < 3) {
      setCompareIds([...compareIds, id]);
    }
  };

  const comparedCampaigns = sentCampaigns.filter(c => compareIds.includes(c.id));

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <div className="segmented-control">
          {[{ v: '7', l: '7 days' }, { v: '30', l: '30 days' }, { v: '90', l: '90 days' }].map(r => (
            <button key={r.v} className={timeRange === r.v ? 'active' : ''} onClick={() => setTimeRange(r.v)}>{r.l}</button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label"><Mail size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Emails Sent</div>
          <div className="stat-value">{totalSent.toLocaleString()}</div>
          <div className="stat-trend up"><TrendingUp size={12} /> +12% vs prior</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Eye size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Avg Open Rate</div>
          <div className="stat-value">{(avgOpenRate * 100).toFixed(1)}%</div>
          <div className="stat-trend up"><TrendingUp size={12} /> +2.1%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><MousePointer size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Avg Click Rate</div>
          <div className="stat-value">{(avgClickRate * 100).toFixed(1)}%</div>
          <div className="stat-trend up"><TrendingUp size={12} /> +0.5%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><DollarSign size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Total Revenue</div>
          <div className="stat-value">${totalRevenue.toLocaleString()}</div>
          <div className="stat-trend up"><TrendingUp size={12} /> from campaigns</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Audience</div>
          <div className="stat-value">{(state.audiences[0]?.stats?.totalContacts || 0).toLocaleString()}</div>
          <div className="stat-sub">{totalUnsubs} unsubscribes total</div>
        </div>
      </div>

      <div className="two-columns-60-40" style={{ marginBottom: 24 }}>
        {/* Audience Growth */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Audience Growth</h3>
          <LineChart data={growthData} color="#007C89" label="audience" />
        </div>

        {/* E-commerce Revenue */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            <DollarSign size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />E-commerce Revenue
          </h3>
          <LineChart data={revenueData} color="#2E7D32" height={200} label="revenue" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div style={{ background: '#F6F6F4', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div className="text-xs text-muted">This Month</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2E7D32' }}>${(state.ecommerce?.revenueThisMonth || 0).toLocaleString()}</div>
            </div>
            <div style={{ background: '#F6F6F4', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div className="text-xs text-muted">Orders</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{state.ecommerce?.ordersThisMonth || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Performance Over Time */}
      <div className="card mb-24">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Email Performance Over Time (Open Rate %)</h3>
        <LineChart data={emailPerfData} color="#1565C0" height={180} label="perf" />
      </div>

      {/* Campaign Comparison */}
      <div className="card mb-24">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Campaign Comparison</h3>
          <span className="text-xs text-muted">Select up to 3 campaigns to compare</span>
        </div>

        {comparedCampaigns.length > 0 && (
          <div style={{ marginBottom: 16, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {comparedCampaigns.map(c => <th key={c.id}>{c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Sent', c => c.report.sent.toLocaleString()],
                  ['Delivered', c => c.report.delivered.toLocaleString()],
                  ['Open Rate', c => `${(c.report.openRate * 100).toFixed(1)}%`],
                  ['Click Rate', c => `${(c.report.clickRate * 100).toFixed(1)}%`],
                  ['Bounces', c => c.report.bounces.toLocaleString()],
                  ['Unsubscribes', c => c.report.unsubscribes.toLocaleString()],
                  ['Revenue', c => c.report.revenue ? `$${c.report.revenue.toLocaleString()}` : '--']
                ].map(([label, fn]) => (
                  <tr key={label}>
                    <td style={{ fontWeight: 500 }}>{label}</td>
                    {comparedCampaigns.map(c => <td key={c.id}>{fn(c)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Campaigns Table */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>All Campaign Performance</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>Compare</th>
              <th>Campaign</th>
              <th>Sent Date</th>
              <th>Delivered</th>
              <th>Open Rate</th>
              <th>Click Rate</th>
              <th>Revenue</th>
              <th>Bounces</th>
            </tr>
          </thead>
          <tbody>
            {sentCampaigns.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).map(c => (
              <tr key={c.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={compareIds.includes(c.id)}
                    onChange={() => toggleCompare(c.id)}
                    disabled={!compareIds.includes(c.id) && compareIds.length >= 3}
                  />
                </td>
                <td>
                  <a style={{ color: '#007C89', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate(`/campaigns/${c.id}/report`)}>
                    {c.name}
                  </a>
                </td>
                <td className="text-muted text-sm">{new Date(c.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                <td>{c.report?.delivered?.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 50, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${c.report.openRate * 100}%`, height: '100%', background: '#007C89', borderRadius: 3 }} />
                    </div>
                    {(c.report.openRate * 100).toFixed(1)}%
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 50, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(c.report.clickRate * 100 * 3, 100)}%`, height: '100%', background: '#1565C0', borderRadius: 3 }} />
                    </div>
                    {(c.report.clickRate * 100).toFixed(1)}%
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{c.report?.revenue ? `$${c.report.revenue.toLocaleString()}` : '--'}</td>
                <td className="text-muted">{c.report?.bounces || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
