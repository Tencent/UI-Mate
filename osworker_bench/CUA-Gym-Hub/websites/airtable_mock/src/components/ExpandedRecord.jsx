import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/store';
import Cell from './Cell';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const ExpandedRecord = () => {
  const { state, dispatch, ACTIONS } = useStore();
  const panelRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const recordId = state.ui?.expandedRecordId;

  const handleClose = () => {
    dispatch({ type: ACTIONS.SET_EXPANDED_RECORD, payload: null });
    setShowDeleteConfirm(false);
  };

  // Close on Escape key - must be declared before any early returns
  useEffect(() => {
    if (!recordId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) setShowDeleteConfirm(false);
        else handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recordId, showDeleteConfirm]);

  if (!recordId) return null;

  const activeTable = state.tables[state.activeTableId];
  if (!activeTable) return null;

  const record = activeTable.records.find(r => r.id === recordId);
  if (!record) return null;

  const primaryField = activeTable.fields.find(f => f.primary) || activeTable.fields[0];
  const recordTitle = record.fields[primaryField?.id] || 'Untitled Record';

  const handleDeleteConfirmed = () => {
    dispatch({ type: ACTIONS.DELETE_RECORD, payload: { tableId: activeTable.id, recordId } });
    handleClose();
  };

  const handleCellChange = (fieldId, value) => {
    dispatch({
      type: ACTIONS.UPDATE_CELL,
      payload: { tableId: activeTable.id, recordId, fieldId, value }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 truncate max-w-[70%]">{recordTitle}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Delete record"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Delete confirmation banner */}
        {showDeleteConfirm && (
          <div className="flex items-center gap-3 px-6 py-3 bg-red-50 border-b border-red-200 shrink-0">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <span className="text-sm text-red-700 flex-1">Delete this record permanently?</span>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmed}
              className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {/* Modal body - scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-5">
            {activeTable.fields.map(field => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {field.name}
                </label>
                <div className="border border-gray-200 rounded-md overflow-hidden hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors min-h-[36px]">
                  <Cell
                    field={field}
                    value={record.fields[field.id]}
                    onChange={(val) => handleCellChange(field.id, val)}
                    isGrid={false}
                    tableId={activeTable.id}
                    recordId={record.id}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            Created: {new Date(record.createdTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpandedRecord;
