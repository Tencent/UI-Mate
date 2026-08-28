import React from 'react';
import { useStore } from '../store/StoreContext';

export const GoDebug = () => {
  const { state, getInitialState } = useStore();
  const initialState = getInitialState();

  // Simple diff function
  const getDiff = (obj1, obj2) => {
    const diff = {};
    Object.keys(obj2).forEach(key => {
      if (JSON.stringify(obj2[key]) !== JSON.stringify(obj1[key])) {
        diff[key] = {
          from: obj1[key],
          to: obj2[key]
        };
      }
    });
    return diff;
  };

  const diff = getDiff(initialState, state);

  const debugData = {
    initial_state: initialState,
    current_state: state,
    state_diff: diff
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <h1 className="text-xl font-bold mb-4 text-white">/go Debug Endpoint</h1>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
};
