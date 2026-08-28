import { useAppContext } from '../context/AppContext';
import { formatNumber } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState } from 'react';

export default function AcquisitionOverview() {
  const { state, getAggregatedMetrics, getDailyArray } = useAppContext();
  const dr = state.selectedDateRange;
  const metrics = getAggregatedMetrics(dr.startDate, dr.endDate);
  const dailyData = getDailyArray(dr.startDate, dr.endDate);
  const [dimension, setDimension] = useState('channelGroup');

  // Aggregate by channel
  const channelData = state.trafficSources.reduce((acc, src) => {
    const key = src[dimension === 'channelGroup' ? 'channelGroup' : dimension === 'source' ? 'source' : 'medium'];
    if (!acc[key]) acc[key] = { name: key, users: 0, sessions: 0 };
    acc[key].users += src.users;
    acc[key].sessions += src.sessions;
    return acc;
  }, {});
  const channelArr = Object.values(channelData).sort((a, b) => b.users - a.users);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Acquisition overview</h1>
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
                <Line type="monotone" dataKey="users" stroke="#1a73e8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Sessions</div>
          <div className="kpi-value">{formatNumber(metrics.sessions)}</div>
          <div style={{ height: 150, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                <XAxis dataKey="date" tick={false} />
                <YAxis fontSize={11} tick={{ fill: '#5f6368' }} />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#1a73e8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0 }}>USERS BY</div>
          <select
            value={dimension}
            onChange={e => setDimension(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #dadce0', borderRadius: 4, fontSize: 13 }}
          >
            <option value="channelGroup">Default channel group</option>
            <option value="source">Source</option>
            <option value="medium">Medium</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={channelArr}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
            <XAxis dataKey="name" fontSize={11} tick={{ fill: '#5f6368' }} angle={-20} textAnchor="end" height={60} />
            <YAxis fontSize={11} tick={{ fill: '#5f6368' }} />
            <Tooltip />
            <Bar dataKey="users" fill="#1a73e8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
