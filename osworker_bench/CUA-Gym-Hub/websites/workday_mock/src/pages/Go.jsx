import React from 'react';
import { useStore } from '../context/StoreContext';

export default function Go() {
  const { getDebugState } = useStore();
  const debugData = getDebugState();

  return (
    <div className="bg-gray-900 min-h-screen p-6 text-green-400 font-mono text-sm overflow-auto">
      <h1 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">/go - State Inspector</h1>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
}
