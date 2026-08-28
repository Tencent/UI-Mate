import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import ItemRow from './ItemRow';

export default function GroupSection({ group, items, board, columns }) {
  const { state, dispatch } = useAppContext();
  const [addingItem, setAddingItem] = useState(false);
  const addInputRef = useRef(null);

  const allGroups = board.groupIds.map(gid => state.groups[gid]).filter(Boolean);
  const selectableItems = items.filter(item => !item.archivedAt);
  const allSelected = selectableItems.length > 0 && selectableItems.every(item => item.isSelected);

  const handleToggleCollapse = () => {
    dispatch({ type: 'TOGGLE_GROUP_COLLAPSE', payload: { groupId: group.id } });
  };

  const handleTitleBlur = (e) => {
    const newTitle = e.target.value.trim();
    if (newTitle && newTitle !== group.title) {
      dispatch({ type: 'UPDATE_GROUP_TITLE', payload: { groupId: group.id, title: newTitle } });
    }
  };

  const handleAddItem = () => {
    setAddingItem(true);
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const handleAddItemSubmit = (e) => {
    const name = e.target.value.trim();
    if (name) {
      dispatch({ type: 'CREATE_ITEM', payload: { groupId: group.id, boardId: board.id, name } });
    }
    e.target.value = '';
    setAddingItem(false);
  };

  return (
    <div className="group-section">
      {/* Group header */}
      <div className="group-header" onClick={handleToggleCollapse}>
        <div className="group-color-bar" style={{ background: group.color }} />
        <button className={`group-collapse-btn${group.isCollapsed ? ' collapsed' : ''}`}>
          &#x25BC;
        </button>
        <input
          className="group-title"
          style={{ color: group.color }}
          defaultValue={group.title}
          onClick={(e) => e.stopPropagation()}
          onBlur={handleTitleBlur}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
        />
        <span className="group-item-count">({items.length} items)</span>
      </div>

      {!group.isCollapsed && (
        <>
          {/* Column headers */}
          <div className="column-header-row">
            <div className="column-header-checkbox">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => dispatch({ type: 'TOGGLE_GROUP_ITEMS_SELECTED', payload: { groupId: group.id, selected: e.target.checked } })}
                aria-label={`Select all items in ${group.title}`}
              />
            </div>
            <div className="column-header-name" style={{ borderLeftColor: group.color }}>
              Item
            </div>
            {columns.map(col => (
              <div
                key={col.id}
                className="column-header-cell"
                style={{ width: col.width, minWidth: col.width }}
              >
                {col.title}
              </div>
            ))}
          </div>

          {/* Item rows */}
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              columns={columns}
              groupColor={group.color}
              allGroups={allGroups}
            />
          ))}

          {/* Add item row */}
          <div className="add-item-row">
            {addingItem ? (
              <input
                ref={addInputRef}
                className="item-name-input"
                placeholder="Enter item name..."
                onBlur={handleAddItemSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddItemSubmit(e);
                  if (e.key === 'Escape') { e.target.value = ''; setAddingItem(false); }
                }}
                style={{ width: 280 }}
              />
            ) : (
              <button className="add-item-btn" onClick={handleAddItem}>+ Add</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
