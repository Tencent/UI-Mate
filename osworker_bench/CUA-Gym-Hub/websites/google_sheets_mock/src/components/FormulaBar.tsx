import React, { useEffect, useState, useRef } from 'react';
import { CellData } from '../utils/types';

interface FormulaBarProps {
  selectedCellId: string | null;
  nameBoxDisplay?: string;
  cellData: CellData | undefined;
  onUpdate: (value: string) => void;
  onNavigate?: (cellId: string) => void;
}

// Validate cell reference like A1, B20, AA100
const CELL_REF_RE = /^([A-Za-z]+)(\d+)$/;

export const FormulaBar: React.FC<FormulaBarProps> = ({ selectedCellId, nameBoxDisplay, cellData, onUpdate, onNavigate }) => {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Name box editing state
  const [nameBoxEditing, setNameBoxEditing] = useState(false);
  const [nameBoxValue, setNameBoxValue] = useState('');
  const nameBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setValue(cellData?.formula || '');
    }
  }, [cellData, selectedCellId, isEditing]);

  // Sync nameBoxValue from outside when not editing
  useEffect(() => {
    if (!nameBoxEditing) {
      setNameBoxValue(nameBoxDisplay ?? selectedCellId ?? '');
    }
  }, [nameBoxDisplay, selectedCellId, nameBoxEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onUpdate(value);
      setIsEditing(false);
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setValue(cellData?.formula || '');
      setIsEditing(false);
      e.currentTarget.blur();
    }
  };

  const commitNameBox = () => {
    const raw = nameBoxValue.trim().toUpperCase();
    if (raw && CELL_REF_RE.test(raw) && onNavigate) {
      onNavigate(raw);
    } else {
      // Restore previous display
      setNameBoxValue(nameBoxDisplay ?? selectedCellId ?? '');
    }
    setNameBoxEditing(false);
  };

  const handleNameBoxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitNameBox();
    } else if (e.key === 'Escape') {
      setNameBoxValue(nameBoxDisplay ?? selectedCellId ?? '');
      setNameBoxEditing(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className="flex items-center border-b"
      style={{
        height: 30,
        backgroundColor: 'white',
        borderColor: '#DADCE0',
      }}
    >
      {/* Cell Name Box */}
      <div
        className="flex items-center justify-center border-r"
        style={{
          width: 80,
          height: '100%',
          borderColor: '#DADCE0',
          flexShrink: 0,
        }}
      >
        {nameBoxEditing ? (
          <input
            ref={nameBoxRef}
            className="w-full h-full px-1 text-sm font-medium text-[#202124] outline-none text-center border border-[#4285F4]"
            style={{ fontSize: 13 }}
            value={nameBoxValue}
            onChange={(e) => setNameBoxValue(e.target.value)}
            onKeyDown={handleNameBoxKeyDown}
            onBlur={() => {
              commitNameBox();
            }}
            spellCheck={false}
          />
        ) : (
          <span
            className="text-sm font-medium text-[#202124] cursor-pointer hover:bg-[#F1F3F4] w-full h-full flex items-center justify-center select-none"
            style={{ fontSize: 13 }}
            onClick={() => {
              setNameBoxValue(nameBoxDisplay ?? selectedCellId ?? '');
              setNameBoxEditing(true);
              setTimeout(() => {
                nameBoxRef.current?.focus();
                nameBoxRef.current?.select();
              }, 0);
            }}
            title="Click to navigate to a cell"
          >
            {nameBoxDisplay ?? selectedCellId ?? ''}
          </span>
        )}
      </div>

      {/* Σ function icon */}
      <div
        className="flex items-center justify-center border-r text-gray-500 cursor-pointer hover:bg-[#F1F3F4]"
        style={{ width: 36, height: '100%', borderColor: '#DADCE0', flexShrink: 0, fontSize: 15 }}
        title="Insert function"
      >
        ƒ<span className="text-[10px]">x</span>
      </div>

      {/* Formula input */}
      <input
        type="text"
        aria-label="Formula bar"
        className="flex-1 h-full px-2 outline-none text-sm text-[#202124]"
        style={{ fontSize: 13 }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          onUpdate(value);
          setIsEditing(false);
        }}
        onKeyDown={handleKeyDown}
        placeholder=""
        spellCheck={false}
      />
    </div>
  );
};
