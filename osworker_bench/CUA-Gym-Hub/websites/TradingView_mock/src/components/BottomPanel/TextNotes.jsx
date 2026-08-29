import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

export default function TextNotes() {
  const { state, updateState } = useAppContext();
  const [localNotes, setLocalNotes] = useState(state.uiState.notes || '');
  const debounceRef = useRef(null);
  const isMounted = useRef(false);

  // Sync from external state changes (e.g. state injection)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setLocalNotes(state.uiState.notes || '');
  }, [state.uiState.notes]);

  const handleChange = useCallback((e) => {
    const newNotes = e.target.value;
    setLocalNotes(newNotes);
    // Debounce state updates for performance
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateState(prev => ({
        ...prev,
        uiState: { ...prev.uiState, notes: newNotes },
      }));
    }, 300);
  }, [updateState]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '4px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 8,
        background: 'var(--bg-panel)',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          Notes are auto-saved to chart state
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
          {localNotes.length} chars
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={localNotes}
        onChange={handleChange}
        placeholder="Type your notes here..."
        style={{
          flex: 1,
          padding: '12px 14px',
          fontFamily: '"Trebuchet MS", Roboto, Ubuntu, sans-serif',
          fontSize: 13,
          lineHeight: 1.6,
          background: '#131722',
          color: '#D1D4DC',
          border: 'none',
          resize: 'none',
          outline: 'none',
          borderRadius: 0,
        }}
      />
    </div>
  );
}
