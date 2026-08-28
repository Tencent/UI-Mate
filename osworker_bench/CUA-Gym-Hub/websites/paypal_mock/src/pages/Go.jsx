
    import React from 'react';
    import { useStore } from '../context/StoreContext';

    export default function Go() {
      const { initialState, state, getDiff, resetState } = useStore();

      const output = {
        initial_state: initialState,
        current_state: state,
        state_diff: getDiff()
      };

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">State Inspector (/go)</h1>
            <button 
              onClick={resetState}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              Reset Application State
            </button>
          </div>
          
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
              <span className="text-sm font-mono text-slate-300">JSON Output</span>
              <span className="text-xs text-slate-500">Read-only</span>
            </div>
            <pre className="p-6 text-sm font-mono text-green-400 overflow-auto max-h-[70vh]">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
  