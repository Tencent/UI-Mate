import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function GoEndpoint() {
  const store = (typeof useStore === 'function') ? useStore() : null;
  const [report, setReport] = useState(null);

  useEffect(() => {
    let snapshot;
    try {
      if (store && typeof store.getStateReport === 'function') {
        snapshot = store.getStateReport();
      } else if (store && store.state) {
        snapshot = store.state;
      } else {
        const raw = localStorage.getItem('uber_eats_state');
        snapshot = raw ? JSON.parse(raw) : { state: 'empty' };
      }
    } catch (e) {
      snapshot = { error: String(e) };
    }
    setReport(snapshot);
  }, [store]);

  return (
    <pre style={{ padding: 16, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
      {report ? JSON.stringify(report, null, 2) : 'Loading...'}
    </pre>
  );
}
