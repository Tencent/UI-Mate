import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getInitialState, getSessionId } from '../utils/dataManager.js';
import { computeStateDiff } from '../utils/stateTracker.js';

export default function Go() {
  const { state } = useApp();
  const sid = getSessionId();
  const initial = getInitialState(sid);
  const diff = initial ? computeStateDiff(initial, state) : {};

  const output = {
    initial_state: initial,
    current_state: state,
    state_diff: diff,
  };

  return (
    <div className="go-page">
      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}
