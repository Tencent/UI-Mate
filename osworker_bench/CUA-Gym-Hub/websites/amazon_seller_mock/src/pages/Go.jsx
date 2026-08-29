import React from 'react';
import { useApp } from '../context/AppContext';
import { getInitialState, getSessionId } from '../utils/dataManager';

function deepDiff(initial, current, path = '') {
  const diff = {};
  if (!initial || !current) return diff;
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    const a = initial[key];
    const b = current[key];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      Object.assign(diff, deepDiff(a, b, fullPath));
    } else {
      diff[fullPath] = { old: a, new: b };
    }
  }
  return diff;
}

export default function Go() {
  const { state } = useApp();
  const sid = getSessionId();
  const initialState = getInitialState(sid);

  const currentState = state;
  const stateDiff = (initialState && currentState) ? deepDiff(initialState, currentState) : {};

  const output = {
    initial_state: initialState || currentState,
    current_state: currentState,
    state_diff: stateDiff
  };

  return (
    <pre style={{ margin: 0, padding: 16, fontFamily: 'monospace', fontSize: 12, lineHeight: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f5f5f5', minHeight: '100vh' }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
