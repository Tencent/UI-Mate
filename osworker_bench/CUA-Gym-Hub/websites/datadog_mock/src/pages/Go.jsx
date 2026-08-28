import React, { useEffect, useState } from 'react';
import { getSessionId, getInitialState, calculateStateDiff } from '../utils/dataManager';

export default function Go() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const sid = getSessionId();
    const sk = sid ? `datadogMockState_${sid}` : 'datadogMockState';
    const ik = sid ? `datadogMockInitialState_${sid}` : 'datadogMockInitialState';

    const current = JSON.parse(localStorage.getItem(sk) || 'null');
    const initial = JSON.parse(localStorage.getItem(ik) || 'null');

    const initialState = initial || current || {};
    const currentState = current || initialState;
    const stateDiff = calculateStateDiff(initialState, currentState);

    setData({ initial_state: initialState, current_state: currentState, state_diff: stateDiff });
  }, []);

  if (!data) return <div className="go-page">Loading...</div>;

  return (
    <div className="go-page">
      {JSON.stringify(data, null, 2)}
    </div>
  );
}
