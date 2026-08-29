import React from 'react';
import { useApp } from '../context/AppContext';

export default function Go() {
  const { state, initialState, getStateDiff } = useApp();

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: getStateDiff()
  };

  return (
    <pre style={{
      fontFamily: 'monospace',
      fontSize: 12,
      background: '#fff',
      padding: 16,
      margin: 0,
      minHeight: '100vh',
      overflow: 'auto',
      color: '#33475B',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
