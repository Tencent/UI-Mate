import React, { useEffect, useState } from 'react';
import { useStore } from '../store/store';

export const Go = () => {
  const { state, initialState } = useStore();
  const [serverOutput, setServerOutput] = useState(null);
  const [serverError, setServerError] = useState('');
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');

  useEffect(() => {
    if (!sid) return;
    let cancelled = false;
    fetch(`/go?sid=${encodeURIComponent(sid)}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setServerOutput(data);
      })
      .catch(err => {
        if (!cancelled) setServerError(err.message || 'Unable to load server state');
      });
    return () => { cancelled = true; };
  }, [sid]);

  // Calculate diff
  const calculateDiff = () => {
    const diff = {
      pagesChanged: Object.keys(state.pages).length - Object.keys(initialState.pages).length,
      blocksChanged: Object.keys(state.blocks).length - Object.keys(initialState.blocks).length,
      modifiedPages: [],
      modifiedBlocks: [],
      lastActive: new Date().toISOString()
    };

    // Check for modified pages
    for (const pageId of Object.keys(state.pages)) {
      if (initialState.pages[pageId]) {
        if (JSON.stringify(state.pages[pageId]) !== JSON.stringify(initialState.pages[pageId])) {
          diff.modifiedPages.push(pageId);
        }
      }
    }

    // Check for modified blocks
    for (const blockId of Object.keys(state.blocks)) {
      if (initialState.blocks[blockId]) {
        if (JSON.stringify(state.blocks[blockId]) !== JSON.stringify(initialState.blocks[blockId])) {
          diff.modifiedBlocks.push(blockId);
        }
      }
    }

    return diff;
  };

  const response = serverOutput || {
    initial_state: initialState,
    current_state: state,
    state_diff: calculateDiff(),
    source: serverError ? `client_fallback: ${serverError}` : 'client_fallback'
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Application State Inspection (/go)</h1>
      <div className="bg-white p-4 rounded shadow border border-gray-200 overflow-auto max-h-[80vh]">
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </div>
    </div>
  );
};
