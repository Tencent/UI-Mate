import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { initialKey, initializeData } from '../utils/dataManager';
import { computeDiff } from '../utils/stateTracker';

export default function Go() {
  const { state, updateState, sid } = useApp();

  // Safety net: if state is somehow still null after 3 seconds, force default data
  useEffect(() => {
    if (state !== null) return;
    const timer = setTimeout(() => {
      const data = initializeData(sid, null);
      updateState(data);
    }, 3000);
    return () => clearTimeout(timer);
  }, [state, sid, updateState]);

  let initialState = null;
  try {
    const raw = localStorage.getItem(initialKey(sid));
    if (raw) initialState = JSON.parse(raw);
  } catch {}

  // If initialState is still null but we have current state, use current state as initial
  if (!initialState && state) {
    try {
      const key = initialKey(sid);
      localStorage.setItem(key, JSON.stringify(state));
      initialState = state;
    } catch {}
  }

  const stateDiff = initialState ? computeDiff(initialState, state) : {};

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff,
  };

  return (
    <pre style={{ margin: 0, padding: 20, fontFamily: 'monospace', fontSize: 12, background: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}

