import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export default function StateInspector() {
  const { getStateSnapshot, isLoaded } = useStore();

  useEffect(() => {
    document.title = 'State Inspector - Xoom Mock';
  }, []);

  if (!isLoaded) {
    return <pre>{"Loading..."}</pre>;
  }

  const snapshot = getStateSnapshot();

  return (
    <pre style={{
      margin: 0,
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {JSON.stringify(snapshot, null, 2)}
    </pre>
  );
}
