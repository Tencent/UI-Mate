import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { createInitialData } from '../utils/dataManager';

export default function Go() {
  const { state, getStateDiff, initialState } = useApp();
  const [view, setView] = useState('diff');

  const sid = new URLSearchParams(window.location.search).get('sid') || 'default';

  // Also handle server-side /go endpoint response if available
  const [serverData, setServerData] = useState(null);
  useEffect(() => {
    if (sid !== 'default') {
      fetch(`/_api/go?sid=${sid}`)
        .then(r => r.json())
        .then(d => setServerData(d))
        .catch(() => {});
    }
  }, [sid]);

  const diff = getStateDiff();
  const displayData = serverData || {
    initial_state: initialState,
    current_state: state,
    state_diff: diff,
  };

  const dataToShow = view === 'diff' ? displayData.state_diff
    : view === 'current' ? displayData.current_state
    : displayData.initial_state;

  return (
    <div style={{
      minHeight: '100vh', background: '#1E1E1E', color: '#D4D4D4',
      fontFamily: '"Courier New", monospace', fontSize: 13, padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <h1 style={{ color: '#3370FF', fontSize: 18, fontWeight: 700, margin: 0 }}>🐛 Xeishu State Inspector</h1>
        {sid !== 'default' && (
          <span style={{ background: '#2D2D2D', padding: '3px 10px', borderRadius: 4, color: '#9CDCFE', fontSize: 12 }}>
            sid: {sid}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[['diff','state_diff'],['current','current_state'],['initial','initial_state']].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '5px 14px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
              background: view === v ? '#3370FF' : '#2D2D2D',
              color: view === v ? '#fff' : '#9CDCFE',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* JSON display */}
      <pre style={{
        background: '#1E1E1E', color: '#D4D4D4', padding: 0, margin: 0,
        overflow: 'auto', maxHeight: 'calc(100vh - 120px)',
        whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>
        <code>{JSON.stringify(dataToShow, null, 2)}</code>
      </pre>
    </div>
  );
}
