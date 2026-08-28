import React from 'react';
import { useStore } from '../context/StoreContext';
import { INITIAL_STATE } from '../data/mockData';

export default function Go() {
  const { state } = useStore();

  const getDiff = (obj1, obj2) => {
    // Simple shallow diff for demonstration
    const diff = {};
    Object.keys(obj1).forEach(key => {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        diff[key] = {
          from: obj2[key],
          to: obj1[key]
        };
      }
    });
    return diff;
  };

  const response = {
    initial_state: INITIAL_STATE,
    current_state: state,
    state_diff: getDiff(state, INITIAL_STATE)
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}