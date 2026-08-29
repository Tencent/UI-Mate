import React from 'react';
import { useStore } from '../context/StoreContext';

const GoEndpoint = () => {
  const { state, initialState } = useStore();

  // Compute diff in the same format as the server-side /go endpoint
  // (top-level keys only, using {added, modified} structure)
  const getDiff = (initial, current) => {
    const diff = {};
    for (const key in current) {
      if (!initial || JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
        if (!diff[key]) diff[key] = {};
        if (!initial || !initial[key]) {
          diff[key].added = current[key];
        } else {
          diff[key].modified = current[key];
        }
      }
    }
    return Object.keys(diff).length > 0 ? diff : {};
  };

  const response = {
    initial_state: initialState,
    current_state: state,
    state_diff: getDiff(initialState, state)
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <h1 className="text-xl text-white mb-4 border-b border-gray-700 pb-2">/go Endpoint Response</h1>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};

export default GoEndpoint;
