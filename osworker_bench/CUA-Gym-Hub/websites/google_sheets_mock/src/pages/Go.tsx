import React from 'react';
import { useSpreadsheet } from '../store/useSpreadsheet';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Go: React.FC = () => {
  const { state, initialState, getStateDiff } = useSpreadsheet();

  // Omit large stacks from the serialized output to keep it compact
  const sanitize = (s: any) => {
    const { undoStack, redoStack, ...rest } = s;
    return rest;
  };

  const response = {
    initial_state: sanitize(initialState),
    current_state: sanitize(state),
    state_diff: getStateDiff(),
    meta: {
      undo_depth: state.undoStack?.length ?? 0,
      redo_depth: state.redoStack?.length ?? 0,
    },
  };

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/spreadsheet${window.location.search}`} className="flex items-center gap-2 text-[#1A73E8] hover:underline text-sm">
            <ArrowLeft size={18} /> Back to Spreadsheet
          </Link>
          <h1 className="text-2xl font-bold text-[#202124]">State Inspection Endpoint (/go)</h1>
        </div>

        <div className="bg-white rounded-lg border border-[#DADCE0] overflow-hidden shadow-sm">
          <pre className="text-xs font-mono bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded overflow-auto max-h-[85vh] leading-relaxed">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
