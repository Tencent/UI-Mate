import React from 'react';
import { useAppContext } from '../context/AppContext';
import { computeStateDiff } from '../utils/stateTracker';

export default function Go() {
  const { state, initialState } = useAppContext();
  const diff = computeStateDiff(initialState, state);

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: diff
  };

  return (
    <pre style={{ margin: 0, padding: '16px', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
