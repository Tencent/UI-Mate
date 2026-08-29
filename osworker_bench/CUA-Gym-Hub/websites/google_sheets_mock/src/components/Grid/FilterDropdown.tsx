import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  colIndex: number;
  colLabel: string;
  uniqueValues: string[];
  hiddenValues: string[];
  onSort: (direction: 'asc' | 'desc') => void;
  onFilterChange: (hiddenValues: string[]) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  colIndex, colLabel, uniqueValues, hiddenValues, onSort, onFilterChange
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localHidden, setLocalHidden] = useState<Set<string>>(new Set(hiddenValues));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalHidden(new Set(hiddenValues));
  }, [hiddenValues, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isActive = hiddenValues.length > 0;

  const filteredValues = uniqueValues.filter(v =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = (val: string) => {
    const next = new Set(localHidden);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    setLocalHidden(next);
  };

  const handleOk = () => {
    onFilterChange(Array.from(localHidden));
    setOpen(false);
  };

  const handleSelectAll = () => {
    setLocalHidden(new Set());
  };

  const handleClearAll = () => {
    setLocalHidden(new Set(uniqueValues));
  };

  return (
    <div className="relative" ref={ref} onClick={e => e.stopPropagation()}>
      <button
        className={`flex items-center justify-center w-4 h-4 rounded hover:bg-[#E8EAED] ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`}
        title={`Filter column ${colLabel}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(o => !o);
        }}
      >
        <ChevronDown size={10} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-[#DADCE0] rounded shadow-lg z-50"
          style={{ minWidth: 200, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
        >
          {/* Sort options */}
          <div className="border-b border-[#DADCE0]">
            <button
              className="block w-full text-left px-3 py-1.5 text-sm text-[#202124] hover:bg-[#F1F3F4]"
              onClick={() => { onSort('asc'); setOpen(false); }}
            >
              ↑ Sort A → Z
            </button>
            <button
              className="block w-full text-left px-3 py-1.5 text-sm text-[#202124] hover:bg-[#F1F3F4]"
              onClick={() => { onSort('desc'); setOpen(false); }}
            >
              ↓ Sort Z → A
            </button>
          </div>

          {/* Search box */}
          <div className="p-2 border-b border-[#DADCE0]">
            <input
              type="text"
              placeholder="Search values..."
              className="w-full border border-[#DADCE0] rounded px-2 py-1 text-sm outline-none focus:border-[#4285F4]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Select all / Clear */}
          <div className="flex gap-2 px-2 py-1 border-b border-[#DADCE0]">
            <button
              className="text-xs text-[#1A73E8] hover:underline"
              onClick={handleSelectAll}
            >
              Select all
            </button>
            <button
              className="text-xs text-[#1A73E8] hover:underline"
              onClick={handleClearAll}
            >
              Clear
            </button>
          </div>

          {/* Value list */}
          <div className="max-h-40 overflow-y-auto">
            {filteredValues.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[#5F6368]">No values</div>
            ) : (
              filteredValues.map(val => (
                <label
                  key={val}
                  className="flex items-center gap-2 px-3 py-1 hover:bg-[#F1F3F4] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!localHidden.has(val)}
                    onChange={() => toggleValue(val)}
                    className="rounded"
                  />
                  <span className="text-sm text-[#202124] truncate">{val || '(blank)'}</span>
                </label>
              ))
            )}
          </div>

          {/* OK / Cancel */}
          <div className="flex justify-end gap-2 px-2 py-1.5 border-t border-[#DADCE0]">
            <button
              className="px-3 py-1 text-sm text-[#5F6368] hover:bg-[#F1F3F4] rounded"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm bg-[#1A73E8] text-white rounded hover:bg-[#1765CC]"
              onClick={handleOk}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
