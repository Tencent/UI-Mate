import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

// Generate Report Modal (M-07)
function ReportModal({ measurements, onClose }) {
  const targets = measurements.filter(m => m.isTarget || m.targetCategory === 'target');
  const nonTargets = measurements.filter(m => !m.isTarget && m.targetCategory !== 'target');

  const formatValue = (m) => {
    if (m.type === 'bidirectional') return `${m.value} × ${m.secondaryValue} ${m.unit}`;
    if (m.type === 'ellipse') return `${m.value} ${m.unit}`;
    if (m.type === 'length') return `${m.value} ${m.unit}`;
    if (m.type === 'angle') return `${m.value}°`;
    if (m.type === 'annotation') return m.text || '';
    return `${m.value} ${m.unit || ''}`;
  };

  const targetSum = targets.reduce((sum, m) => sum + (m.value || 0) + (m.secondaryValue || 0), 0);

  const reportText = [
    'RECIST 1.1 MEASUREMENT REPORT',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    `TARGET LESIONS (${targets.length})`,
    ...targets.map((m, i) => `  ${i + 1}. ${m.label} [${m.type}]: ${formatValue(m)} — S${m.seriesId} Inst:${m.instanceNumber}`),
    `  Sum of target diameters: ${targetSum.toFixed(1)} mm`,
    '',
    `NON-TARGET LESIONS (${nonTargets.length})`,
    ...nonTargets.map((m, i) => `  ${i + 1}. ${m.label} [${m.type}]: ${formatValue(m)} — S${m.seriesId} Inst:${m.instanceNumber}`),
    '',
    'END OF REPORT',
  ].join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText).catch(() => {});
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recist_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0a1628', border: '1px solid var(--color-border)', borderRadius: '8px', width: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>RECIST Report</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          <pre style={{ fontFamily: "'Roboto Mono', 'Consolas', monospace", fontSize: '12px', color: '#d0e0f0', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
            {reportText}
          </pre>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '12px 18px', borderTop: '1px solid var(--color-border)' }}>
          <button onClick={handleCopy}
            style={{ flex: 1, padding: '8px', background: 'var(--color-bg-toolbar)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Copy
          </button>
          <button onClick={handleDownload}
            style={{ flex: 1, padding: '8px', background: 'var(--color-accent)', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RightPanel() {
  const { state, toggleRightPanel, updateViewport, deleteMeasurement, updateMeasurement } = useAppContext();
  const { activeStudyId } = state.uiState;
  const [showReport, setShowReport] = useState(false);

  const activeVP = Object.values(state.viewports).find(vp => vp.isActive) || Object.values(state.viewports)[0];

  const studyMeasurements = Object.values(state.measurements)
    .filter(m => m.studyId === activeStudyId)
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

  const targets = studyMeasurements.filter(m => m.isTarget || m.targetCategory === 'target');
  const nonTargets = studyMeasurements.filter(m => !m.isTarget && m.targetCategory !== 'target');

  const formatValue = (m) => {
    if (m.type === 'bidirectional') return `${m.value} × ${m.secondaryValue} ${m.unit}`;
    if (m.type === 'ellipse') return `${m.value} ${m.unit}`;
    if (m.type === 'length') return `${m.value} ${m.unit}`;
    if (m.type === 'angle') return `${m.value}°`;
    if (m.type === 'annotation') return m.text || '';
    return `${m.value} ${m.unit || ''}`;
  };

  return (
    <div style={{ width: '280px', background: 'var(--color-bg-panel)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <button onClick={toggleRightPanel} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px' }}>▶</button>
        <span style={{ color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: '600' }}>Measurements</span>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>{studyMeasurements.length}</span>
      </div>

      {/* Measurement list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {studyMeasurements.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 12px', color: '#556677' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📏</div>
            <div style={{ fontSize: '13px' }}>No measurements</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Select a measurement tool and click on the viewport</div>
          </div>
        )}

        {/* Targets section */}
        {targets.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '12px' }}>Targets</span>
              <span style={{ background: 'var(--color-accent)', color: '#000', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' }}>{targets.length}</span>
            </div>
            {targets.map((m, i) => (
              <MeasurementRow key={m.id} measurement={m} index={i + 1}
                onDelete={() => deleteMeasurement(m.id)}
                onRename={(newLabel) => updateMeasurement(m.id, { label: newLabel })}
                onClick={() => {
                  if (activeVP) updateViewport(activeVP.id, { currentInstanceNumber: m.instanceNumber });
                }}
                formatValue={formatValue} />
            ))}
          </div>
        )}

        {/* Non-Targets section */}
        {nonTargets.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '12px' }}>Non-Targets</span>
              <span style={{ background: '#556677', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px' }}>{nonTargets.length}</span>
            </div>
            {nonTargets.map((m, i) => (
              <MeasurementRow key={m.id} measurement={m} index={targets.length + i + 1}
                onDelete={() => deleteMeasurement(m.id)}
                onRename={(newLabel) => updateMeasurement(m.id, { label: newLabel })}
                onClick={() => {
                  if (activeVP) updateViewport(activeVP.id, { currentInstanceNumber: m.instanceNumber });
                }}
                formatValue={formatValue} />
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Generate Report button */}
        {studyMeasurements.length > 0 && (
          <button onClick={() => setShowReport(true)}
            style={{ width: '100%', padding: '8px', background: '#1a4a1a', border: '1px solid #2a6a2a', color: '#4caf50', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            Generate Report
          </button>
        )}
        {/* Export CSV button */}
        <button onClick={() => {
          const csv = ['Label,Type,Value,SecondaryValue,Unit,SeriesDescription,InstanceNumber,CreatedBy,CreatedAt'];
          studyMeasurements.forEach(m => {
            const ser = state.series[m.seriesId];
            csv.push(`"${m.label}","${m.type}",${m.value},${m.secondaryValue || ''},"${m.unit}","${ser?.seriesDescription || ''}",${m.instanceNumber},"${m.createdBy}","${m.createdAt}"`);
          });
          const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'measurements.csv'; a.click();
          URL.revokeObjectURL(url);
        }}
          style={{ width: '100%', padding: '8px', background: 'var(--color-bg-toolbar)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          Export CSV
        </button>
      </div>

      {/* Report modal */}
      {showReport && (
        <ReportModal measurements={studyMeasurements} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

function MeasurementRow({ measurement, index, onDelete, onRename, onClick, formatValue }) {
  const m = measurement;
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(m.label);

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== m.label) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  return (
    <div
      onClick={!isRenaming ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', marginBottom: '2px',
        borderRadius: '4px', cursor: isRenaming ? 'default' : 'pointer', transition: 'background 0.1s',
        borderLeft: `3px solid ${m.color || 'var(--color-accent)'}`,
        background: isHovered ? '#1e2a3a' : 'transparent',
      }}>
      <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px', minWidth: '20px' }}>#{index}</span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setIsRenaming(false)}
              onBlur={handleRenameSubmit}
              style={{ background: '#0a1628', border: '1px solid var(--color-accent)', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '12px', flex: 1 }}
            />
          </form>
        ) : (
          <>
            <div style={{ color: '#fff', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>{formatValue(m)}</div>
          </>
        )}
      </div>
      {/* Action buttons — shown on hover */}
      {isHovered && !isRenaming && (
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setRenameValue(m.label); }}
            title="Rename"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '12px', padding: '2px 4px', borderRadius: '2px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
            ✏
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            style={{ background: 'none', border: 'none', color: '#556677', cursor: 'pointer', fontSize: '14px', padding: '2px 4px', borderRadius: '2px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f44336'}
            onMouseLeave={e => e.currentTarget.style.color = '#556677'}>
            ✕
          </button>
        </div>
      )}
      {/* Always show delete if not hovered (fallback) */}
      {!isHovered && !isRenaming && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'none', border: 'none', color: '#556677', cursor: 'pointer', fontSize: '14px', padding: '2px', opacity: 0.4 }}>
          ✕
        </button>
      )}
    </div>
  );
}
