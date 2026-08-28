import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const METRIC_LIST = [
  'system.cpu.user', 'system.mem.used', 'system.disk.in_use', 'system.net.bytes_rcvd',
  'system.net.bytes_sent', 'system.load.15', 'trace.web.request.hits',
  'trace.web.request.errors', 'trace.web.request.duration',
  'nginx.net.request_per_s', 'postgresql.connections', 'redis.mem.used',
  'celery.queue.length', 'docker.cpu.usage', 'docker.mem.usage',
];

function generateMetricData(metric, count = 60) {
  const now = Date.now();
  const bases = {
    'system.cpu.user': 45, 'system.mem.used': 65, 'system.disk.in_use': 72,
    'system.net.bytes_rcvd': 5000000, 'system.net.bytes_sent': 3000000,
    'system.load.15': 2.5, 'trace.web.request.hits': 250,
    'trace.web.request.errors': 3, 'trace.web.request.duration': 42,
    'nginx.net.request_per_s': 180, 'postgresql.connections': 142,
    'redis.mem.used': 1200000000, 'celery.queue.length': 500,
    'docker.cpu.usage': 35, 'docker.mem.usage': 55,
  };
  const base = bases[metric] || 50;
  return Array.from({ length: count }, (_, i) => ({
    time: now - (count - 1 - i) * 60000,
    value: Math.max(0, base + Math.sin(i / 10) * (base * 0.2) + (Math.random() - 0.5) * (base * 0.1)),
  }));
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function MetricsExplorer() {
  const { state } = useAppContext();
  const [metric, setMetric] = useState(METRIC_LIST[0]);
  const [fromTag, setFromTag] = useState('');
  const [groupBy, setGroupBy] = useState('none');

  const chartData = useMemo(() => generateMetricData(metric), [metric]);

  const currentValue = chartData.length ? chartData[chartData.length - 1].value : 0;

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Metrics Explorer</h1>

      {/* Query builder */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
            <label>Metric</label>
            <select value={metric} onChange={e => setMetric(e.target.value)}>
              {METRIC_LIST.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ width: 180, marginBottom: 0 }}>
            <label>from</label>
            <input value={fromTag} onChange={e => setFromTag(e.target.value)} placeholder="env:production" />
          </div>
          <div className="form-group" style={{ width: 140, marginBottom: 0 }}>
            <label>avg by</label>
            <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              <option value="none">(none)</option>
              <option value="host">host</option>
              <option value="service">service</option>
              <option value="env">env</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={{ stroke: '#DCDCE0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip labelFormatter={formatTime} formatter={v => [v.toFixed(2), metric]} />
              <Line type="monotone" dataKey="value" stroke="#7B68EE" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Summary</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th className="numeric">Current</th>
              <th className="numeric">Avg</th>
              <th className="numeric">Min</th>
              <th className="numeric">Max</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{metric}</code></td>
              <td className="numeric">{currentValue.toFixed(2)}</td>
              <td className="numeric">{(chartData.reduce((a, d) => a + d.value, 0) / chartData.length).toFixed(2)}</td>
              <td className="numeric">{Math.min(...chartData.map(d => d.value)).toFixed(2)}</td>
              <td className="numeric">{Math.max(...chartData.map(d => d.value)).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
