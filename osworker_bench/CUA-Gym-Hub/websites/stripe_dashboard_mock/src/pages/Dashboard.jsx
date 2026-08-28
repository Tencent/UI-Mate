import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';

export default function Dashboard() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const { metrics, balance } = state;

  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Today</h2>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{todayDate}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 32, marginBottom: 12 }}>
              <div>
                <div className="metric-label">Gross volume</div>
                <div className="metric-value" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(metrics.today.grossVolume)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.today.grossVolumeChart}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#635BFF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#635BFF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#A3ACB9' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 11, fill: '#A3ACB9' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} width={60} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E3E8EE', borderRadius: 8, fontSize: 13 }}
                    formatter={(value) => [formatCurrency(value), 'Volume']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#635BFF" strokeWidth={2} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="metric-label">Balance</div>
              <div className="metric-value" style={{ color: 'var(--color-success)' }}>
                {formatCurrency(balance.available)}
              </div>
              <div className="metric-secondary">Available to pay out</div>
              <div className="metric-link" onClick={() => navigate('/balances')}>View detail →</div>
            </div>
            <div className="card">
              <div className="metric-label">Payouts</div>
              <div className="metric-value" style={{ color: 'var(--color-primary)' }}>
                {formatCurrency(balance.pending)}
              </div>
              <div className="metric-secondary">Expected today</div>
              <div className="metric-link" onClick={() => navigate('/balances')}>View detail →</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Reports summary</h3>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Last 4 weeks</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <SummaryCard
            label="Gross volume"
            value={formatCurrency(metrics.summary.grossVolume.amount)}
            change={metrics.summary.grossVolume.change}
            compareValue={formatCurrency(metrics.summary.grossVolume.previousAmount)}
            data={metrics.chartData.grossVolume}
            dataKey="amount"
          />
          <SummaryCard
            label="Net volume from sales"
            value={formatCurrency(metrics.summary.netVolume.amount)}
            change={metrics.summary.netVolume.change}
            compareValue={formatCurrency(metrics.summary.netVolume.previousAmount)}
            data={metrics.chartData.netVolume}
            dataKey="amount"
          />
          <SummaryCard
            label="Dispute activity"
            value={`${metrics.summary.disputeActivity.rate}%`}
            change={metrics.summary.disputeActivity.change}
            compareValue={`${metrics.summary.disputeActivity.previousRate}%`}
            data={metrics.chartData.disputeRate}
            dataKey="rate"
            invertColor
          />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, change, compareValue, data, dataKey, invertColor }) {
  const isPositive = invertColor ? change < 0 : change > 0;
  const gradientId = `spark_${label.replace(/\s/g, '')}`;
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
        <span className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        {compareValue}
      </div>
      <div style={{ height: 60 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#635BFF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#635BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey={dataKey} stroke="#635BFF" strokeWidth={1.5} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
