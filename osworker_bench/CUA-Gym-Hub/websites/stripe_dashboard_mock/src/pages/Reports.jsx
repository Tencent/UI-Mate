import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';

export default function Reports() {
  const { state } = useAppState();
  const { metrics } = state;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Gross volume</div></div>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{formatCurrency(metrics.summary.grossVolume.amount)}</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData.grossVolume}>
                <defs>
                  <linearGradient id="rptGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#635BFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#635BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 100).toFixed(0)}`} width={60} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Volume']} />
                <Area type="monotone" dataKey="amount" stroke="#635BFF" strokeWidth={2} fill="url(#rptGross)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Net volume from sales</div></div>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{formatCurrency(metrics.summary.netVolume.amount)}</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData.netVolume}>
                <defs>
                  <linearGradient id="rptNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#30B130" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#30B130" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 100).toFixed(0)}`} width={60} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Net volume']} />
                <Area type="monotone" dataKey="amount" stroke="#30B130" strokeWidth={2} fill="url(#rptNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Key metrics</div></div>
        <div className="kv-list">
          <div className="kv-row">
            <span className="kv-label">Total payments</span>
            <span className="kv-value">{state.payments.length}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Successful payments</span>
            <span className="kv-value">{state.payments.filter(p => p.status === 'succeeded').length}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Success rate</span>
            <span className="kv-value">
              {state.payments.length > 0 ? ((state.payments.filter(p => p.status === 'succeeded').length / state.payments.length) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Active subscriptions</span>
            <span className="kv-value">{state.subscriptions.filter(s => s.status === 'active').length}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Total customers</span>
            <span className="kv-value">{state.customers.length}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Dispute rate</span>
            <span className="kv-value">{metrics.summary.disputeActivity.rate}%</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Open disputes</span>
            <span className="kv-value">{state.disputes.filter(d => d.status === 'needs_response' || d.status === 'under_review').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
