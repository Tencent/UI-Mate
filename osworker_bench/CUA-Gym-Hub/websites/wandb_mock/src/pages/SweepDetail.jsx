import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function MethodBadge({ method }) {
  const colors = { bayes: '#83b3f7', grid: '#5bb98c', random: '#e5a444' };
  const bg = { bayes: 'rgba(131,179,247,0.15)', grid: 'rgba(91,185,140,0.15)', random: 'rgba(229,164,68,0.15)' };
  return (
    <span style={{ background: bg[method] || bg.random, color: colors[method] || colors.random, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
      {method}
    </span>
  );
}

function ParallelCoordinates({ sweepRuns, parameters, metricName }) {
  const [hoveredRun, setHoveredRun] = useState(null);
  const paramKeys = Object.keys(parameters);
  const allAxes = [...paramKeys, metricName];
  const width = 700;
  const height = 300;
  const margin = { top: 30, right: 40, bottom: 20, left: 40 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const axisSpacing = plotW / (allAxes.length - 1);

  // Compute min/max for each axis
  const ranges = useMemo(() => {
    const r = {};
    allAxes.forEach(axis => {
      let vals;
      if (axis === metricName) {
        vals = sweepRuns.map(sr => sr[metricName]);
      } else {
        vals = sweepRuns.map(sr => {
          const v = sr.config[axis];
          return typeof v === 'number' ? v : 0;
        });
      }
      const numVals = vals.filter(v => typeof v === 'number');
      r[axis] = { min: Math.min(...numVals), max: Math.max(...numVals) };
      if (r[axis].min === r[axis].max) { r[axis].max += 1; }
    });
    return r;
  }, [sweepRuns, allAxes, metricName]);

  const getY = (axis, value) => {
    const { min, max } = ranges[axis];
    if (typeof value !== 'number') return plotH / 2;
    return plotH - ((value - min) / (max - min)) * plotH;
  };

  const getColor = (val) => {
    const { min, max } = ranges[metricName];
    const t = (val - min) / (max - min);
    const r = Math.round(229 * (1 - t) + 91 * t);
    const g = Math.round(83 * (1 - t) + 185 * t);
    const b = Math.round(75 * (1 - t) + 140 * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Axes */}
        {allAxes.map((axis, i) => {
          const x = i * axisSpacing;
          return (
            <g key={axis}>
              <line x1={x} y1={0} x2={x} y2={plotH} stroke="var(--border-color)" strokeWidth={1} />
              <text x={x} y={-10} textAnchor="middle" fill="var(--text-secondary)" fontSize={11}>{axis}</text>
              <text x={x} y={plotH + 16} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
                {ranges[axis].min.toFixed(ranges[axis].min < 0.01 ? 4 : 2)}
              </text>
              <text x={x} y={-22} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>
                {ranges[axis].max.toFixed(ranges[axis].max < 0.01 ? 4 : 2)}
              </text>
            </g>
          );
        })}
        {/* Polylines */}
        {sweepRuns.map((sr, ri) => {
          const points = allAxes.map((axis, i) => {
            const x = i * axisSpacing;
            const val = axis === metricName ? sr[metricName] : sr.config[axis];
            const y = getY(axis, typeof val === 'number' ? val : 0);
            return `${x},${y}`;
          }).join(' ');
          const color = getColor(sr[metricName]);
          const isHovered = hoveredRun === ri;
          return (
            <polyline
              key={ri}
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={isHovered ? 3 : 1.5}
              strokeOpacity={isHovered ? 1 : hoveredRun !== null ? 0.2 : 0.6}
              onMouseEnter={() => setHoveredRun(ri)}
              onMouseLeave={() => setHoveredRun(null)}
              style={{ cursor: 'pointer', transition: 'stroke-opacity 0.15s' }}
            />
          );
        })}
      </g>
      {hoveredRun !== null && (
        <g>
          <rect x={margin.left + 10} y={margin.top + plotH - 60} width={200} height={50} rx={4} fill="var(--bg-surface)" stroke="var(--border-color)" />
          <text x={margin.left + 18} y={margin.top + plotH - 42} fill="var(--text-primary)" fontSize={12} fontWeight={600}>
            Run {sweepRuns[hoveredRun].runId}
          </text>
          <text x={margin.left + 18} y={margin.top + plotH - 26} fill="var(--text-secondary)" fontSize={11}>
            {metricName}: {sweepRuns[hoveredRun][metricName]?.toFixed(4)}
          </text>
        </g>
      )}
    </svg>
  );
}

export default function SweepDetail() {
  const { entity, project, sweepId } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const sweep = state.sweeps.find(s => s.id === sweepId || s.sweepId === sweepId);

  if (!sweep) return <div className="page-container"><p className="text-muted">Sweep not found.</p></div>;

  // Compute parameter importance (mock correlation)
  const paramImportance = useMemo(() => {
    const params = Object.keys(sweep.parameters);
    const metricVals = sweep.sweepRuns.map(sr => sr[sweep.metric.name]);
    const avg = metricVals.reduce((a, b) => a + b, 0) / metricVals.length;

    return params.map(param => {
      const paramVals = sweep.sweepRuns.map(sr => {
        const v = sr.config[param];
        return typeof v === 'number' ? v : 0;
      });
      const paramAvg = paramVals.reduce((a, b) => a + b, 0) / paramVals.length;

      // Simple correlation coefficient
      let num = 0, denA = 0, denB = 0;
      for (let i = 0; i < paramVals.length; i++) {
        const da = paramVals[i] - paramAvg;
        const db = metricVals[i] - avg;
        num += da * db;
        denA += da * da;
        denB += db * db;
      }
      const corr = denA > 0 && denB > 0 ? num / Math.sqrt(denA * denB) : 0;
      const importance = Math.abs(corr);
      return { param, importance: +importance.toFixed(3), correlation: +corr.toFixed(3) };
    }).sort((a, b) => b.importance - a.importance);
  }, [sweep]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">{sweep.name}</h1>
          <span className={`state-badge ${sweep.state}`}>{sweep.state}</span>
          <MethodBadge method={sweep.method} />
        </div>
      </div>
      <p className="text-muted mb-4">{sweep.metric.name}, {sweep.metric.goal} &middot; {sweep.runCount} runs</p>

      {/* Parallel Coordinates */}
      <div className="card mb-4">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Parallel Coordinates</h3>
        <div style={{ overflowX: 'auto' }}>
          <ParallelCoordinates
            sweepRuns={sweep.sweepRuns}
            parameters={sweep.parameters}
            metricName={sweep.metric.name}
          />
        </div>
      </div>

      {/* Parameter Importance */}
      <div className="card mb-4">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Parameter Importance</h3>
        <div style={{ width: '100%', height: paramImportance.length * 40 + 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paramImportance} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" domain={[0, 1]} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="param" stroke="var(--text-muted)" tick={{ fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)' }}
                formatter={(val, name) => [val.toFixed(3), name === 'importance' ? 'Importance' : 'Correlation']}
              />
              <Bar dataKey="importance" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sweep Runs Table */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Sweep Runs</h3>
        <p className="text-muted text-small mb-3">These runs are managed by the sweep agent. Click a run ID to view its configuration.</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Run ID</th>
              {Object.keys(sweep.parameters).map(p => <th key={p}>{p}</th>)}
              <th>{sweep.metric.name}</th>
            </tr>
          </thead>
          <tbody>
            {sweep.sweepRuns.map(sr => (
              <tr key={sr.runId} title={`Sweep run ${sr.runId}`}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-link)' }}>{sr.runId}</td>
                {Object.keys(sweep.parameters).map(p => (
                  <td key={p} className="text-muted text-small">
                    {typeof sr.config[p] === 'number' ? sr.config[p].toFixed(4) : String(sr.config[p])}
                  </td>
                ))}
                <td style={{ fontWeight: 500, color: sr[sweep.metric.name] === Math.max(...sweep.sweepRuns.map(r => r[sweep.metric.name])) ? 'var(--success-green)' : 'var(--text-primary)' }}>{sr[sweep.metric.name]?.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sweep.sweepRuns.length === 0 && (
          <div className="text-muted text-small" style={{ padding: '20px 0', textAlign: 'center' }}>No runs yet for this sweep.</div>
        )}
      </div>
    </div>
  );
}
