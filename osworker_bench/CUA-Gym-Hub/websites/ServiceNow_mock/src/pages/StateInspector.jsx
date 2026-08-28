import React from 'react';
import { useApp } from '../context/AppContext';
import { getInitialState, getSessionId } from '../utils/dataManager';

function calculateStateDiff(initial, current) {
  if (!initial || !current) return {};
  const diff = {};
  for (const key of Object.keys(current)) {
    if (JSON.stringify(current[key]) !== JSON.stringify(initial?.[key])) {
      diff[key] = { initial: initial?.[key], current: current[key] };
    }
  }
  return Object.keys(diff).length > 0 ? diff : {};
}

export default function StateInspector() {
  const { state } = useApp();
  const sid = getSessionId();
  const initialState = getInitialState(sid);
  const stateDiff = calculateStateDiff(initialState, state);

  const output = {
    initial_state: initialState || state,
    current_state: state,
    state_diff: stateDiff,
  };

  return (
    <div className="sn-state-inspector">
      <h2 style={{ marginBottom: 16, fontFamily: 'var(--sn-font-family)' }}>State Inspector</h2>
      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}
