import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function Go() {
  const { state, initialState, getDiff } = useStore();
  const [serverData, setServerData] = useState(null);

  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get('sid');
    const url = sid ? `/go?sid=${encodeURIComponent(sid)}` : '/go';
    fetch(url)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data?.initial_state && data?.current_state) setServerData(data);
      })
      .catch(() => {});
  }, []);

  const data = serverData || {
    initial_state: initialState,
    current_state: state,
    state_diff: getDiff()
  };

  return (
    <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-auto h-[calc(100vh-140px)] shadow-inner">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
