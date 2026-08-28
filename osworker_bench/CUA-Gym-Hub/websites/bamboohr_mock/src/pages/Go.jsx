import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { computeDiff } from '../utils/stateTracker';
import { getSessionId } from '../utils/dataManager';

export default function Go() {
  const { state: currentState, initialState: contextInitialState } = useApp();
  const sid = getSessionId();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (sid) {
      // When sid is present, fetch from server-side /go endpoint for authoritative state
      fetch(`/go?sid=${sid}`)
        .then(res => res.json())
        .then(json => setData(json))
        .catch(() => {
          // Fallback to context state if server fetch fails
          setData({
            initial_state: contextInitialState,
            current_state: currentState,
            state_diff: computeDiff(contextInitialState, currentState)
          });
        });
    } else {
      // No sid: use context's initialState (captured at app load, not re-read from localStorage)
      setData({
        initial_state: contextInitialState,
        current_state: currentState,
        state_diff: computeDiff(contextInitialState, currentState)
      });
    }
  }, [currentState, contextInitialState, sid]);

  const display = data || {
    initial_state: contextInitialState,
    current_state: currentState,
    state_diff: computeDiff(contextInitialState, currentState)
  };

  return (
    <pre style={{
      margin: 0, fontFamily: 'monospace', fontSize: 12,
      background: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '16px'
    }}>
      {JSON.stringify(display, null, 2)}
    </pre>
  );
}
