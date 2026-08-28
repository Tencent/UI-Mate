import React from 'react';
import { useStore } from '../context/StoreContext';

export default function GoRoute() {
  const { state, initialState, actions } = useStore();

  const response = {
    initial_state: initialState,
    current_state: state,
    state_diff: actions.getStateDiff()
  };

  return (
    <div className="p-4 bg-neutral-900 min-h-screen text-green-400 font-mono text-xs overflow-auto">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
