import React, { useEffect, useState } from 'react';
import { compareStates, getSessionId } from '../lib/fabric-utils';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GoDebug = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      const sid = getSessionId();

      // 1. Get Initial State (session-aware)
      const initKey = sid ? `canvas_initial_state_${sid}` : 'canvas_initial_state';
      const initialStr = localStorage.getItem(initKey);
      let initial = null;
      let initialImage = null;

      if (initialStr) {
        const parsed = JSON.parse(initialStr);
        initial = parsed.state;
        initialImage = parsed.image;
      }

      // 2. Get Current State (session-aware)
      const currentKey = sid ? `canvas_current_state_${sid}` : 'canvas_current_state';
      const currentStr = localStorage.getItem(currentKey);
      let current = null;
      if (currentStr) {
        current = JSON.parse(currentStr);
      }

      // If no current state saved yet, use initial
      if (!current) current = initial;

      // 3. Calculate Diff
      const diff = compareStates(initial, current);

      // 4. Construct Response
      const response = {
        endpoint: "GET /go",
        timestamp: new Date().toISOString(),
        canvasId: "mock-canvas-id",
        sid: sid,
        initial_state: {
          meta: "Initial state captured on load",
          objectCount: initial?.objects?.length || 0,
          image: initialImage ? "(Base64 Image Data...)" : null,
          full_data: initial
        },
        current_state: {
          meta: "Current state from auto-save",
          objectCount: current?.objects?.length || 0,
          image: "(Base64 Image Data...)",
          full_data: current
        },
        state_diff: diff,
        images: {
            initial: initialImage,
        }
      };

      setData(response);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-bold">/go Endpoint Debugger</h1>
          <Link to={`/${location.search}`} className="flex items-center text-blue-400 hover:text-blue-300">
            <ArrowLeft size={16} className="mr-2" /> Back to Editor
          </Link>
        </div>

        {loading ? (
          <div>Loading state analysis...</div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="border border-gray-700 p-4 rounded">
                <h3 className="text-white font-bold mb-2">Initial State Snapshot</h3>
                {data.images.initial ? (
                  <img src={data.images.initial} alt="Initial" className="w-full border border-gray-600 bg-white" />
                ) : (
                  <div className="h-40 bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <div className="border border-gray-700 p-4 rounded">
                <h3 className="text-white font-bold mb-2">State Diff Summary</h3>
                <div className="bg-gray-800 p-4 rounded h-full overflow-auto text-sm">
                  <pre>{JSON.stringify(data.state_diff, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Full JSON Response</h3>
              <div className="bg-gray-800 p-4 rounded overflow-auto max-h-[500px] text-xs">
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoDebug;
