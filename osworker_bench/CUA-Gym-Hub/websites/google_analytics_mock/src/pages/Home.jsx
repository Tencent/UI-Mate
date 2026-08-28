import { useAppContext } from '../context/AppContext';
import { formatNumber, formatDuration } from '../utils/dataManager';
import { Link, useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Home() {
  const { state, getAggregatedMetrics, getDailyArray } = useAppContext();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? `?${qs}` : '';

  const dr = state.selectedDateRange;
  const metrics = getAggregatedMetrics(dr.startDate, dr.endDate);
  const dailyData = getDailyArray(dr.startDate, dr.endDate);
  const rt = state.realtimeData;

  // Calculate change vs preceding period
  const dayCount = dailyData.length;
  const prevEnd = new Date(dr.startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - dayCount + 1);
  const prevStartStr = prevStart.toISOString().split('T')[0];
  const prevEndStr = prevEnd.toISOString().split('T')[0];
  const prevMetrics = getAggregatedMetrics(prevStartStr, prevEndStr);

  const calcChange = (curr, prev) => {
    if (!prev || prev === 0) return 0;
    return ((curr - prev) / prev * 100);
  };

  const kpis = [
    {
      label: 'New users', value: formatNumber(metrics.newUsers),
      change: calcChange(metrics.newUsers, prevMetrics?.newUsers),
      sparkData: dailyData.map(d => d.newUsers)
    },
    {
      label: 'Average engagement time', value: formatDuration(metrics.avgEngagementTime),
      change: calcChange(metrics.avgEngagementTime, prevMetrics?.avgEngagementTime),
      sparkData: dailyData.map(d => d.avgEngagementTime)
    },
    {
      label: 'Conversions', value: formatNumber(metrics.conversions),
      change: calcChange(metrics.conversions, prevMetrics?.conversions),
      sparkData: dailyData.map(d => d.conversions)
    }
  ];

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Home</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {/* KPI Cards */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              {kpis.map((kpi, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#1a73e8' }}>{kpi.label}</span>
                    <span style={{ fontSize: 10, color: '#5f6368' }}>&#9662;</span>
                  </div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                    {kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                  <div style={{ height: 40, marginTop: 8 }}>
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={kpi.sparkData.map((v, idx) => ({ v, idx }))}>
                        <Line type="monotone" dataKey="v" stroke="#1a73e8" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Line Chart */}
          <div className="card" style={{ marginTop: 16, padding: 20 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                <XAxis dataKey="date" tickFormatter={d => { const dt = new Date(d); return `${dt.getDate()} ${dt.toLocaleString('en', { month: 'short' })}`; }} fontSize={11} tick={{ fill: '#5f6368' }} />
                <YAxis fontSize={11} tick={{ fill: '#5f6368' }} />
                <Tooltip labelFormatter={d => d} formatter={(v) => [formatNumber(v), 'Users']} />
                <Line type="monotone" dataKey="users" stroke="#1a73e8" strokeWidth={2} dot={false} name="Users" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ fontSize: 13, color: '#5f6368' }}>
                <span style={{ display: 'inline-block', width: 12, height: 2, background: '#1a73e8', marginRight: 6, verticalAlign: 'middle' }}></span>
                Last {dayCount} days
                {dr.compareEnabled && (
                  <span style={{ marginLeft: 16 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 2, background: '#1a73e8', marginRight: 6, verticalAlign: 'middle', opacity: 0.4, borderTop: '1px dashed #1a73e8' }}></span>
                    Preceding period
                  </span>
                )}
              </div>
              <Link to={`/reports/snapshot${qsStr}`} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                View reports snapshot →
              </Link>
            </div>
          </div>
        </div>

        {/* Realtime Widget */}
        <div style={{ width: 320, minWidth: 320 }}>
          <div className="card" style={{ padding: 16, height: '100%' }}>
            <div className="card-title">USERS IN LAST 30 MINUTES</div>
            <div style={{ fontFamily: 'var(--ga-font-heading)', fontSize: 36, fontWeight: 500, marginBottom: 12 }}>
              {rt.activeUsers}
            </div>
            <div className="card-title">USERS PER MINUTE</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 40, marginBottom: 16, gap: 1 }}>
              {rt.usersPerMinute.map((v, i) => (
                <div key={i} className="realtime-bar" style={{ height: `${(v / 7) * 40}px` }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#5f6368', textTransform: 'uppercase' }}>Country</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#5f6368', textTransform: 'uppercase' }}>Users</span>
            </div>
            {rt.byCountry.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                <span>{c.country}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.users}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <Link to={`/reports/realtime${qsStr}`} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                View realtime →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Accessed */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 400, marginBottom: 12, fontFamily: 'var(--ga-font-heading)' }}>Recently accessed</h2>
        {state.recentlyAccessed.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: '#5f6368' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            Reports and pages you recently visited will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
            {state.recentlyAccessed.slice(0, 6).map((item, i) => (
              <Link key={i} to={item.path + qsStr} className="card" style={{ minWidth: 180, padding: 16, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ color: '#1a73e8', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#5f6368' }}>
                  {new Date(item.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(item.timestamp).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
