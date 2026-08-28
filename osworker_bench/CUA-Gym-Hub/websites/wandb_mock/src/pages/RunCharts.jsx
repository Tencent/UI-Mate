import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RunCharts() {
  const { runId } = useParams();
  const { state } = useApp();
  const run = state.runs.find(r => r.id === runId);

  const metricKeys = useMemo(() => {
    if (!run?.history?.length) return [];
    const keys = new Set();
    run.history.forEach(h => {
      Object.keys(h).forEach(k => {
        if (k !== 'step' && k !== 'epoch') keys.add(k);
      });
    });
    return [...keys].sort();
  }, [run]);

  if (!run) return null;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {metricKeys.map(metric => (
          <div key={metric} className="panel-card">
            <div className="panel-header">
              <span className="panel-title">{metric}</span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={run.history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="step" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={50} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)' }}
                    labelFormatter={v => `Step: ${v}`}
                  />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke={run.color}
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
