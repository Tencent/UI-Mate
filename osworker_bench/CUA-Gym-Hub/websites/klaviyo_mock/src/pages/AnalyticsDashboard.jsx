import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const formatCurrency = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const formatPercent = (n) => (n * 100).toFixed(1) + '%';

const getQualityBadge = (rate, thresholds) => {
  if (rate >= thresholds[0]) return { label: 'Excellent', cls: 'excellent' };
  if (rate >= thresholds[1]) return { label: 'Good', cls: 'good' };
  return { label: 'Needs Improvement', cls: 'needs-improvement' };
};

export default function AnalyticsDashboard() {
  const { state, updateUI } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;
  const [dateRange, setDateRange] = useState(state.ui.analyticsDateRange.label || 'Last 30 days');
  const [activeView, setActiveView] = useState('overview');

  const sentCampaigns = state.campaigns.filter(c => c.status === 'sent');
  const liveFlows = state.flows.filter(f => f.status === 'live');

  const totalCampaignRecipients = sentCampaigns.reduce((s, c) => s + c.stats.recipients, 0);
  const totalCampaignRevenue = sentCampaigns.reduce((s, c) => s + c.stats.revenue, 0);
  const avgOpenRate = sentCampaigns.length > 0 ? sentCampaigns.filter(c => c.stats.openRate > 0).reduce((s, c) => s + c.stats.openRate, 0) / sentCampaigns.filter(c => c.stats.openRate > 0).length : 0;
  const avgClickRate = sentCampaigns.length > 0 ? sentCampaigns.filter(c => c.stats.clickRate > 0).reduce((s, c) => s + c.stats.clickRate, 0) / sentCampaigns.filter(c => c.stats.clickRate > 0).length : 0;
  const avgConvRate = sentCampaigns.length > 0 ? sentCampaigns.filter(c => c.stats.conversionRate > 0).reduce((s, c) => s + c.stats.conversionRate, 0) / sentCampaigns.filter(c => c.stats.conversionRate > 0).length : 0;

  const totalFlowRecipients = liveFlows.reduce((s, f) => s + f.stats.delivered, 0);
  const totalFlowRevenue = liveFlows.reduce((s, f) => s + f.stats.revenue, 0);
  const totalFlowConversions = liveFlows.reduce((s, f) => s + f.stats.conversions, 0);

  // Email health metrics
  const totalBounced = sentCampaigns.reduce((s, c) => s + c.stats.bounced, 0);
  const totalDelivered = sentCampaigns.reduce((s, c) => s + c.stats.delivered, 0);
  const totalUnsub = sentCampaigns.reduce((s, c) => s + c.stats.unsubscribed, 0);
  const totalSpam = sentCampaigns.reduce((s, c) => s + c.stats.spamComplaints, 0);
  const bounceRate = totalCampaignRecipients > 0 ? (totalBounced / totalCampaignRecipients) : 0;
  const unsubRate = totalDelivered > 0 ? (totalUnsub / totalDelivered) : 0;
  const spamRate = totalDelivered > 0 ? (totalSpam / totalDelivered) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Overview dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="tabs" style={{ border: 'none', margin: 0 }}>
            {['overview', 'campaigns', 'flows'].map(v => (
              <button key={v} className={`tab ${activeView === v ? 'active' : ''}`} onClick={() => setActiveView(v)} style={{ paddingBottom: 6 }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <select className="date-range-select" value={dateRange} onChange={e => { setDateRange(e.target.value); updateUI({ analyticsDateRange: { ...state.ui.analyticsDateRange, label: e.target.value } }); }}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 180 days</option>
          </select>
        </div>
      </div>

      {(activeView === 'overview' || activeView === 'campaigns') && (
        <>
          {/* Campaign Performance */}
          <div className="card">
            <div className="card-title">Campaign Performance</div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{totalCampaignRecipients.toLocaleString()}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Recipients</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-green)' }}>{formatCurrency(totalCampaignRevenue)}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Revenue</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{formatPercent(avgOpenRate)}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Avg Open Rate</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{formatPercent(avgClickRate)}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Avg Click Rate</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Open rate', value: avgOpenRate, thresholds: [0.40, 0.25], change: '+2.1%', dot: 'blue' },
              { label: 'Click rate', value: avgClickRate, thresholds: [0.05, 0.02], change: '-0.3%', dot: 'green' },
              { label: 'Conversion rate', value: avgConvRate, thresholds: [0.02, 0.005], change: '+0.5%', dot: 'yellow' }
            ].map(m => {
              const badge = getQualityBadge(m.value, m.thresholds);
              return (
                <div key={m.label} className="card" style={{ padding: '14px 20px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`metric-dot ${m.dot}`}></span>
                  <span style={{ width: 140 }}>{m.label}</span>
                  <span className={`quality-badge ${badge.cls}`}>{badge.label}</span>
                  <span style={{ fontWeight: 600, marginLeft: 'auto' }}>{formatPercent(m.value)}</span>
                  <span className={`change-badge ${m.change.startsWith('+') ? 'positive' : 'negative'}`}>{m.change}</span>
                </div>
              );
            })}
          </div>

          {/* Campaign Detail Table */}
          <div className="card">
            <div className="card-title">Campaign Performance Detail</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Delivered</th>
                  <th>Opens</th>
                  <th>Clicks</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sentCampaigns.map(c => (
                  <tr key={c.id}>
                    <td><span className="clickable" onClick={() => navigate(appendQuery(`/campaigns/${c.id}`))}>{c.name}</span></td>
                    <td>{c.stats.delivered.toLocaleString()}</td>
                    <td>{c.stats.opens.toLocaleString()}</td>
                    <td>{c.stats.clicks.toLocaleString()}</td>
                    <td>{c.stats.ordersPlaced}</td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatCurrency(c.stats.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(activeView === 'overview' || activeView === 'flows') && (
        <>
          {/* Flows Performance */}
          <div className="card">
            <div className="card-title">Flows Performance</div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{totalFlowRecipients.toLocaleString()}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Delivered</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-green)' }}>{formatCurrency(totalFlowRevenue)}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Revenue</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{totalFlowConversions.toLocaleString()}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Conversions</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{liveFlows.length}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Active Flows</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Flows Performance Detail</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Flow Name</th>
                  <th>Delivered</th>
                  <th>Opens</th>
                  <th>Clicks</th>
                  <th>Conversions</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {liveFlows.map(f => (
                  <tr key={f.id}>
                    <td><span className="clickable" onClick={() => navigate(appendQuery(`/flows/${f.id}`))}>{f.name}</span></td>
                    <td>{f.stats.delivered.toLocaleString()}</td>
                    <td>{f.stats.opens.toLocaleString()}</td>
                    <td>{f.stats.clicks.toLocaleString()}</td>
                    <td>{f.stats.conversions}</td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatCurrency(f.stats.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeView === 'overview' && (
        <div className="card">
          <div className="card-title">Email Deliverability</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: bounceRate > 0.03 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{formatPercent(bounceRate)}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>Bounce rate</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(bounceRate * 100 * 10, 100)}%`, height: '100%', background: bounceRate > 0.03 ? 'var(--accent-red)' : 'var(--accent-green)', borderRadius: 2 }}></div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: spamRate > 0.001 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{formatPercent(spamRate)}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>Spam complaint rate</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(spamRate * 100 * 100, 100)}%`, height: '100%', background: spamRate > 0.001 ? 'var(--accent-red)' : 'var(--accent-green)', borderRadius: 2 }}></div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: unsubRate > 0.005 ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>{formatPercent(unsubRate)}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>Unsubscribe rate</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(unsubRate * 100 * 20, 100)}%`, height: '100%', background: unsubRate > 0.005 ? 'var(--accent-yellow)' : 'var(--accent-green)', borderRadius: 2 }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
