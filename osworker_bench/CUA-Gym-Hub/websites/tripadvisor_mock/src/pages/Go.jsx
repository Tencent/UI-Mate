import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getSessionId, getInitialState } from '../utils/dataManager.js';
import { createInitialData } from '../utils/dataManager.js';

function deepDiff(initial, current) {
  if (initial === current) return undefined;
  if (initial === null || initial === undefined || current === null || current === undefined) {
    return { from: initial, to: current };
  }
  if (typeof initial !== 'object' || typeof current !== 'object') {
    if (initial !== current) return { from: initial, to: current };
    return undefined;
  }
  if (Array.isArray(initial) || Array.isArray(current)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      return { from: initial, to: current };
    }
    return undefined;
  }
  const diff = {};
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
  for (const key of allKeys) {
    const d = deepDiff(initial[key], current[key]);
    if (d !== undefined) diff[key] = d;
  }
  return Object.keys(diff).length > 0 ? diff : undefined;
}

export default function Go() {
  const { state } = useApp();
  const [data, setData] = useState(null);

  useEffect(() => {
    const sid = getSessionId();
    const initialState = getInitialState(sid) || createInitialData();
    const currentState = state;
    const stateDiff = deepDiff(initialState, currentState) || {};

    setData({
      initial_state: initialState,
      current_state: currentState,
      state_diff: stateDiff
    });
  }, [state]);

  if (!data) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1 style={{ fontSize: '18px', fontFamily: 'system-ui', marginBottom: '16px' }}>State Inspector</h1>
      <pre style={{
        background: '#1A1A1A',
        color: '#34E0A1',
        padding: '24px',
        borderRadius: '8px',
        overflow: 'auto',
        maxHeight: '90vh',
        lineHeight: '1.4'
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
