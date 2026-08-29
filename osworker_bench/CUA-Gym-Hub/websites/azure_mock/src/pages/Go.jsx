import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDefaultData, getInitialState } from '../utils/dataManager';

export default function Go() {
  const { state, sid } = useAppContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    const initial = getInitialState(sid) || getDefaultData();
    const current = state;
    const diff = {};
    for (const key in current) {
      if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
        diff[key] = { initial: initial[key], current: current[key] };
      }
    }
    setData({
      initial_state: initial,
      current_state: current,
      state_diff: Object.keys(diff).length > 0 ? diff : {}
    });
  }, [state, sid]);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fff', padding: '16px', border: '1px solid #edebe9', borderRadius: '4px', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
