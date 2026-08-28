import React from 'react';
import { useAppContext } from '../context/StoreContext';

export const Go = () => {
  const { fullState, getDiff } = useAppContext();

  if (!fullState) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const output = {
    initial_state: fullState.initial_state,
    current_state: fullState.current_state,
    state_diff: getDiff(),
  };

  return (
    <div style={{ padding: 16, background: 'var(--bc-gray-bg)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--bc-text-dark)' }}>
        State Inspector (/go)
      </h1>
      <pre style={{
        background: '#1a1a2e', color: '#00ff88', padding: 20,
        borderRadius: 8, overflow: 'auto', fontSize: 12,
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        height: 'calc(100vh - 120px)',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
};
