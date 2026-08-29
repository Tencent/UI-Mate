import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#0078d4', '#106ebe', '#005a9e', '#e3a21a', '#107c10', '#605e5c'];
const timeRanges = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Custom'];
const groupByOptions = ['Service', 'Resource group', 'Location', 'Tag'];
const viewTypes = ['Accumulated cost', 'Daily cost'];

export default function CostAnalysis() {
  const { state } = useAppContext();
  const cm = state.costManagement;
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [groupBy, setGroupBy] = useState('Service');
  const [viewType, setViewType] = useState('Daily cost');

  const chartData = viewType === 'Accumulated cost'
    ? cm.dailyCosts.reduce((acc, d, i) => {
        const prev = i > 0 ? acc[i - 1].cost : 0;
        acc.push({ ...d, cost: +(prev + d.cost).toFixed(2) });
        return acc;
      }, [])
    : cm.dailyCosts;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cost Management', path: '/cost-management' }, { label: 'Cost analysis' }]} />
      <h1 className="page-title">Cost analysis</h1>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)', display: 'block', marginBottom: '4px' }}>Time range</label>
          <select className="input" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            {timeRanges.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)', display: 'block', marginBottom: '4px' }}>Group by</label>
          <select className="input" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
            {groupByOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--xzure-text-secondary)', display: 'block', marginBottom: '4px' }}>View</label>
          <select className="input" value={viewType} onChange={e => setViewType(e.target.value)}>
            {viewTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1', minWidth: '150px' }}>
          <div className="caption">Actual cost</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>${cm.currentMonthCost.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '150px' }}>
          <div className="caption">Forecast</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>${cm.forecastedCost.toFixed(2)}</div>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '150px' }}>
          <div className="caption">Budget</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>${cm.budgetAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Area chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-header">{viewType} ({timeRange})</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edebe9" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => `$${v.toFixed(2)}`} />
            <Area type="monotone" dataKey="cost" stroke="#0078d4" fill="#e1efff" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown charts */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1', minWidth: '250px' }}>
          <div className="section-header">By service</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={cm.costByService} dataKey="cost" nameKey="service" cx="50%" cy="50%" outerRadius={70} label={({ service, percentage }) => `${service} (${percentage}%)`}>
                {cm.costByService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '250px' }}>
          <div className="section-header">By resource group</div>
          {cm.costByResourceGroup.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
              <span>{item.resourceGroup}</span>
              <span style={{ fontWeight: 600 }}>${item.cost.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ flex: '1', minWidth: '250px' }}>
          <div className="section-header">By location</div>
          {cm.costByLocation.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
              <span>{item.location}</span>
              <span style={{ fontWeight: 600 }}>${item.cost.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
