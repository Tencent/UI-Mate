import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const formatCurrency = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const formatPercent = (n) => (n * 100).toFixed(1) + '%';

export default function Home() {
  const { state, updateUI } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;
  const [dateRange, setDateRange] = useState(state.ui.analyticsDateRange.label || 'Last 30 days');
  const [conversionMetric, setConversionMetric] = useState(state.ui.selectedConversionMetric || 'revenue');

  const sentCampaigns = state.campaigns.filter(c => c.status === 'sent');
  const liveFlows = state.flows.filter(f => f.status === 'live');

  const totalRevenue = sentCampaigns.reduce((s, c) => s + c.stats.revenue, 0) + liveFlows.reduce((s, f) => s + f.stats.revenue, 0);
  const campaignRevenue = sentCampaigns.reduce((s, c) => s + c.stats.revenue, 0);
  const flowRevenue = liveFlows.reduce((s, f) => s + f.stats.revenue, 0);
  const campaignPct = totalRevenue > 0 ? ((campaignRevenue / totalRevenue) * 100).toFixed(0) : 0;
  const flowPct = totalRevenue > 0 ? ((flowRevenue / totalRevenue) * 100).toFixed(0) : 0;

  const totalDelivered = sentCampaigns.reduce((s, c) => s + c.stats.delivered, 0);
  const totalOrders = sentCampaigns.reduce((s, c) => s + c.stats.ordersPlaced, 0) + liveFlows.reduce((s, f) => s + f.stats.conversions, 0);
  const subscribedCount = state.profiles.filter(p => p.consent.email === 'subscribed').length;

  // Mini chart data (fake 7-day trend)
  const chartData = [65, 72, 80, 68, 85, 92, 88];

  const handleDateChange = (e) => {
    setDateRange(e.target.value);
    updateUI({ analyticsDateRange: { ...state.ui.analyticsDateRange, label: e.target.value } });
  };

  const handleMetricChange = (e) => {
    setConversionMetric(e.target.value);
    updateUI({ selectedConversionMetric: e.target.value });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Home</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="date-range-select" value={dateRange} onChange={handleDateChange}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 180 days</option>
          </select>
          <select className="date-range-select" value={conversionMetric} onChange={handleMetricChange}>
            <option value="revenue">Revenue</option>
            <option value="conversions">Conversions</option>
          </select>
        </div>
      </div>

      {/* KPI stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Attributed Revenue</div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-change"><span className="change-badge positive">+12.5%</span></div>
          <div className="mini-chart">
            {chartData.map((v, i) => <div key={i} className="bar" style={{ height: `${v}%` }} />)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Delivered</div>
          <div className="stat-value">{totalDelivered.toLocaleString()}</div>
          <div className="stat-change"><span className="change-badge positive">+8.3%</span></div>
          <div className="mini-chart">
            {[50,60,55,70,65,78,72].map((v, i) => <div key={i} className="bar" style={{ height: `${v}%`, background: 'var(--accent-blue)' }} />)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{totalOrders.toLocaleString()}</div>
          <div className="stat-change"><span className="change-badge positive">+15.7%</span></div>
          <div className="mini-chart">
            {[40,48,55,50,62,58,68].map((v, i) => <div key={i} className="bar" style={{ height: `${v}%`, background: 'var(--accent-purple)' }} />)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Profiles</div>
          <div className="stat-value">{subscribedCount.toLocaleString()}</div>
          <div className="stat-change"><span className="change-badge positive">+3.2%</span></div>
          <div className="mini-chart">
            {[70,72,74,73,76,78,80].map((v, i) => <div key={i} className="bar" style={{ height: `${v}%`, background: 'var(--accent-yellow)' }} />)}
          </div>
        </div>
      </div>

      {/* Revenue Attribution */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="card-title" style={{ marginBottom: 8 }}>Revenue Attribution</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 700 }}>{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="text-muted" style={{ fontSize: 13 }}>Total Xlaviyo attributed revenue</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="metric-dot yellow"></span>
            <span>Campaigns {formatCurrency(campaignRevenue)} ({campaignPct}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="metric-dot green"></span>
            <span>Flows {formatCurrency(flowRevenue)} ({flowPct}%)</span>
          </div>
        </div>
        <div className="revenue-bar" style={{ marginTop: 12 }}>
          <div className="segment" style={{ width: `${campaignPct}%`, background: 'var(--accent-yellow)' }}></div>
          <div className="segment" style={{ width: `${flowPct}%`, background: 'var(--accent-green)' }}></div>
        </div>
      </div>

      {/* Top Performing Flows */}
      <div className="card">
        <div className="card-title">Top performing flows</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Flow name</th>
              <th>Status</th>
              <th>Channel</th>
              <th>Delivered</th>
              <th>Revenue</th>
              <th>Conversions</th>
            </tr>
          </thead>
          <tbody>
            {liveFlows
              .sort((a, b) => b.stats.revenue - a.stats.revenue)
              .slice(0, 6)
              .map(flow => (
                <tr key={flow.id}>
                  <td><span className="clickable" onClick={() => navigate(appendQuery(`/flows/${flow.id}`))}>{flow.name}</span></td>
                  <td><span className={`badge badge-${flow.status}`}>{flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}</span></td>
                  <td>
                    {flow.actions.some(a => a.type === 'send_email') && <span className="channel-icon" title="Email">&#9993;</span>}
                    {flow.actions.some(a => a.type === 'send_sms') && <span className="channel-icon" title="SMS">&#128241;</span>}
                  </td>
                  <td>{flow.stats.delivered.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatCurrency(flow.stats.revenue)}</td>
                  <td>{flow.stats.conversions.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12 }}>
          <a href="#" onClick={e => { e.preventDefault(); navigate(appendQuery('/flows')); }} style={{ fontSize: 13 }}>View all flows</a>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="card">
        <div className="card-title">Recent campaigns</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign name</th>
              <th>Send date</th>
              <th>Channel</th>
              <th>Open rate</th>
              <th>Click rate</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sentCampaigns
              .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
              .slice(0, 8)
              .map(camp => (
                <tr key={camp.id}>
                  <td><span className="clickable" onClick={() => navigate(appendQuery(`/campaigns/${camp.id}`))}>{camp.name}</span></td>
                  <td className="text-muted">{new Date(camp.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>{camp.channel === 'email' ? <span className="channel-icon" title="Email">&#9993;</span> : <span className="channel-icon" title="SMS">&#128241;</span>}</td>
                  <td>{camp.stats.openRate > 0 ? formatPercent(camp.stats.openRate) : <span className="text-muted">--</span>}</td>
                  <td>{camp.stats.clickRate > 0 ? formatPercent(camp.stats.clickRate) : <span className="text-muted">--</span>}</td>
                  <td style={{ color: camp.stats.revenue > 0 ? 'var(--accent-green)' : 'inherit', fontWeight: camp.stats.revenue > 0 ? 600 : 400 }}>
                    {camp.stats.revenue > 0 ? formatCurrency(camp.stats.revenue) : <span className="text-muted">--</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12 }}>
          <a href="#" onClick={e => { e.preventDefault(); navigate(appendQuery('/campaigns')); }} style={{ fontSize: 13 }}>View all campaigns</a>
        </div>
      </div>
    </div>
  );
}
