import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CostExplorer() {
  const { state } = useStore();
  const { billing } = state;
  const [range, setRange] = useState('6');
  const [groupBy, setGroupBy] = useState('service');

  const months = range === 'mtd' ? billing.history.slice(-1) : billing.history.slice(-parseInt(range));
  const regions = [
    { name: state.user.region, ratio: 0.72, color: '#0073BB' },
    { name: 'us-west-2', ratio: 0.18, color: '#3ECF8E' },
    { name: 'eu-west-1', ratio: 0.10, color: '#879596' },
  ];
  const usageTypes = [
    { name: 'Compute hours', ratio: 0.54, color: '#FF9900' },
    { name: 'Database storage', ratio: 0.22, color: '#3B48CC' },
    { name: 'Requests', ratio: 0.14, color: '#E7157B' },
    { name: 'Data transfer', ratio: 0.10, color: '#879596' },
  ];

  // Build stacked data by service for each month
  const stackedData = months.map(m => {
    const row = { month: m.month };
    if (groupBy === 'service') {
      billing.byService.forEach(s => {
        row[s.name] = +(s.amount * (m.amount / billing.currentMonth)).toFixed(2);
      });
    } else if (groupBy === 'region') {
      regions.forEach(r => {
        row[r.name] = +(m.amount * r.ratio).toFixed(2);
      });
    } else if (groupBy === 'usage_type') {
      usageTypes.forEach(u => {
        row[u.name] = +(m.amount * u.ratio).toFixed(2);
      });
    } else {
      row['Total'] = m.amount;
    }
    return row;
  });

  const ranges = [
    { label: 'Month to date', value: 'mtd' },
    { label: 'Last 3 months', value: '3' },
    { label: 'Last 6 months', value: '6' },
    { label: 'Last 12 months', value: '12' },
  ];
  const series = groupBy === 'service' ? billing.byService : groupBy === 'region' ? regions : groupBy === 'usage_type' ? usageTypes : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Cost Explorer</h1>

      {/* Controls */}
      <div className="aws-card flex items-center gap-4">
        <div className="flex gap-2">
          {ranges.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)} className={`aws-btn text-xs ${range === r.value ? 'aws-btn-primary' : 'aws-btn-secondary'}`}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-aws-text-secondary">Group by:</span>
          <select className="aws-input w-auto" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
            <option value="service">Service</option>
            <option value="region">Region</option>
            <option value="usage_type">Usage type</option>
            <option value="total">Total</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="aws-card" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stackedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} />
            <Legend />
            {groupBy !== 'total' ? (
              series.map((s) => (
                <Bar key={s.name} dataKey={s.name} stackId="a" fill={s.color} />
              ))
            ) : (
              <Bar dataKey="Total" fill="#0073BB" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="aws-card">
        <h3 className="font-bold text-sm mb-4">Monthly costs</h3>
        <table className="aws-table">
          <thead><tr><th>Month</th><th>Amount</th></tr></thead>
          <tbody>
            {months.map(m => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td className="font-medium">${m.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
