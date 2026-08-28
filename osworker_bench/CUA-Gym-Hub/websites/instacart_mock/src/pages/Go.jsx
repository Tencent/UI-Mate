import React from 'react';
import { useApp } from '../context/AppContext';
import { computeStateDiff } from '../utils/stateTracker';

export default function Go() {
  const { state, initialState } = useApp();
  const diff = computeStateDiff(initialState, state);
  const output = { initial_state: initialState, current_state: state, state_diff: diff };

  return (
    <div style={{ padding: 16, background: '#1a1a2e', minHeight: '100vh', color: '#00ff88', fontFamily: 'monospace', fontSize: 12, overflow: 'auto' }}>
      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}
