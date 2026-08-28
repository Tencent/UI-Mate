import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const SEVERITY = {
  critical: { label: 'Critical', color: 'var(--color-alert)', badge: 'alert' },
  high: { label: 'High', color: 'var(--color-alert)', badge: 'alert' },
  medium: { label: 'Medium', color: 'var(--color-warn)', badge: 'warn' },
  low: { label: 'Low', color: 'var(--color-nodata)', badge: 'nodata' },
};

function makeFindings(state) {
  const errorLogs = (state.logs || [])
    .filter(log => ['error', 'critical', 'warn'].includes(log.status))
    .slice(0, 5)
    .map((log, index) => ({
      id: `log-${log.id || index}`,
      source: 'Cloud SIEM',
      title: log.status === 'critical' ? 'Critical production log spike' : `Suspicious ${log.service || 'service'} log pattern`,
      severity: log.status === 'critical' ? 'critical' : log.status === 'error' ? 'high' : 'medium',
      entity: log.host || log.service || 'production',
      service: log.service,
      description: log.message || log.text || 'Security-relevant event detected in log stream.',
      tags: log.tags || [],
      timestamp: log.timestamp,
    }));

  const monitorFindings = (state.monitors || [])
    .filter(monitor => monitor.status === 'Alert' || monitor.status === 'Warn')
    .slice(0, 4)
    .map(monitor => ({
      id: `monitor-${monitor.id}`,
      source: 'Detection Rule',
      title: `${monitor.name} requires triage`,
      severity: monitor.status === 'Alert' ? 'high' : 'medium',
      entity: monitor.tags?.find(tag => tag.startsWith('service:'))?.replace('service:', '') || 'production',
      service: monitor.tags?.find(tag => tag.startsWith('service:'))?.replace('service:', ''),
      description: monitor.message || monitor.query,
      tags: monitor.tags || [],
      timestamp: monitor.modified || monitor.created,
    }));

  return [...errorLogs, ...monitorFindings];
}

function timeLabel(iso) {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Security() {
  const { state, dispatch } = useAppContext();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [reviewed, setReviewed] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);

  const findings = useMemo(() => makeFindings(state), [state]);
  const filtered = severityFilter === 'all' ? findings : findings.filter(finding => finding.severity === severityFilter);
  const selected = findings.find(finding => finding.id === selectedId) || filtered[0];

  function markReviewed(id) {
    setReviewed(prev => new Set(prev).add(id));
  }

  function declareIncident(finding) {
    const id = 'inc-sec-' + Date.now();
    dispatch({
      type: 'ADD_INCIDENT',
      payload: {
        id,
        title: `Security investigation: ${finding.title}`,
        severity: finding.severity === 'critical' || finding.severity === 'high' ? 'SEV-2' : 'SEV-3',
        status: 'active',
        commander: state.currentUser.email,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        resolved: null,
        services: finding.service ? [finding.service] : [],
        tags: ['source:security', ...finding.tags],
        timeline: [
          { time: new Date().toISOString(), author: state.currentUser.name, text: `Incident declared from Security finding: ${finding.description}` },
        ],
        impact: 'Security triage opened from Xatadog Security Signals.',
        customerNotification: false,
      },
    });
    markReviewed(finding.id);
  }

  const counts = findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, { all: findings.length });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Security</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Signals, detection rules, and triage actions
          </div>
        </div>
        <span className="status-badge alert">{findings.filter(f => !reviewed.has(f.id)).length} open</span>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {['all', 'critical', 'high', 'medium', 'low'].map(level => (
          <button key={level} className={`tab${severityFilter === level ? ' active' : ''}`} onClick={() => setSeverityFilter(level)}>
            {level === 'all' ? 'All' : SEVERITY[level].label}
            <span className={`tab-badge ${level === 'all' ? '' : SEVERITY[level].badge}`}>{counts[level] || 0}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) minmax(320px, 420px)', gap: 16, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map(finding => {
            const meta = SEVERITY[finding.severity] || SEVERITY.low;
            const isSelected = selected?.id === finding.id;
            const isReviewed = reviewed.has(finding.id);
            return (
              <button
                key={finding.id}
                className="security-row"
                onClick={() => setSelectedId(finding.id)}
                style={{ background: isSelected ? '#F5F5FF' : 'white' }}
              >
                <span style={{ width: 4, alignSelf: 'stretch', background: meta.color }} />
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>{finding.title}</strong>
                    {isReviewed && <span className="tag tag-sm">reviewed</span>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                    <span>{finding.source}</span>
                    <span>{finding.entity}</span>
                    <span>{timeLabel(finding.timestamp)}</span>
                  </span>
                </span>
                <span className={`status-badge ${meta.badge}`} style={{ fontSize: 10 }}>{meta.label}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No security signals match this filter.</div>
          )}
        </div>

        <div className="card">
          {selected ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{selected.title}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selected.source} | {selected.entity}</div>
                </div>
                <span className={`status-badge ${SEVERITY[selected.severity].badge}`}>{SEVERITY[selected.severity].label}</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 14 }}>{selected.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {selected.tags.map(tag => <span key={tag} className="tag tag-sm">{tag}</span>)}
                {selected.tags.length === 0 && <span className="tag tag-sm">source:security</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ padding: 10, background: 'var(--content-bg)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>First seen</div>
                  <strong style={{ fontSize: 13 }}>{timeLabel(selected.timestamp)}</strong>
                </div>
                <div style={{ padding: 10, background: 'var(--content-bg)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Owner</div>
                  <strong style={{ fontSize: 13 }}>{state.currentUser.name}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => markReviewed(selected.id)}>Mark reviewed</button>
                <button className="btn btn-primary" onClick={() => declareIncident(selected)}>Declare incident</button>
              </div>
            </>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Select a signal to inspect it.</div>
          )}
        </div>
      </div>
    </div>
  );
}
