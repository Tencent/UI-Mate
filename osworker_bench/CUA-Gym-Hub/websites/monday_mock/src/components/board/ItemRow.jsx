import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import ColumnCell from '../columns/ColumnCell';

export default function ItemRow({ item, columns, groupColor, allGroups }) {
  const { state, dispatch } = useAppContext();
  const [editingName, setEditingName] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
  const nameRef = useRef(null);

  const handleToggleSelect = () => {
    dispatch({ type: 'TOGGLE_ITEM_SELECTED', payload: { itemId: item.id } });
  };

  const handleNameClick = () => {
    dispatch({ type: 'SET_ITEM_DETAIL', payload: item.id });
  };

  const handleNameDblClick = (e) => {
    e.stopPropagation();
    setEditingName(true);
    setTimeout(() => {
      nameRef.current?.focus();
      nameRef.current?.select();
    }, 30);
  };

  const handleNameBlur = (e) => {
    const name = e.target.value.trim();
    if (name && name !== item.name) {
      dispatch({ type: 'UPDATE_ITEM_NAME', payload: { itemId: item.id, name } });
    }
    setEditingName(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
    setShowMoveSubmenu(false);
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_ITEM', payload: { itemId: item.id } });
    setShowContextMenu(false);
  };

  const handleDuplicate = () => {
    dispatch({ type: 'DUPLICATE_ITEM', payload: { itemId: item.id } });
    setShowContextMenu(false);
  };

  const handleArchive = () => {
    dispatch({ type: 'ARCHIVE_ITEM', payload: { itemId: item.id } });
    setShowContextMenu(false);
  };

  const handleMoveToGroup = (targetGroupId) => {
    dispatch({ type: 'MOVE_ITEM_TO_GROUP', payload: { itemId: item.id, targetGroupId } });
    setShowContextMenu(false);
    setShowMoveSubmenu(false);
  };

  const otherGroups = allGroups ? allGroups.filter(g => g.id !== item.groupId) : [];

  return (
    <>
      <div
        className={`item-row${item.isSelected ? ' selected' : ''}`}
        onContextMenu={handleContextMenu}
      >
        <div className="item-row-checkbox">
          <input type="checkbox" checked={item.isSelected} onChange={handleToggleSelect} />
        </div>
        <div className="item-name-cell">
          <div className="item-name-cell-color-bar" style={{ background: groupColor }} />
          {editingName ? (
            <input
              ref={nameRef}
              className="item-name-input"
              defaultValue={item.name}
              onBlur={handleNameBlur}
              onKeyDown={e => {
                if (e.key === 'Enter') e.target.blur();
                if (e.key === 'Escape') { setEditingName(false); }
              }}
            />
          ) : (
            <span className="item-name-text" onClick={handleNameClick} onDoubleClick={handleNameDblClick}>
              {item.name || '(unnamed)'}
            </span>
          )}
          <span className="item-chat-icon">&#x1F4AC;</span>
          <button
            className="item-more-btn"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setContextPos({ x: rect.right, y: rect.bottom });
              setShowContextMenu(true);
              setShowMoveSubmenu(false);
            }}
          >
            &#x22EF;
          </button>
        </div>
        {columns.map(col => (
          <ColumnCell
            key={col.id}
            column={col}
            item={item}
            value={item.columnValues?.[col.id]}
          />
        ))}
      </div>

      {showContextMenu && (
        <>
          <div className="popover-overlay" onClick={() => { setShowContextMenu(false); setShowMoveSubmenu(false); }} />
          <div
            className="popover context-menu"
            style={{ top: contextPos.y, left: contextPos.x }}
          >
            <button className="context-menu-item" onClick={handleDuplicate}>
              <span className="context-menu-icon">&#x2398;</span>
              Duplicate
            </button>
            <div
              className="context-menu-item has-submenu"
              onMouseEnter={() => setShowMoveSubmenu(true)}
              onMouseLeave={() => setShowMoveSubmenu(false)}
            >
              <span className="context-menu-icon">&#x21B7;</span>
              Move to Group
              <span className="context-menu-arrow">&#x25B6;</span>
              {showMoveSubmenu && otherGroups.length > 0 && (
                <div className="popover context-submenu">
                  {otherGroups.map(g => (
                    <button
                      key={g.id}
                      className="context-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToGroup(g.id);
                      }}
                    >
                      <div className="context-menu-color-dot" style={{ background: g.color }} />
                      {g.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="context-menu-item" onClick={handleArchive}>
              <span className="context-menu-icon">&#x1F4E6;</span>
              Archive
            </button>
            <div className="context-menu-separator" />
            <button className="context-menu-item danger" onClick={handleDelete}>
              <span className="context-menu-icon">&#x1F5D1;</span>
              Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}
