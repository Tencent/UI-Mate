import React from 'react';
import { useApp } from '../store/AppContext';

const Go = () => {
  const { state, initialState } = useApp();

  const getDiff = (obj1, obj2) => {
    const diff = {};
    for (const key in obj2) {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        diff[key] = {
          from: obj1[key],
          to: obj2[key]
        };
      }
    }
    return diff;
  };

  const response = {
    initial_state: initialState,
    current_state: state,
    state_diff: getDiff(initialState, state)
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <h1 className="text-xl mb-4 text-white font-bold">System State Inspector (/go)</h1>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
};

export default Go;
