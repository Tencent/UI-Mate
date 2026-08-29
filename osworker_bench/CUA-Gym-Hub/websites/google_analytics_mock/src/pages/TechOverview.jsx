import { useAppContext } from '../context/AppContext';
import { formatNumber, formatPercent } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9334e6', '#e37400'];

export default function TechOverview() {
  const { state } = useAppContext();
  const tech = state.techPlatforms;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tech overview</h1>
        <DateRangeButton />
      </div>

      {/* Platform / Device */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="card-title">DEVICE CATEGORY</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tech.devices} dataKey="users" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {tech.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            {tech.devices.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i] }} />
                <span style={{ textTransform: 'capitalize' }}>{d.category}</span>
                <span style={{ color: '#5f6368' }}>{formatPercent(d.percentage)} ({formatNumber(d.users)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-grid-2">
        {/* Browser */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">BROWSER</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tech.browsers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5f6368' }} />
              <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: '#5f6368' }} width={100} />
              <Tooltip />
              <Bar dataKey="users" fill="#1a73e8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* OS */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">OPERATING SYSTEM</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tech.operatingSystems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5f6368' }} />
              <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: '#5f6368' }} width={80} />
              <Tooltip />
              <Bar dataKey="users" fill="#1a73e8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Screen Resolution */}
      <div className="card" style={{ padding: 20 }}>
        <div className="card-title">SCREEN RESOLUTION</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Resolution</th>
              <th className="numeric">Users</th>
            </tr>
          </thead>
          <tbody>
            {tech.screenResolutions.map((r, i) => (
              <tr key={i}>
                <td>{r.resolution}</td>
                <td className="numeric">{formatNumber(r.users)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
