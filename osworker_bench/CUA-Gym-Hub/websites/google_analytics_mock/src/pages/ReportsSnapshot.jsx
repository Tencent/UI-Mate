import { useAppContext } from '../context/AppContext';
import { formatNumber, formatDuration, formatPercent, formatCurrency } from '../utils/dataManager';
import { Link, useSearchParams } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { DateRangeButton } from '../components/DateRangePicker';

export default function ReportsSnapshot() {
  const { state, getAggregatedMetrics, getDailyArray } = useAppContext();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? `?${qs}` : '';
  const dr = state.selectedDateRange;
  const metrics = getAggregatedMetrics(dr.startDate, dr.endDate);
  const dailyData = getDailyArray(dr.startDate, dr.endDate);

  // Calc preceding period
  const dayCount = dailyData.length;
  const prevEnd = new Date(dr.startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - dayCount + 1);
  const prevMetrics = getAggregatedMetrics(prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0]);

  const calcChange = (curr, prev) => {
    if (!prev || prev === 0) return 0;
    return ((curr - prev) / prev * 100);
  };

  const cards = [
    { label: 'Users', value: formatNumber(metrics.users), change: calcChange(metrics.users, prevMetrics?.users), dataKey: 'users', link: '/reports/engagement' },
    { label: 'New Users', value: formatNumber(metrics.newUsers), change: calcChange(metrics.newUsers, prevMetrics?.newUsers), dataKey: 'newUsers', link: '/reports/acquisition' },
    { label: 'Sessions', value: formatNumber(metrics.sessions), change: calcChange(metrics.sessions, prevMetrics?.sessions), dataKey: 'sessions', link: '/reports/acquisition' },
    { label: 'Engaged Sessions', value: formatNumber(metrics.engagedSessions), change: calcChange(metrics.engagedSessions, prevMetrics?.engagedSessions), dataKey: 'engagedSessions', link: '/reports/engagement' },
    { label: 'Avg. Engagement Time', value: formatDuration(metrics.avgEngagementTime), change: calcChange(metrics.avgEngagementTime, prevMetrics?.avgEngagementTime), dataKey: 'avgEngagementTime', link: '/reports/engagement' },
    { label: 'Event Count', value: formatNumber(metrics.eventCount), change: calcChange(metrics.eventCount, prevMetrics?.eventCount), dataKey: 'eventCount', link: '/reports/engagement/events' },
    { label: 'Conversions', value: formatNumber(metrics.conversions), change: calcChange(metrics.conversions, prevMetrics?.conversions), dataKey: 'conversions', link: '/reports/engagement/conversions' },
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), change: calcChange(metrics.totalRevenue, prevMetrics?.totalRevenue), dataKey: 'totalRevenue', link: '/reports/engagement' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports snapshot</h1>
        <DateRangeButton />
      </div>

      <div className="comparison-bar">
        <div className="comparison-pill"><span className="dot" /> All Users</div>
        <div className="add-comparison-btn">+ Add comparison</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {cards.map((card, i) => (
          <Link key={i} to={card.link + qsStr} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="kpi-card">
              <div className="kpi-label">{card.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="kpi-value" style={{ fontSize: 24 }}>{card.value}</div>
                  <div className={`kpi-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                    {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change).toFixed(1)}%
                  </div>
                </div>
                <div style={{ width: 120, height: 40 }}>
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={dailyData}>
                      <Line type="monotone" dataKey={card.dataKey} stroke="#1a73e8" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
