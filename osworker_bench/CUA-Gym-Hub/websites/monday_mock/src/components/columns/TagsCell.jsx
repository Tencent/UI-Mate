import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TagsCell({ column, item, value }) {
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const selectedIds = value?.value || [];
  const tagOptions = column.settings?.options || [];

  const handleToggleTag = (tagId) => {
    const newValue = selectedIds.includes(tagId)
      ? selectedIds.filter(id => id !== tagId)
      : [...selectedIds, tagId];
    dispatch({ type: 'UPDATE_COLUMN_VALUE', payload: { itemId: item.id, columnId: column.id, newValue } });
  };

  const rect = cellRef.current?.getBoundingClientRect();

  return (
    <>
      <div ref={cellRef} className="tags-cell" onClick={() => setOpen(true)} style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
        {selectedIds.length > 0 ? (
          selectedIds.map(tagId => {
            const tag = tagOptions.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <span key={tagId} className="tag-chip" style={{ background: tag.color }}>
                {tag.name}
              </span>
            );
          })
        ) : (
          <span style={{ color: '#C4C4C4', fontSize: 13, opacity: 0 }}>+ tag</span>
        )}
      </div>
      {open && (
        <>
          <div className="popover-overlay" onClick={() => setOpen(false)} />
          <div
            className="popover"
            style={{
              top: rect ? rect.bottom + 4 : 0,
              left: rect ? rect.left - 30 : 0,
              width: 220,
              padding: 8,
            }}
          >
            {tagOptions.map(tag => (
              <div
                key={tag.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
                onClick={() => handleToggleTag(tag.id)}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F7FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(tag.id)}
                  readOnly
                  style={{ accentColor: tag.color }}
                />
                <span className="tag-chip" style={{ background: tag.color }}>
                  {tag.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
