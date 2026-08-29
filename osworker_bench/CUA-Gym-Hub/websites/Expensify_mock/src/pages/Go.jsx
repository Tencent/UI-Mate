import React from 'react';
import { useApp } from '../context/AppContext';
import { createInitialData, initialKey, getSessionId } from '../utils/dataManager';
import { computeStateDiff } from '../utils/stateTracker';

export default function Go() {
  const { state } = useApp();
  const sid = getSessionId();
  const iKey = initialKey(sid);
  let initial;
  try {
    const stored = localStorage.getItem(iKey);
    initial = stored ? JSON.parse(stored) : createInitialData();
  } catch {
    initial = createInitialData();
  }
  const diff = computeStateDiff(initial, state);
  const output = { initial_state: initial, current_state: state, state_diff: diff };
  return <pre style={{ margin: 0, padding: 16, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(output, null, 2)}</pre>;
}
