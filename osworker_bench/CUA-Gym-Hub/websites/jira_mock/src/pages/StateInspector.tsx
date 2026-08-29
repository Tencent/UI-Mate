import React from 'react';
import { useStore } from '../context/StoreContext';

export const StateInspector: React.FC = () => {
  const { state, initialState } = useStore();

  // Simple diff logic
  const getDiff = (obj1: any, obj2: any) => {
    const diff: any = {};
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
    initial_state: initialState,
    current_state: state,
    state_diff: getDiff(state, initialState)
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};
