import React, { useContext, useEffect } from 'react';
import { CoinbaseContext } from '../context/CoinbaseContext';

function Go() {
  const { getGoData, state } = useContext(CoinbaseContext);
  const data = getGoData();

  // POST state to server for the server-side /go endpoint
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get('sid');
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state, merge: false })
    }).catch(() => {});
  }, [state]);

  return (
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm min-h-screen overflow-auto">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Go;
