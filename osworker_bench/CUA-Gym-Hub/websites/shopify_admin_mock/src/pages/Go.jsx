
import React from 'react';
import { useStore } from '../context/StoreContext';

export default function Go() {
  const { initialState, state, getDiff } = useStore();

  const response = {
    initial_state: initialState,
    current_state: state,
    state_diff: getDiff()
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <h1 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">/go - State Inspector</h1>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}
