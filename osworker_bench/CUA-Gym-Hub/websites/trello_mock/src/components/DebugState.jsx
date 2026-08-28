import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { getSessionId } from '../utils/mockData';

const DebugState = () => {
  const { state, initialState } = useStore();
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('server'); // 'server' or 'client'

  const fetchServerState = useCallback(async () => {
    setLoading(true);
    try {
      const sid = getSessionId();
      const url = sid ? `/go?sid=${encodeURIComponent(sid)}` : '/go';
      const res = await fetch(url);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setServerData(data);
        } else {
          // Server returned HTML (the SPA), fall back to client
          setServerData(null);
          setSource('client');
        }
      } else {
        setServerData(null);
        setSource('client');
      }
    } catch (e) {
      console.error('Failed to fetch /go from server:', e);
      setServerData(null);
      setSource('client');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServerState();
  }, [fetchServerState]);

  const getClientDiff = (obj1, obj2) => {
    if (!obj1 || !obj2) return {};
    const diff = {};
    Object.keys(obj2).forEach(key => {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        diff[key] = {
          from: obj1[key],
          to: obj2[key]
        };
      }
    });
    return diff;
  };

  const clientData = {
    initial_state: initialState,
    current_state: state,
    state_diff: getClientDiff(initialState, state)
  };

  const displayData = source === 'server' && serverData ? serverData : clientData;

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-green-400 font-mono text-sm overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-white">Application State Debugger (/go)</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-700 rounded overflow-hidden text-xs">
            <button
              onClick={() => setSource('server')}
              className={`px-3 py-1 ${source === 'server' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              Server
            </button>
            <button
              onClick={() => setSource('client')}
              className={`px-3 py-1 ${source === 'client' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              Client
            </button>
          </div>
          <button
            onClick={fetchServerState}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-xs font-medium"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        Source: {source === 'server' && serverData ? 'Server-side files' : 'React Context (client)'}
        {source === 'server' && !serverData && ' (server unavailable, showing client data)'}
      </div>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(displayData, null, 2)}
      </pre>
    </div>
  );
};

export default DebugState;
