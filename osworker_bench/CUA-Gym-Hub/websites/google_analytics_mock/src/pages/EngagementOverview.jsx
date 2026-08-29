import { useAppContext } from '../context/AppContext';
import { formatNumber } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function EngagementOverview() {
  const { state, getAggregatedMetrics, getDailyArray } = useAppContext();
  const dr = state.selectedDateRange;
  const metrics = getAggregatedMetrics(dr.startDate, dr.endDate);
  const dailyData = getDailyArray(dr.startDate, dr.endDate);

  const eventData = state.events.slice(0, 10).map(e => ({ name: e.name, count: e.count }));
  const pageData = state.pages.slice(0, 10).map(p => ({ name: p.pagePath, views: p.views }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Engagement overview</h1>
        <DateRangeButton />
      </div>

      <div className="comparison-bar">
        <div className="comparison-pill"><span className="dot" /> All Users</div>
        <div className="add-comparison-btn">+ Add comparison</div>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <div className="card-title">Users</div>
          <div className="kpi-value">{formatNumber(metrics.users)}</div>
          <div style={{ height: 150, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                <XAxis dataKey="date" tick={false} />
                <YAxis fontSize={11} tick={{ fill: '#5f6368' }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#1a73e8" strokeWidth={2} dot={false} name="Users" />
                <Line type="monotone" dataKey="newUsers" stroke="#202124" strokeWidth={1.5} dot={false} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title">User activity over time</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div style={{ padding: '4px 8px', background: '#e8f0fe', borderRadius: 4, fontSize: 12 }}>
              <span style={{ color: '#5f6368' }}>30 DAYS: </span>
              <span style={{ fontWeight: 500 }}>{formatNumber(metrics.users)}</span>
            </div>
          </div>
          <div style={{ height: 150, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                <XAxis dataKey="date" tick={false} />
                <YAxis fontSize={11} tick={{ fill: '#5f6368' }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#1a73e8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-grid-2">
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">EVENT COUNT BY EVENT NAME</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={eventData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5f6368' }} />
              <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: '#5f6368' }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a73e8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">VIEWS BY PAGE TITLE</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5f6368' }} />
              <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: '#5f6368' }} width={120} />
              <Tooltip />
              <Bar dataKey="views" fill="#1a73e8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
