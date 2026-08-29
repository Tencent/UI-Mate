import { useAppContext } from '../context/AppContext';
import { formatNumber, formatPercent } from '../utils/dataManager';
import { DateRangeButton } from '../components/DateRangePicker';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9334e6', '#e37400', '#00bcd4', '#ff6d00'];

export default function DemographicsOverview() {
  const { state } = useAppContext();
  const countries = state.countries.slice(0, 5);
  const languages = state.languages;
  const ageBrackets = state.ageBrackets;
  const genders = state.genders;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Demographics overview</h1>
        <DateRangeButton />
      </div>

      {/* Country */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="card-title">COUNTRY</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={countries} dataKey="users" nameKey="country" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {countries.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <table className="data-table" style={{ flex: 1 }}>
            <thead>
              <tr>
                <th>Country</th>
                <th className="numeric">Users</th>
              </tr>
            </thead>
            <tbody>
              {state.countries.map((c, i) => (
                <tr key={i}>
                  <td>{c.country}</td>
                  <td className="numeric">{formatNumber(c.users)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* City */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="card-title">CITY</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>City</th>
              <th>Country</th>
              <th className="numeric">Users</th>
            </tr>
          </thead>
          <tbody>
            {state.cities.slice(0, 10).map((c, i) => (
              <tr key={i}>
                <td>{c.city}</td>
                <td>{c.country}</td>
                <td className="numeric">{formatNumber(c.users)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-grid-2">
        {/* Language */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">LANGUAGE</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={languages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5f6368' }} />
              <YAxis type="category" dataKey="language" fontSize={11} tick={{ fill: '#5f6368' }} width={80} />
              <Tooltip />
              <Bar dataKey="users" fill="#1a73e8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">AGE</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ageBrackets} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5f6368' }} />
              <YAxis type="category" dataKey="bracket" fontSize={11} tick={{ fill: '#5f6368' }} width={60} />
              <Tooltip />
              <Bar dataKey="users" fill="#1a73e8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender */}
      <div className="card" style={{ padding: 20 }}>
        <div className="card-title">GENDER</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genders} dataKey="users" nameKey="gender" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {genders.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            {genders.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i] }} />
                <span style={{ textTransform: 'capitalize' }}>{g.gender}</span>
                <span style={{ color: '#5f6368' }}>{formatPercent(g.percentage)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
