import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';

export default function Go() {
  const { getDebugState } = useStore();
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

  const debugData = serverData || getDebugState();

  return (
    <pre style={{ margin: 0, padding: '16px', fontFamily: 'monospace', fontSize: '12px', background: '#111', color: '#4ade80', minHeight: '100vh' }}>
      {JSON.stringify(debugData, null, 2)}
    </pre>
  );
}
