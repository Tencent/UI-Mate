import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Benchmarks() {
  const { state } = useAppContext();
  const [industry, setIndustry] = useState('E-commerce');

  const sentCampaigns = state.campaigns.filter(c => c.status === 'sent' && c.channel === 'email');
  const yourOpenRate = sentCampaigns.filter(c => c.stats.openRate > 0).reduce((s, c) => s + c.stats.openRate, 0) / (sentCampaigns.filter(c => c.stats.openRate > 0).length || 1);
  const yourClickRate = sentCampaigns.filter(c => c.stats.clickRate > 0).reduce((s, c) => s + c.stats.clickRate, 0) / (sentCampaigns.filter(c => c.stats.clickRate > 0).length || 1);
  const totalDelivered = sentCampaigns.reduce((s, c) => s + c.stats.delivered, 0);
  const totalUnsub = sentCampaigns.reduce((s, c) => s + c.stats.unsubscribed, 0);
  const yourUnsubRate = totalDelivered > 0 ? totalUnsub / totalDelivered : 0;
  const totalRevenue = sentCampaigns.reduce((s, c) => s + c.stats.revenue, 0);
  const totalRecipients = sentCampaigns.reduce((s, c) => s + c.stats.recipients, 0);
  const rpe = totalRecipients > 0 ? totalRevenue / totalRecipients : 0;

  const benchmarkData = [
    { metric: 'Open Rate', yours: yourOpenRate, avg: 0.3200, rating: yourOpenRate >= 0.35 ? 'excellent' : yourOpenRate >= 0.25 ? 'good' : 'needs-improvement' },
    { metric: 'Click Rate', yours: yourClickRate, avg: 0.0350, rating: yourClickRate >= 0.04 ? 'excellent' : yourClickRate >= 0.02 ? 'good' : 'needs-improvement' },
    { metric: 'Unsubscribe Rate', yours: yourUnsubRate, avg: 0.0040, rating: yourUnsubRate <= 0.003 ? 'excellent' : yourUnsubRate <= 0.005 ? 'good' : 'needs-improvement' },
    { metric: 'Revenue per Email', yours: rpe, avg: 0.22, rating: rpe >= 0.30 ? 'excellent' : rpe >= 0.15 ? 'good' : 'needs-improvement' },
  ];

  const formatPercent = (n) => (n * 100).toFixed(2) + '%';
  const formatCurrency = (n) => '$' + n.toFixed(2);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Benchmarks</h1>
        <select className="date-range-select" value={industry} onChange={e => setIndustry(e.target.value)}>
          <option>E-commerce</option>
          <option>SaaS</option>
          <option>Retail</option>
          <option>Healthcare</option>
          <option>Education</option>
          <option>Non-profit</option>
        </select>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>Comparing your metrics against</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{industry} industry averages</div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Your Performance</th>
              <th>Industry Average</th>
              <th>Rating</th>
              <th>Comparison</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkData.map(b => {
              const isRate = b.metric !== 'Revenue per Email';
              const isLowerBetter = b.metric === 'Unsubscribe Rate';
              const yours = isRate ? formatPercent(b.yours) : formatCurrency(b.yours);
              const avg = isRate ? formatPercent(b.avg) : formatCurrency(b.avg);
              const pct = ((b.yours / b.avg) * 100).toFixed(0);
              return (
                <tr key={b.metric}>
                  <td style={{ fontWeight: 500 }}>{b.metric}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{yours}</td>
                  <td className="text-muted">{avg}</td>
                  <td><span className={`quality-badge ${b.rating}`}>{b.rating === 'needs-improvement' ? 'Needs Improvement' : b.rating.charAt(0).toUpperCase() + b.rating.slice(1)}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 120, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(isLowerBetter ? (b.avg / b.yours) * 100 : pct, 100)}%`, height: '100%', background: b.rating === 'excellent' ? 'var(--accent-blue)' : b.rating === 'good' ? 'var(--accent-green)' : 'var(--accent-red)', borderRadius: 4, transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ fontSize: 12, color: b.rating === 'needs-improvement' ? 'var(--accent-red)' : 'var(--accent-green)' }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
