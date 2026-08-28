import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';

export default function Go() {
  const { getGoData } = useStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    const goData = getGoData();
    setData(goData);
  }, []);

  if (!data) {
    return (
      <div className="bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm min-h-screen flex items-center justify-center">
        Loading state...
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm min-h-screen overflow-auto">
      <div className="mb-4 text-[#569cd6]">
        {'{'}  "status": "ok", "app": "robinhood_mock" {'}'}
      </div>
      <pre className="whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
