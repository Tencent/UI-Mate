
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export const StateInspector: React.FC = () => {
  const { getDebugState } = useApp();
  const [serverData, setServerData] = useState<any | null>(null);

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

  const responseData = serverData || getDebugState();

  return (
    <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '24px', minHeight: '100vh', fontFamily: 'monospace' }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px', lineHeight: '1.6' }}>
        {JSON.stringify(responseData, null, 2)}
      </pre>
    </div>
  );
};
