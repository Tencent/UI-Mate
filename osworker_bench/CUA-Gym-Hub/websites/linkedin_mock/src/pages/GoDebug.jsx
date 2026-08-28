import React from 'react';
import { useStore } from '../context/StoreContext';

export default function GoDebug() {
  const { getDebugState } = useStore();
  const debugData = getDebugState();

  return (
    <div className="bg-gray-900 min-h-screen text-green-400 p-8 font-mono overflow-auto">
      <h1 className="text-2xl mb-4 border-b border-green-800 pb-2">/go - State Inspection</h1>
      <pre className="text-sm whitespace-pre-wrap">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
}