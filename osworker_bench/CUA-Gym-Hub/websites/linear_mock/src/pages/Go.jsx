import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { computeStateDiff } from '../utils/dataManager.js';
import { useLocation } from 'react-router-dom';

export default function Go() {
  const { state, initialStateRef, sid } = useApp();
  const location = useLocation();
  const [serverOutput, setServerOutput] = useState(null);
  const [serverError, setServerError] = useState('');

  const params = new URLSearchParams(location.search);
  const querySid = params.get('sid') || sid || 'default';

  useEffect(() => {
    let cancelled = false;
    fetch(`/go?sid=${encodeURIComponent(querySid)}`, { cache: 'no-store' })
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
  }, [querySid]);

  const initialState = (() => {
    try {
      const key = sid ? `linear_mock_initial_${sid}` : 'linear_mock_initial';
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialStateRef?.current;
    } catch {
      return initialStateRef?.current;
    }
  })();

  const diff = computeStateDiff(initialState || {}, state || {});

  const output = serverOutput || {
    initial_state: initialState,
    current_state: state,
    state_diff: diff,
    source: serverError ? `client_fallback: ${serverError}` : 'client_fallback',
  };

  return (
    <pre style={{
      background: '#0f1011',
      color: '#d0d6e0',
      fontSize: 12,
      padding: 16,
      margin: 0,
      minHeight: '100vh',
      overflowX: 'auto',
      fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
