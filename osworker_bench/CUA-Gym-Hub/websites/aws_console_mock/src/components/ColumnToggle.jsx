import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';

/**
 * ColumnToggle - A reusable gear icon button that opens a checklist popover
 * for toggling column visibility. State is persisted to localStorage.
 *
 * @param {string} tableName - Unique table identifier for localStorage key
 * @param {Array<{key: string, label: string}>} columns - Available columns
 * @param {Array<string>} visibleColumns - Currently visible column keys
 * @param {function} onToggle - Callback with updated visible columns array
 */
export default function ColumnToggle({ tableName, columns, visibleColumns, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = (key) => {
    const isVisible = visibleColumns.includes(key);
    let updated;
    if (isVisible) {
      // Don't allow hiding all columns
      if (visibleColumns.length <= 1) return;
      updated = visibleColumns.filter(k => k !== key);
    } else {
      updated = [...visibleColumns, key];
    }
    onToggle(updated);
    localStorage.setItem(`aws_table_columns_${tableName}`, JSON.stringify(updated));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-1.5 hover:bg-gray-100 rounded"
        onClick={() => setOpen(!open)}
        title="Toggle column visibility"
      >
        <Settings size={16} className="text-aws-text-secondary" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-aws-border shadow-lg z-30 w-56" style={{ borderRadius: 8 }}>
          <div className="px-3 py-2 border-b border-gray-100 text-xs font-bold text-aws-text-secondary uppercase">
            Visible columns
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {columns.map(col => (
              <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.key)}
                  onChange={() => handleToggle(col.key)}
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * useColumnVisibility - Hook to manage column visibility state
 * @param {string} tableName - Unique table identifier
 * @param {Array<string>} defaultColumns - Default visible column keys
 * @returns {[Array<string>, function]} - [visibleColumns, setVisibleColumns]
 */
export function useColumnVisibility(tableName, defaultColumns) {
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const stored = localStorage.getItem(`aws_table_columns_${tableName}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultColumns;
  });

  return [visibleColumns, setVisibleColumns];
}
