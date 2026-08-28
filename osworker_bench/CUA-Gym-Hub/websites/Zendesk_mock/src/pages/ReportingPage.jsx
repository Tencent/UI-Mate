import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';

const STATUS_COLORS = {
  new: '#4A90D9',
  open: '#E35B51',
  pending: '#3091EC',
  hold: '#2F3941',
  solved: '#87929D',
  closed: '#C2C8CC',
};

const PRIORITY_COLORS = {
  urgent: '#CC3340',
  high: '#ED6C38',
  normal: '#1F73B7',
  low: '#68737D',
};

export default function ReportingPage() {
  const { state } = useApp();

  const lineData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const created = state.tickets.filter(t => {
        const createdAt = new Date(t.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;
      const solved = state.tickets.filter(t => {
        if (t.status !== 'solved' && t.status !== 'closed') return false;
        const updatedAt = new Date(t.updated_at);
        return updatedAt >= dayStart && updatedAt <= dayEnd;
      }).length;
      days.push({ name: label, Created: created, Solved: solved });
    }
    return days;
  }, [state.tickets]);

  const statusData = useMemo(() => {
    const counts = {};
    state.tickets.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [state.tickets]);

  const priorityData = useMemo(() => {
    const counts = { urgent: 0, high: 0, normal: 0, low: 0 };
    state.tickets.forEach(t => {
      if (t.priority && counts[t.priority] !== undefined) {
        counts[t.priority]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: PRIORITY_COLORS[name],
    }));
  }, [state.tickets]);

  const agentData = useMemo(() => {
    return state.users.filter(u => u.role === 'agent').map(agent => {
      const assigned = state.tickets.filter(t => t.assignee_id === agent.id).length;
      const solved = state.tickets.filter(t => t.assignee_id === agent.id && t.status === 'solved').length;
      return {
        name: agent.name,
        assigned,
        solved,
        avgResponse: solved > 0 ? `${Math.floor((assigned + 1) / Math.max(solved, 1))}h ${(agent.id * 7) % 60}m` : '—',
      };
    });
  }, [state.users, state.tickets]);

  return (
    <div className="reporting-page">
      <h1 className="reporting-title">Reporting</h1>
      <p className="reporting-subtitle">Support performance overview</p>

      <div className="reporting-grid">
        <div className="reporting-card">
          <h3 className="reporting-card-title">Tickets Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EBED" />
              <XAxis dataKey="name" fontSize={12} stroke="#87929D" />
              <YAxis fontSize={12} stroke="#87929D" />
              <Tooltip />
              <Line type="monotone" dataKey="Created" stroke="#1F73B7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Solved" stroke="#78A300" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="reporting-card">
          <h3 className="reporting-card-title">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#87929D'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {statusData.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s.name] || '#87929D' }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        <div className="reporting-card">
          <h3 className="reporting-card-title">Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EBED" />
              <XAxis type="number" fontSize={12} stroke="#87929D" />
              <YAxis type="category" dataKey="name" fontSize={12} stroke="#87929D" width={60} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="reporting-card">
          <h3 className="reporting-card-title">Agent Leaderboard</h3>
          <table className="list-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Assigned</th>
                <th>Solved</th>
                <th>Avg Response</th>
              </tr>
            </thead>
            <tbody>
              {agentData.map(a => (
                <tr key={a.name}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.assigned}</td>
                  <td>{a.solved}</td>
                  <td style={{ color: '#68737D' }}>{a.avgResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
