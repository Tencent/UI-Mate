import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { computeStateDiff } from '../utils/dataManager.js';

export default function StateInspector() {
  const { state, initialState } = useAppContext();

  const diff = computeStateDiff(initialState, state);

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: diff,
  };

  return (
    <div style={{
      background: '#000',
      color: '#fff',
      fontFamily: "'Roboto Mono', 'Consolas', monospace",
      fontSize: '12px',
      padding: '20px',
      width: '100%',
      height: '100vh',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    }}>
      {JSON.stringify(output, null, 2)}
    </div>
  );
}
