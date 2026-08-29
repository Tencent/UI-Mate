import React from 'react';
import { useApp } from '../context/AppContext';
import { createInitialData, calculateStateDiff, initialKey } from '../utils/dataManager';

export default function Go() {
  const { state, sid } = useApp();
  const iKey = initialKey(sid);
  let initialState;
  try {
    const stored = localStorage.getItem(iKey);
    initialState = stored ? JSON.parse(stored) : createInitialData();
  } catch {
    initialState = createInitialData();
  }
  const stateDiff = calculateStateDiff(initialState, state);
  const data = { initial_state: initialState, current_state: state, state_diff: stateDiff };
  return <pre style={{ fontFamily: 'monospace', fontSize: 12, padding: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(data, null, 2)}</pre>;
}
