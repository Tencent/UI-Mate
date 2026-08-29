import React from 'react';
import { useDocsContext } from '../context/DocsContext';

function deepDiff(initial, current, path = '') {
  const changes = {};

  if (initial === current) return changes;

  if (initial === null || initial === undefined || current === null || current === undefined) {
    if (initial !== current) {
      changes[path || 'root'] = { from: initial, to: current };
    }
    return changes;
  }

  if (typeof initial !== typeof current) {
    changes[path || 'root'] = { from: initial, to: current };
    return changes;
  }

  if (typeof initial !== 'object') {
    if (initial !== current) {
      changes[path || 'root'] = { from: initial, to: current };
    }
    return changes;
  }

  if (Array.isArray(initial) || Array.isArray(current)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      changes[path || 'root'] = { from: initial, to: current };
    }
    return changes;
  }

  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key;
    const hasInitial = key in initial;
    const hasCurrent = key in current;

    if (!hasInitial) {
      changes[newPath] = { from: undefined, to: current[key], type: 'added' };
    } else if (!hasCurrent) {
      changes[newPath] = { from: initial[key], to: undefined, type: 'removed' };
    } else {
      const nested = deepDiff(initial[key], current[key], newPath);
      Object.assign(changes, nested);
    }
  }

  return changes;
}

function GoDebug() {
  const { state, initialState } = useDocsContext();

  const diff = deepDiff(initialState, state);

  const debugData = {
    initial_state: initialState,
    current_state: state,
    state_diff: diff,
    meta: {
      total_changes: Object.keys(diff).length,
      timestamp: new Date().toISOString(),
      documents_count: Object.keys(state.documents || {}).length,
      comments_count: (state.comments || []).length,
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <h1 className="text-xl font-bold mb-4 text-white">/go Debug Endpoint</h1>
      <div className="mb-4 flex gap-4 text-xs">
        <span className="text-yellow-400">Changes: {Object.keys(diff).length}</span>
        <span className="text-blue-400">Documents: {Object.keys(state.documents || {}).length}</span>
        <span className="text-purple-400">Comments: {(state.comments || []).length}</span>
      </div>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
}

export default GoDebug;
