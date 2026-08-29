import { useAppContext } from '../context/AppContext';
import { formatNumber } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RetentionReport() {
  const { state, getDailyArray } = useAppContext();
  const dr = state.selectedDateRange;
  const dailyData = getDailyArray(dr.startDate, dr.endDate);
  const cohorts = state.retentionCohorts;

  const chartData = dailyData.map(d => ({
    date: d.date,
    newUsers: d.newUsers,
    returningUsers: d.returningUsers
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Retention</h1>
        <DateRangeButton />
      </div>

      {/* New vs Returning */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="card-title">NEW VS RETURNING USERS</div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
            <XAxis dataKey="date" tick={false} />
            <YAxis fontSize={11} tick={{ fill: '#5f6368' }} />
            <Tooltip />
            <Line type="monotone" dataKey="newUsers" stroke="#1a73e8" strokeWidth={2} dot={false} name="New users" />
            <Line type="monotone" dataKey="returningUsers" stroke="#34a853" strokeWidth={2} dot={false} name="Returning users" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#5f6368', marginTop: 8 }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 2, background: '#1a73e8', marginRight: 4, verticalAlign: 'middle' }} />New users</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 2, background: '#34a853', marginRight: 4, verticalAlign: 'middle' }} />Returning users</span>
        </div>
      </div>

      {/* Cohort Retention Heatmap */}
      <div className="card" style={{ padding: 20, overflowX: 'auto' }}>
        <div className="card-title">USER RETENTION BY COHORT</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cohort</th>
              <th className="numeric">Users</th>
              <th className="numeric">Week 0</th>
              <th className="numeric">Week 1</th>
              <th className="numeric">Week 2</th>
              <th className="numeric">Week 3</th>
              <th className="numeric">Week 4</th>
              <th className="numeric">Week 5</th>
              <th className="numeric">Week 6</th>
              <th className="numeric">Week 7</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, i) => {
              const start = new Date(cohort.cohortDate);
              const end = new Date(start);
              end.setDate(end.getDate() + 6);
              const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

              return (
                <tr key={i}>
                  <td>{label}</td>
                  <td className="numeric">{formatNumber(cohort.cohortSize)}</td>
                  {cohort.retention.map((r, j) => {
                    if (r === null) return <td key={j} className="numeric heat" style={{ background: '#f8f9fa' }}>-</td>;
                    const pct = (r * 100).toFixed(1) + '%';
                    const intensity = Math.round(r * 200);
                    const bg = `rgba(26, 115, 232, ${r * 0.5})`;
                    return (
                      <td key={j} className="numeric heat" style={{ background: bg, color: r > 0.3 ? '#fff' : '#202124' }}>
                        {pct}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
