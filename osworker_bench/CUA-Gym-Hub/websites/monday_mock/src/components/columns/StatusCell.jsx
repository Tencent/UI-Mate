import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function StatusCell({ column, item, value }) {
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const labels = column.settings?.labels || {};
  const labelIdx = value?.value;
  const label = labelIdx !== null && labelIdx !== undefined ? labels[labelIdx] : null;

  const handleClick = () => setOpen(true);
  const handleSelect = (idx) => {
    dispatch({ type: 'UPDATE_COLUMN_VALUE', payload: { itemId: item.id, columnId: column.id, newValue: idx } });
    setOpen(false);
  };

  const bgColor = label ? label.color : '#C4C4C4';
  const text = label ? label.text : '';

  const rect = cellRef.current?.getBoundingClientRect();

  return (
    <>
      <div
        ref={cellRef}
        className="status-cell"
        style={{ background: bgColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={handleClick}
      >
        {text}
      </div>
      {open && (
        <>
          <div className="popover-overlay" onClick={() => setOpen(false)} />
          <div
            className="popover status-popover"
            style={{
              top: rect ? rect.bottom + 4 : 0,
              left: rect ? rect.left : 0,
            }}
          >
            {Object.entries(labels).map(([idx, lbl]) => (
              <div
                key={idx}
                className="status-option"
                style={{ background: lbl.color }}
                onClick={() => handleSelect(Number(idx))}
              >
                {lbl.text || '(empty)'}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
