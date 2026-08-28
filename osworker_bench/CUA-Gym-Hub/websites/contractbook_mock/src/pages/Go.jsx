import React, { useEffect, useState } from 'react';
import { computeDiff } from '../utils/stateTracker';
import { getSessionId, initialKey, storageKey } from '../utils/dataManager';

export default function Go() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const sid = getSessionId();

    // Try to fetch from server first (more reliable for session isolation)
    const fetchFromServer = async () => {
      try {
        const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const serverData = await res.json();
          if (serverData.current_state && Object.keys(serverData.current_state).length > 0) {
            setData(serverData);
            return;
          }
        }
      } catch (e) {
        // Fall through to localStorage
      }

      // Fallback to localStorage
      const initKey = initialKey(sid);
      const stKey = storageKey(sid);

      const initial = (() => {
        try {
          const raw = localStorage.getItem(initKey);
          return raw ? JSON.parse(raw) : {};
        } catch (e) {
          return {};
        }
      })();

      const current = (() => {
        try {
          const raw = localStorage.getItem(stKey);
          return raw ? JSON.parse(raw) : {};
        } catch (e) {
          return {};
        }
      })();

      const state_diff = computeDiff(initial, current);
      setData({ initial_state: initial, current_state: current, state_diff });
    };

    fetchFromServer();
  }, []);

  if (!data) return <pre style={{ fontFamily: 'monospace', padding: 16 }}>Loading...</pre>;

  return (
    <pre style={{
      fontFamily: '"Fira Mono", "Cascadia Code", "Consolas", monospace',
      fontSize: '13px',
      lineHeight: '1.5',
      background: '#fff',
      color: '#1A1A2E',
      padding: '24px',
      margin: 0,
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
