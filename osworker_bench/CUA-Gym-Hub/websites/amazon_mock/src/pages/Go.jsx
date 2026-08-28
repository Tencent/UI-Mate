import React from 'react';
import { useStore } from '../context/StoreContext';

export const Go = () => {
  const { initialState, state, getStateDiff } = useStore();

  const data = {
    initial_state: initialState,
    current_state: state,
    state_diff: getStateDiff()
  };

  return (
    <div className="bg-gray-900 text-green-400 p-4 min-h-screen font-mono text-sm overflow-auto">
      <h1 className="text-xl font-bold text-white mb-4">Application State Inspector (/go)</h1>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};