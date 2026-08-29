import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { getSessionId, getInitialState, calculateStateDiff } from '../utils/dataManager.js';

export default function Go() {
  const { state } = useAppContext();
  const sid = getSessionId();
  const initial = getInitialState(sid);
  const diff = initial ? calculateStateDiff(initial, state) : {};

  const output = {
    initial_state: initial || state,
    current_state: state,
    state_diff: diff,
  };

  return (
    <pre style={{
      margin: 0,
      padding: 16,
      background: '#1d1c1d',
      color: '#2BAC76',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: 12,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      minHeight: '100vh',
      overflow: 'auto',
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
