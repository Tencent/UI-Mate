import React, { useEffect, useState } from 'react';
import { getSessionId } from '../utils/dataManager';

export default function Go() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const sid = getSessionId();

  useEffect(() => {
    fetch(`/go?sid=${sid}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sid]);

  if (loading) return <div style={{ padding: 40, fontFamily: 'monospace' }}>Loading state...</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 13, maxWidth: '100%', overflow: 'auto' }}>
      <h1 style={{ fontFamily: 'sans-serif', fontSize: 18, marginBottom: 16 }}>State Inspector (sid={sid})</h1>
      <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto', maxHeight: '90vh' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
