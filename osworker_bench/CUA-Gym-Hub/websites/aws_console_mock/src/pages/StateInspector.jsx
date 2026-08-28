import React from 'react';
import { useStore } from '../store/StoreContext';

export default function StateInspector() {
  const { getDebugState } = useStore();
  const debugData = getDebugState();

  return (
    <pre style={{
      margin: 0,
      padding: 16,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
      fontSize: 12,
      lineHeight: 1.5,
      background: '#1E1E1E',
      color: '#D4D4D4',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      minHeight: 'calc(100vh - 120px)',
      borderRadius: 0,
    }}>
      {JSON.stringify(debugData, null, 2)}
    </pre>
  );
}
