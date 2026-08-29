import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function DropdownCell({ column, item, value }) {
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const selected = value?.value || '';
  const options = column.settings?.options || [];

  const handleSelect = (option) => {
    dispatch({ type: 'UPDATE_COLUMN_VALUE', payload: { itemId: item.id, columnId: column.id, newValue: option } });
    setOpen(false);
  };

  const rect = cellRef.current?.getBoundingClientRect();

  return (
    <>
      <div ref={cellRef} className="dropdown-cell-text" onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        {selected || <span style={{ color: '#C4C4C4' }}>-</span>}
      </div>
      {open && (
        <>
          <div className="popover-overlay" onClick={() => setOpen(false)} />
          <div
            className="popover"
            style={{
              top: rect ? rect.bottom + 4 : 0,
              left: rect ? rect.left : 0,
              width: 180,
              padding: 4,
            }}
          >
            {options.map(opt => (
              <div
                key={opt}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: 4,
                  fontSize: 14,
                  background: opt === selected ? '#E6F4FF' : 'transparent',
                  color: opt === selected ? '#0073EA' : '#323338',
                }}
                onClick={() => handleSelect(opt)}
                onMouseEnter={e => { if (opt !== selected) e.target.style.background = '#F0F7FF'; }}
                onMouseLeave={e => { if (opt !== selected) e.target.style.background = 'transparent'; }}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
