import { useApp } from '../context/AppContext';
import './AccountOverviewPage.css';

function formatCurrency(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatNum(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function MiniSparkline({ values, color }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 80;
    const y = 20 - (v / max) * 18;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="80" height="24" viewBox="0 0 80 24">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
}

function DailySpendChart({ campaigns, dateRange }) {
  // Generate 7-30 days of mock daily spend
  const days = dateRange === 'last_30_days' ? 30 : dateRange === 'last_14_days' ? 14 : 7;
  const totalSpend = campaigns.filter(c => c.status !== 'deleted').reduce((s, c) => s + (c.amountSpent || 0), 0);
  const avgDay = totalSpend / days;
  const data = Array.from({ length: days }, (_, i) => {
    const variation = 0.7 + Math.random() * 0.6;
    return Math.max(0, avgDay * variation);
  });
  const max = Math.max(...data, 1);
  const w = 700, h = 200;
  const padL = 56, padR = 16, padT = 12, padB = 36;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const points = data.map((v, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + chartH - (v / max) * chartH;
    return { x, y, v };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillD = pathD + ` L${points[points.length - 1].x.toFixed(1)},${(padT + chartH).toFixed(1)} L${padL},${(padT + chartH).toFixed(1)} Z`;

  const labelStep = Math.max(1, Math.floor(data.length / 7));

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="daily-chart">
      <defs>
        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0866FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0866FF" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Y axis */}
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = padT + chartH - r * chartH;
        const val = r * max;
        return (
          <g key={r}>
            <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="#E4E6EB" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#65676B">
              ${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={fillD} fill="url(#spendGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#0866FF" strokeWidth="2" />
      {/* Dots */}
      {points.filter((_, i) => i % labelStep === 0 || i === points.length - 1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#0866FF" />
      ))}
      {/* X axis labels */}
      {data.map((_, i) => {
        if (i % labelStep !== 0 && i !== data.length - 1) return null;
        const x = points[i].x;
        const date = new Date();
        date.setDate(date.getDate() - (data.length - 1 - i));
        return (
          <text key={i} x={x} y={h - 8} textAnchor="middle" fontSize="10" fill="#65676B">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        );
      })}
    </svg>
  );
}

export default function AccountOverviewPage() {
  const { state } = useApp();
  const activeCampaigns = state.campaigns.filter(c => c.status !== 'deleted');
  const totals = {
    amountSpent: activeCampaigns.reduce((s, c) => s + (c.amountSpent || 0), 0),
    reach: activeCampaigns.reduce((s, c) => s + (c.reach || 0), 0),
    impressions: activeCampaigns.reduce((s, c) => s + (c.impressions || 0), 0),
    results: activeCampaigns.reduce((s, c) => s + (c.results || 0), 0),
  };

  // Sparkline data (random but seeded by metric)
  const sparkSpend = Array.from({ length: 7 }, () => totals.amountSpent / 7 * (0.7 + Math.random() * 0.6));
  const sparkReach = Array.from({ length: 7 }, () => totals.reach / 7 * (0.8 + Math.random() * 0.4));
  const sparkImp = Array.from({ length: 7 }, () => totals.impressions / 7 * (0.75 + Math.random() * 0.5));
  const sparkRes = Array.from({ length: 7 }, () => totals.results / 7 * (0.8 + Math.random() * 0.4));

  const metricCards = [
    { label: 'Amount Spent', value: formatCurrency(totals.amountSpent), trend: '+12%', spark: sparkSpend, color: '#0866FF' },
    { label: 'Reach', value: formatNum(totals.reach), trend: '+8%', spark: sparkReach, color: '#31A24C' },
    { label: 'Impressions', value: formatNum(totals.impressions), trend: '+15%', spark: sparkImp, color: '#9360F7' },
    { label: 'Results', value: formatNum(totals.results), trend: '+5%', spark: sparkRes, color: '#FB724B' },
  ];

  const topCampaigns = [...activeCampaigns]
    .filter(c => c.amountSpent > 0)
    .sort((a, b) => (b.amountSpent || 0) - (a.amountSpent || 0))
    .slice(0, 5);

  return (
    <div className="overview-page">
      <h2 className="overview-title">Account Overview</h2>
      <p className="overview-subtitle">{state.account.name} &middot; {state.account.id}</p>

      {/* Metric cards */}
      <div className="metric-cards">
        {metricCards.map(card => (
          <div key={card.label} className="metric-card">
            <div className="metric-card-header">
              <span className="metric-label">{card.label}</span>
              <span className="metric-trend">{card.trend} vs last period</span>
            </div>
            <div className="metric-value">{card.value}</div>
            <div className="metric-spark">
              <MiniSparkline values={card.spark} color={card.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Daily spend chart */}
      <div className="overview-card">
        <div className="overview-card-header">
          <span className="overview-card-title">Daily Spend</span>
          <span className="overview-card-subtitle">Last 7 days</span>
        </div>
        <div className="chart-container">
          <DailySpendChart campaigns={activeCampaigns} dateRange={state.selectedDateRange} />
        </div>
      </div>

      {/* Top campaigns table */}
      <div className="overview-card">
        <div className="overview-card-header">
          <span className="overview-card-title">Top Campaigns by Spend</span>
        </div>
        <table className="overview-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Objective</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount Spent</th>
              <th style={{ textAlign: 'right' }}>Results</th>
              <th style={{ textAlign: 'right' }}>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {topCampaigns.map(c => (
              <tr key={c.id}>
                <td className="overview-camp-name">{c.name}</td>
                <td style={{ textTransform: 'capitalize' }}>{c.objective.replace(/_/g, ' ')}</td>
                <td>
                  <span className={`status-pill status-pill--${c.status}`}>
                    {c.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(c.amountSpent)}</td>
                <td style={{ textAlign: 'right' }}>{formatNum(c.results)}</td>
                <td style={{ textAlign: 'right' }}>{c.roas ? c.roas.toFixed(2) + 'x' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
