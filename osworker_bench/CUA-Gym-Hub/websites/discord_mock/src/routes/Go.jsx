import React from 'react';
import { useStore } from '../store/useStore';
import { INITIAL_STATE } from '../data/initialState';

// Simple deep diff implementation to avoid external dependencies
function getDiff(obj1, obj2) {
  const diff = {};

  // If types are different, return obj2
  if (typeof obj1 !== typeof obj2) {
    return obj2;
  }

  // If one is not an object or is null, return obj2 if different
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2 ? undefined : obj2;
  }

  // If array, compare arrays (simplified: return new array if different)
  if (Array.isArray(obj1)) {
    return JSON.stringify(obj1) === JSON.stringify(obj2) ? undefined : obj2;
  }

  // Compare keys
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);

  for (const key of allKeys) {
    if (!Object.prototype.hasOwnProperty.call(obj1, key)) {
      // New key in obj2
      diff[key] = obj2[key];
    } else if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
      // Key deleted in obj2 (show as undefined)
      diff[key] = undefined;
    } else {
      // Key exists in both, check for deep difference
      const deepDiff = getDiff(obj1[key], obj2[key]);
      if (deepDiff !== undefined) {
        diff[key] = deepDiff;
      }
    }
  }

  return Object.keys(diff).length > 0 ? diff : undefined;
}

export default function Go() {
  const currentState = useStore.getState();

  // Use session-aware initial state snapshot if available, otherwise fall back to static INITIAL_STATE
  const initialStateSnapshot = currentState._initialStateSnapshot || INITIAL_STATE;

  // Filter out actions and internal keys from state
  const cleanState = Object.fromEntries(
    Object.entries(currentState).filter(([key, value]) => typeof value !== 'function' && !key.startsWith('_'))
  );

  const stateDiff = getDiff(initialStateSnapshot, cleanState) || {};

  const response = {
    initial_state: initialStateSnapshot,
    current_state: cleanState,
    state_diff: stateDiff
  };

  return (
    <div className="p-4 bg-gray-900 text-green-400 min-h-screen font-mono text-sm overflow-auto">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
