import React from 'react';
import { useApp } from '../context/AppContext';

export default function Go() {
  const { getDebugState } = useApp();
  const debugState = getDebugState();

  return (
    <pre style={{
      margin: 0,
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      background: '#fff',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {JSON.stringify(debugState, null, 2)}
    </pre>
  );
}
