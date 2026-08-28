import React from 'react';
import { useDesign } from '../context/DesignContext';

export const Go = () => {
  const { getFullState } = useDesign();
  const stateData = getFullState();

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Application State Inspection (/go)</h1>
      <div className="bg-white p-6 rounded shadow overflow-auto">
        <pre>{JSON.stringify(stateData, null, 2)}</pre>
      </div>
    </div>
  );
};
