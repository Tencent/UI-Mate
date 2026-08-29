import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function VitalGauge({ value, max, label, unit, status }) {
  const pct = Math.min(value / max, 1);
  const color = status === 'good' ? '#0a7362' : status === 'needs-improvement' ? '#92660a' : '#c30';
  const bgColor = status === 'good' ? '#dafbe8' : status === 'needs-improvement' ? '#fff3cd' : '#fdd';
  return (
    <div className="vital-card">
      <div className="vital-label">{label}</div>
      <div className="vital-value" style={{ color }}>{value}{unit}</div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: bgColor, color }}>
          {status === 'good' ? 'Good' : status === 'needs-improvement' ? 'Needs Improvement' : 'Poor'}
        </span>
      </div>
    </div>
  );
}

export default function SpeedInsights() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const project = state.projects.find(p => p.id === projectId);
  const [timeRange, setTimeRange] = useState('7d');

  const score = 92;
  const circumference = 2 * Math.PI * 60;
  const dashOffset = circumference * (1 - score / 100);
  const scoreColor = score >= 90 ? '#0a7362' : score >= 50 ? '#92660a' : '#c30';

  const vitals = [
    { label: 'LCP', value: 2.1, unit: 's', max: 4, status: 'good', desc: 'Largest Contentful Paint', threshold: '< 2.5s' },
    { label: 'FID', value: 45, unit: 'ms', max: 300, status: 'good', desc: 'First Input Delay', threshold: '< 100ms' },
    { label: 'CLS', value: 0.08, unit: '', max: 0.25, status: 'good', desc: 'Cumulative Layout Shift', threshold: '< 0.1' },
    { label: 'FCP', value: 1.2, unit: 's', max: 3, status: 'good', desc: 'First Contentful Paint', threshold: '< 1.8s' },
    { label: 'TTFB', value: 0.3, unit: 's', max: 1.5, status: 'good', desc: 'Time to First Byte', threshold: '< 0.8s' },
    { label: 'INP', value: 85, unit: 'ms', max: 500, status: 'good', desc: 'Interaction to Next Paint', threshold: '< 200ms' },
  ];

  const pageBreakdown = [
    { path: '/', lcp: '1.8s', fid: '32ms', cls: '0.05', ttfb: '0.2s', score: 96 },
    { path: '/dashboard', lcp: '2.4s', fid: '52ms', cls: '0.12', ttfb: '0.4s', score: 84 },
    { path: '/pricing', lcp: '1.5s', fid: '28ms', cls: '0.03', ttfb: '0.2s', score: 98 },
    { path: '/docs', lcp: '2.1s', fid: '45ms', cls: '0.06', ttfb: '0.3s', score: 92 },
    { path: '/blog', lcp: '2.8s', fid: '62ms', cls: '0.09', ttfb: '0.5s', score: 78 },
    { path: '/login', lcp: '1.2s', fid: '22ms', cls: '0.01', ttfb: '0.1s', score: 99 },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Speed Insights</h1>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ minWidth: 140 }}>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      <div className="page-body">
        {/* Score + Vitals */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 40 }}>
          {/* Score gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="60"
                fill="none"
                stroke={scoreColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              <text x="80" y="78" textAnchor="middle" fill="var(--fg)" fontSize="36" fontWeight="600" fontFamily="var(--font-sans)" letterSpacing="-2">{score}</text>
              <text x="80" y="100" textAnchor="middle" fill="var(--fg-muted)" fontSize="12" fontFamily="var(--font-sans)">Real Experience</text>
            </svg>
            <span style={{ fontSize: 14, color: scoreColor, fontWeight: 600 }}>Good</span>
          </div>

          {/* Vitals grid */}
          <div className="vitals-grid" style={{ flex: 1 }}>
            {vitals.map(v => (
              <VitalGauge key={v.label} {...v} />
            ))}
          </div>
        </div>

        {/* Page-level breakdown */}
        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, letterSpacing: '-0.32px' }}>Page-level Breakdown</div>
          <table className="table">
            <thead>
              <tr>
                <th>Route</th>
                <th style={{ textAlign: 'right' }}>LCP</th>
                <th style={{ textAlign: 'right' }}>FID</th>
                <th style={{ textAlign: 'right' }}>CLS</th>
                <th style={{ textAlign: 'right' }}>TTFB</th>
                <th style={{ textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {pageBreakdown.map(p => {
                const sc = p.score >= 90 ? '#0a7362' : p.score >= 50 ? '#92660a' : '#c30';
                return (
                  <tr key={p.path}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.path}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.lcp}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.fid}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.cls}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.ttfb}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: sc }}>{p.score}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
