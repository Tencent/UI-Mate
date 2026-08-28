import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SYSTEM_CHARTS = [
  { key: 'gpu_util', label: 'GPU Utilization (%)', color: '#83b3f7', domain: [0, 100] },
  { key: 'gpu_memory', label: 'GPU Memory (GB)', color: '#ff9f40', domain: [0, 'auto'] },
  { key: 'cpu_util', label: 'CPU Utilization (%)', color: '#5bb98c', domain: [0, 100] },
  { key: 'memory_util', label: 'Memory Utilization (%)', color: '#e5a444', domain: [0, 100] },
  { key: 'disk_io', label: 'Disk I/O (MB/s)', color: '#9966ff', domain: [0, 'auto'] },
  { key: 'network_recv', label: 'Network (MB/s)', color: '#4bc0c0', domain: [0, 'auto'] },
];

export default function RunSystem() {
  const { runId } = useParams();
  const { state } = useApp();
  const run = state.runs.find(r => r.id === runId);

  if (!run) return null;

  const data = run.systemMetrics || [];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {SYSTEM_CHARTS.map(chart => (
          <div key={chart.key} className="panel-card">
            <div className="panel-header">
              <span className="panel-title">{chart.label}</span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="timestamp" stroke="var(--text-muted)" tick={{ fontSize: 11 }} label={{ value: 'Time (s)', position: 'insideBottom', offset: -2, style: { fill: 'var(--text-muted)', fontSize: 11 } }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={50} domain={chart.domain} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)' }}
                    labelFormatter={v => `${v}s`}
                  />
                  <Area
                    type="monotone"
                    dataKey={chart.key}
                    stroke={chart.color}
                    fill={chart.color}
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
