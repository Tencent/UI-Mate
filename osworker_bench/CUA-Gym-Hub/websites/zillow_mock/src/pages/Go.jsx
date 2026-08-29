import React, { useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { getSessionId } from '../lib/mockData';

export default function Go() {
  const { state, initialState, getDebugState, resetData } = useStore();
  const lastPosted = useRef(null);

  // Sync current state to the server whenever it changes
  useEffect(() => {
    if (!state) return;
    const sid = getSessionId();
    const stateStr = JSON.stringify(state);
    if (stateStr === lastPosted.current) return;
    lastPosted.current = stateStr;

    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state, merge: false })
    }).catch(() => {});
  }, [state]);

  // Also sync initial state on first mount
  useEffect(() => {
    if (!initialState) return;
    const sid = getSessionId();
    const safeSid = sid ? sid.replace(/[^a-zA-Z0-9_-]/g, '') : null;
    // POST to set (which writes both state files) as initial
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: initialState, merge: false })
    }).catch(() => {});
  }, []); // only on mount

  const data = getDebugState();

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-mono text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Application State Inspector (/go)</h1>
            <button
                onClick={resetData}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-sans font-bold"
            >
                Reset State
            </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow overflow-auto border border-gray-300">
          <pre className="whitespace-pre-wrap text-gray-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
