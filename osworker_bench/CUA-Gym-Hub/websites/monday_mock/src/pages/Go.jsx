import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getInitialState } from '../utils/dataManager';
import { computeStateDiff } from '../utils/stateTracker';

export default function Go() {
  const { state, sid } = useAppContext();
  const [serverOutput, setServerOutput] = useState(null);
  const [serverError, setServerError] = useState('');

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

  const initial = getInitialState(sid) || state;
  const diff = computeStateDiff(initial, state);

  const data = serverOutput || {
    initial_state: initial,
    current_state: state,
    state_diff: diff,
    source: serverError ? `client_fallback: ${serverError}` : 'client_fallback',
  };

  return <pre className="go-page">{JSON.stringify(data, null, 2)}</pre>;
}
