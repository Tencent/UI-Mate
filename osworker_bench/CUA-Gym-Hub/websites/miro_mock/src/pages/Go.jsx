import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { computeStateDiff } from '../utils/stateTracker.js';

export default function Go() {
  const { state, initialState } = useAppContext();
  const diff = computeStateDiff(initialState, state);
  const report = {
    initial_state: initialState,
    current_state: state,
    state_diff: diff,
  };

  return (
    <pre style={{
      background: '#1e1e1e',
      color: '#d4d4d4',
      padding: 20,
      margin: 0,
      overflow: 'auto',
      height: '100vh',
      fontFamily: "'Fira Code', monospace",
      fontSize: 14,
    }}>
      {JSON.stringify(report, null, 2)}
    </pre>
  );
}
