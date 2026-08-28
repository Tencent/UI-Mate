import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppContext';
import { computeStateDiff } from '../utils/stateTracker';

export default function Go() {
  const { state, initialState } = useAppState();
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

  const diff = computeStateDiff(initialState, state);

  const response = serverData || {
    initial_state: initialState,
    current_state: state,
    state_diff: diff,
  };

  return (
    <pre style={{
      background: '#fff',
      fontFamily: 'monospace',
      fontSize: '12px',
      padding: '16px',
      margin: 0,
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    }}>
      {JSON.stringify(response, null, 2)}
    </pre>
  );
}
