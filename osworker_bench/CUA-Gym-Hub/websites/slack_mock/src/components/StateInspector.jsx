
import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateStateDiff } from '../utils/dataManager';

function StateInspector() {
  const { state, getInitialState } = useApp();
  const initialState = getInitialState();

  const response = {
    initial_state: initialState || state,
    current_state: state,
    state_diff: initialState ? calculateStateDiff(initialState, state) : {}
  };

  return (
    <pre style={{
      padding: '20px',
      background: '#1d1c1d',
      color: '#2BAC76',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.5',
      overflow: 'auto',
      height: '100vh'
    }}>
      {JSON.stringify(response, null, 2)}
    </pre>
  );
}

export default StateInspector;
