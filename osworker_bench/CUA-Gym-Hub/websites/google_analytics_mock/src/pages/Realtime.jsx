import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Realtime() {
  const { state } = useAppContext();
  const rt = state.realtimeData;
  const [countryDim, setCountryDim] = useState('country');

  const barData = rt.usersPerMinute.map((v, i) => ({ minute: `${30 - i}m`, users: v }));

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Realtime</h1>

      {/* Big count */}
      <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 24 }}>
        <div className="card-title">USERS IN LAST 30 MINUTES</div>
        <div style={{ fontFamily: 'var(--ga-font-heading)', fontSize: 48, fontWeight: 500 }}>
          {rt.activeUsers}
        </div>
      </div>

      {/* Users per minute bar chart */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="card-title">USERS PER MINUTE</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={barData}>
            <XAxis dataKey="minute" tick={false} axisLine={false} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="users" fill="#1a73e8" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown cards */}
      <div className="card-grid-2">
        {/* By Source */}
        <div className="card">
          <div className="card-title">USERS BY FIRST USER SOURCE</div>
          {rt.bySource.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 13 }}>{s.source}</div>
              <div style={{ width: 100 }}>
                <div style={{ height: 12, background: '#e8f0fe', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.users / rt.activeUsers) * 100}%`, background: '#1a73e8', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ width: 30, textAlign: 'right', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{s.users}</div>
            </div>
          ))}
        </div>

        {/* By Page */}
        <div className="card">
          <div className="card-title">USERS BY PAGE TITLE AND SCREEN NAME</div>
          {rt.byPage.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 13 }}>{p.pageTitle}</div>
              <div style={{ width: 100 }}>
                <div style={{ height: 12, background: '#e8f0fe', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.users / rt.activeUsers) * 100}%`, background: '#1a73e8', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ width: 30, textAlign: 'right', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{p.users}</div>
            </div>
          ))}
        </div>

        {/* By Country */}
        <div className="card">
          <div className="card-title">
            USERS BY COUNTRY
          </div>
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Country</th>
                <th className="numeric">Users</th>
              </tr>
            </thead>
            <tbody>
              {rt.byCountry.map((c, i) => (
                <tr key={i}>
                  <td>{c.country}</td>
                  <td className="numeric">{c.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By Device */}
        <div className="card">
          <div className="card-title">USERS BY DEVICE CATEGORY</div>
          {rt.byDevice.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 13 }}>{d.device}</div>
              <div style={{ width: 100 }}>
                <div style={{ height: 12, background: '#e8f0fe', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.users / rt.activeUsers) * 100}%`, background: '#1a73e8', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ width: 30, textAlign: 'right', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{d.users}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
