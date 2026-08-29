import React from 'react';
import { useStore } from '../lib/store';

export default function GoPage() {
  const { getDebugState } = useStore();
  const response = getDebugState();

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-xs overflow-auto">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
