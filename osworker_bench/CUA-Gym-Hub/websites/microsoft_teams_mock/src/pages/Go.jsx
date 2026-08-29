import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Go() {
  const { state, getInitial, getDiff } = useApp();

  const response = {
    initial_state: getInitial(),
    current_state: state,
    state_diff: getDiff()
  };

  return (
    <div style={{ background: '#1e1e1e', color: '#4ec9b0', padding: 16, minHeight: '100vh', fontFamily: "'Consolas', 'Monaco', monospace", fontSize: 13, overflow: 'auto' }}>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
