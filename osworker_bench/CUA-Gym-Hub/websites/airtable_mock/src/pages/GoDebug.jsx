import React, { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { Link } from 'react-router-dom';

/**
 * Compute a deep diff between two values.
 * Returns undefined if they are equal, otherwise returns a description of the change.
 */
function deepDiff(a, b, path = '') {
  if (a === b) return undefined;

  const typeA = typeof a;
  const typeB = typeof b;

  if (typeA !== typeB) {
    return { path, from: a, to: b };
  }

  if (a === null || b === null) {
    return { path, from: a, to: b };
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const diffs = [];
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= a.length) {
        diffs.push({ path: `${path}[${i}]`, added: b[i] });
      } else if (i >= b.length) {
        diffs.push({ path: `${path}[${i}]`, removed: a[i] });
      } else {
        const d = deepDiff(a[i], b[i], `${path}[${i}]`);
        if (d !== undefined) diffs.push(d);
      }
    }
    return diffs.length > 0 ? diffs : undefined;
  }

  if (typeA === 'object' && !Array.isArray(a)) {
    const diffs = {};
    const allKeys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    let hasDiff = false;
    for (const key of allKeys) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in a)) {
        diffs[key] = { added: b[key], path: childPath };
        hasDiff = true;
      } else if (!(key in b)) {
        diffs[key] = { removed: a[key], path: childPath };
        hasDiff = true;
      } else {
        const d = deepDiff(a[key], b[key], childPath);
        if (d !== undefined) {
          diffs[key] = d;
          hasDiff = true;
        }
      }
    }
    return hasDiff ? diffs : undefined;
  }

  // primitives that are different
  return { path, from: a, to: b };
}

const GoDebug = () => {
  const { state, initialState } = useStore();
  const [serverData, setServerData] = useState(null);

  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get('sid');
    const url = sid ? `/go?sid=${encodeURIComponent(sid)}` : '/go';
    fetch(url)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data?.initial_state && data?.current_state) setServerData(data);
      })
      .catch(() => {});
  }, []);

  const stateDiff = deepDiff(initialState || state, state) || {};

  const debugData = serverData || {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-mono text-sm">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">/go Debug Endpoint</h1>
        <Link to="/" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover">Back to App</Link>
      </div>
      <div className="bg-white p-4 rounded shadow border border-gray-200 overflow-auto">
        <pre>{JSON.stringify(debugData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default GoDebug;
