import React from 'react';
import { useStore } from '../store';

export default function Go() {
  const { state, INITIAL_STATE, getDiff } = useStore();

  const debugData = {
    initial_state: INITIAL_STATE,
    current_state: state,
    state_diff: getDiff()
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">State Inspector (/go)</h1>
      <div className="bg-white p-4 rounded shadow overflow-auto border border-gray-300">
        <pre>{JSON.stringify(debugData, null, 2)}</pre>
      </div>
    </div>
  );
}