import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Go() {
  const { state, getInitialState, getStateDiff } = useAppContext();
  const initialState = getInitialState();
  const stateDiff = getStateDiff();

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff,
  };

  return (
    <pre style={{
      margin: 0,
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '13px',
      background: '#fff',
      color: '#202124',
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
