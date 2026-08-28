import React from 'react';
import { useData } from '../context/DataContext';

export default function GoPage() {
  const { state, initialState, getDiff } = useData();

  const data = {
    initial_state: initialState,
    current_state: state,
    state_diff: getDiff()
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-mono text-sm overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Application State Inspection (/go)</h1>
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
