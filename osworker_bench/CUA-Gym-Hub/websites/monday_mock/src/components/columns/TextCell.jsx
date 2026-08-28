import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TextCell({ column, item, value }) {
  const { dispatch } = useAppContext();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const text = value?.value || '';

  const handleClick = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);
  };

  const handleBlur = (e) => {
    const newText = e.target.value;
    if (newText !== text) {
      dispatch({ type: 'UPDATE_COLUMN_VALUE', payload: { itemId: item.id, columnId: column.id, newValue: newText } });
    }
    setEditing(false);
  };

  return editing ? (
    <input
      ref={inputRef}
      className="text-cell-input"
      defaultValue={text}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditing(false); }}
    />
  ) : (
    <div className="text-cell-text" onClick={handleClick}>
      {text || <span style={{ opacity: 0 }}>Click to edit</span>}
    </div>
  );
}
