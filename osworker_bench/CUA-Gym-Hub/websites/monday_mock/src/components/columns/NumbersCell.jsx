import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function NumbersCell({ column, item, value }) {
  const { dispatch } = useAppContext();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const num = value?.value;
  const unit = column.settings?.unit || '';
  const direction = column.settings?.direction || 'left';

  const handleClick = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);
  };

  const handleBlur = (e) => {
    const raw = e.target.value.trim();
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      dispatch({ type: 'UPDATE_COLUMN_VALUE', payload: { itemId: item.id, columnId: column.id, newValue: parsed } });
    }
    setEditing(false);
  };

  const formatNumber = (n) => {
    if (n === null || n === undefined) return '';
    const formatted = Number(n).toLocaleString();
    return direction === 'left' ? `${unit}${formatted}` : `${formatted}${unit}`;
  };

  return editing ? (
    <input
      ref={inputRef}
      className="text-cell-input"
      defaultValue={num ?? ''}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditing(false); }}
      style={{ textAlign: 'right' }}
    />
  ) : (
    <div className="numbers-cell-text" onClick={handleClick}>
      {num !== null && num !== undefined ? formatNumber(num) : ''}
    </div>
  );
}
