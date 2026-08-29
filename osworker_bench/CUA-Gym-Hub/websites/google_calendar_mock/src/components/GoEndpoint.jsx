import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronDown, ChevronRight } from 'lucide-react';

const JsonSection = ({ title, data, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border border-gray-700 rounded overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-left transition-colors"
      >
        {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        <span className="font-mono text-green-400 font-bold">{title}</span>
        <span className="text-xs text-gray-500 ml-auto">{isOpen ? 'Collapse' : 'Expand'}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-gray-900 overflow-x-auto">
          <pre className="text-xs text-blue-300 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default function GoEndpoint() {
  const { state, originalState, getDiff } = useStore();

  const response = {
    initial_state: originalState,
    current_state: state,
    state_diff: getDiff()
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 p-6 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-white mb-2">/go Endpoint Debugger</h1>
          <p className="text-sm text-gray-500">
            This view exposes the internal application state for testing and verification purposes.
          </p>
          <a href="/" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 hover:underline">
            ← Back to Calendar
          </a>
        </div>

        <div className="grid gap-4">
          <JsonSection title="state_diff" data={response.state_diff} defaultOpen={true} />
          <JsonSection title="current_state" data={response.current_state} defaultOpen={false} />
          <JsonSection title="initial_state" data={response.initial_state} defaultOpen={false} />
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-xs text-gray-600">
          Raw JSON Output Structure:
          <pre className="mt-2 bg-gray-900 p-2 rounded text-gray-500">
{`{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": { ... }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
