import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

export default function BoardHeader({ boardId }) {
  const { state, dispatch } = useAppContext();
  const board = state.boards[boardId];
  const [showSearch, setShowSearch] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [showHide, setShowHide] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const searchRef = useRef(null);
  const sortBtnRef = useRef(null);
  const filterBtnRef = useRef(null);
  const infoBtnRef = useRef(null);
  const peopleBtnRef = useRef(null);
  const hideBtnRef = useRef(null);
  const moreBtnRef = useRef(null);

  if (!board) return null;

  const activeView = board.views.find(v => v.id === state.ui.activeViewId) || board.views[0];
  const columns = board.columnIds.map(cid => state.columns[cid]).filter(Boolean);
  const sortConditions = state.ui.sortConditions || [];
  const filterConditions = state.ui.filterConditions || [];
  const hiddenColumns = new Set(state.ui.hiddenColumnsByBoard?.[boardId] || []);

  const handleNameBlur = (e) => {
    const newName = e.target.value.trim();
    if (newName && newName !== board.name) {
      dispatch({ type: 'UPDATE_BOARD_NAME', payload: { boardId, name: newName } });
    }
  };

  const handleDescBlur = (e) => {
    const desc = e.target.value;
    if (desc !== board.description) {
      dispatch({ type: 'UPDATE_BOARD_DESCRIPTION', payload: { boardId, description: desc } });
    }
  };

  const handleToggleFavorite = () => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { boardId } });
  };

  const handleViewClick = (viewId) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: { viewId } });
  };

  const handleNewItem = () => {
    const firstGroupId = board.groupIds.find(gid => !state.groups[gid]?.isCollapsed) || board.groupIds[0];
    if (firstGroupId) {
      dispatch({ type: 'CREATE_ITEM', payload: { groupId: firstGroupId, boardId, name: '' } });
    }
  };

  const handleSearchToggle = () => {
    if (showSearch) {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
      setShowSearch(false);
    } else {
      setShowSearch(true);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  };

  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  const handleAddSort = () => {
    const newSort = { columnId: columns[0]?.id || '', direction: 'asc' };
    dispatch({ type: 'SET_SORT_CONDITIONS', payload: [...sortConditions, newSort] });
  };

  const handleUpdateSort = (idx, field, value) => {
    const updated = sortConditions.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    dispatch({ type: 'SET_SORT_CONDITIONS', payload: updated });
  };

  const handleRemoveSort = (idx) => {
    dispatch({ type: 'SET_SORT_CONDITIONS', payload: sortConditions.filter((_, i) => i !== idx) });
  };

  const handleAddFilter = () => {
    const firstCol = columns[0];
    const newFilter = { columnId: firstCol?.id || '', condition: 'is_not_empty', value: '' };
    dispatch({ type: 'SET_FILTER_CONDITIONS', payload: [...filterConditions, newFilter] });
  };

  const handleUpdateFilter = (idx, field, value) => {
    const updated = filterConditions.map((f, i) => i === idx ? { ...f, [field]: value } : f);
    dispatch({ type: 'SET_FILTER_CONDITIONS', payload: updated });
  };

  const handleRemoveFilter = (idx) => {
    dispatch({ type: 'SET_FILTER_CONDITIONS', payload: filterConditions.filter((_, i) => i !== idx) });
  };

  const handleClearFilters = () => {
    dispatch({ type: 'SET_FILTER_CONDITIONS', payload: [] });
    setShowFilter(false);
  };

  const handleAddView = () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const hasKanban = board.views.some(view => view.type === 'kanban');
    dispatch({
      type: 'ADD_BOARD_VIEW',
      payload: {
        boardId,
        viewId: `view-${suffix}`,
        viewType: hasKanban ? 'table' : 'kanban',
      },
    });
  };

  const boardPeople = Array.from(new Set(
    board.groupIds.flatMap(groupId => {
      const group = state.groups[groupId];
      return (group?.itemIds || []).flatMap(itemId => {
        const item = state.items[itemId];
        if (!item || item.archivedAt) return [];
        return board.columnIds.flatMap(columnId => {
          const column = state.columns[columnId];
          const value = item.columnValues?.[columnId]?.value;
          return column?.type === 'people' && Array.isArray(value) ? value : [];
        });
      });
    })
  )).map(userId => state.users[userId]).filter(Boolean);

  const sortRect = sortBtnRef.current?.getBoundingClientRect();
  const filterRect = filterBtnRef.current?.getBoundingClientRect();
  const infoRect = infoBtnRef.current?.getBoundingClientRect();
  const peopleRect = peopleBtnRef.current?.getBoundingClientRect();
  const hideRect = hideBtnRef.current?.getBoundingClientRect();
  const moreRect = moreBtnRef.current?.getBoundingClientRect();

  return (
    <div className="board-header">
      {/* Row 1: Board name */}
      <div className="board-header-row1">
        <input
          className="board-name"
          defaultValue={board.name}
          onBlur={handleNameBlur}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
        />
        <button
          ref={infoBtnRef}
          className={`board-header-icon${showInfo ? ' active' : ''}`}
          title="Board info"
          onClick={() => setShowInfo(!showInfo)}
        >
          &#9432;
        </button>
        <button
          className={`board-header-icon${board.isFavorite ? ' favorite-active' : ''}`}
          onClick={handleToggleFavorite}
          title={board.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {board.isFavorite ? '\u2605' : '\u2606'}
        </button>
      </div>

      {/* Row 2: Description */}
      {board.description !== undefined && (
        <div className="board-header-row2">
          <input
            className="board-description"
            defaultValue={board.description}
            placeholder="Add board description"
            onBlur={handleDescBlur}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          />
        </div>
      )}

      {/* Row 3: View tabs */}
      <div className="board-view-tabs">
        {board.views.map(view => (
          <button
            key={view.id}
            className={`board-view-tab${view.id === activeView?.id ? ' active' : ''}`}
            onClick={() => handleViewClick(view.id)}
          >
            {view.type === 'table' && '\u2637 '}
            {view.type === 'kanban' && '\u2610 '}
            {view.name}
          </button>
        ))}
        <button className="view-tab-add" title="Add view" onClick={handleAddView}>+</button>
      </div>

      {/* Row 4: Toolbar */}
      <div className="board-toolbar">
        <button className="btn-new-item" onClick={handleNewItem}>
          <span>+</span> New Item
        </button>

        <div className="toolbar-separator" />

        <button
          className={`toolbar-btn${showSearch ? ' active' : ''}`}
          onClick={handleSearchToggle}
        >
          &#x1F50D; Search
        </button>

        {showSearch && (
          <div className="toolbar-search-wrapper">
            <input
              ref={searchRef}
              className="toolbar-search-input"
              placeholder="Search items..."
              value={state.ui.searchQuery}
              onChange={handleSearchChange}
              onKeyDown={e => e.key === 'Escape' && handleSearchToggle()}
            />
            {state.ui.searchQuery && (
              <button
                style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#676879' }}
                onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
              >
                &times;
              </button>
            )}
          </div>
        )}

        <button
          ref={peopleBtnRef}
          className={`toolbar-btn${showPeople ? ' active' : ''}`}
          onClick={() => setShowPeople(!showPeople)}
        >
          &#x1F464; Person
        </button>
        <button
          ref={filterBtnRef}
          className={`toolbar-btn${filterConditions.length > 0 ? ' active' : ''}`}
          onClick={() => setShowFilter(!showFilter)}
        >
          &#x25BD; Filter{filterConditions.length > 0 ? ` (${filterConditions.length})` : ''}
        </button>
        <button
          ref={sortBtnRef}
          className={`toolbar-btn${sortConditions.length > 0 ? ' active' : ''}`}
          onClick={() => setShowSort(!showSort)}
        >
          &#x2195; Sort{sortConditions.length > 0 ? ` (${sortConditions.length})` : ''}
        </button>
        <button
          ref={hideBtnRef}
          className={`toolbar-btn${showHide ? ' active' : ''}`}
          onClick={() => setShowHide(!showHide)}
        >
          &#x1F441; Hide
        </button>

        <div className="toolbar-spacer" />

        <button
          ref={moreBtnRef}
          className={`toolbar-btn${showMore ? ' active' : ''}`}
          onClick={() => setShowMore(!showMore)}
          title="More board actions"
        >
          &#x22EF;
        </button>
      </div>

      {showInfo && (
        <>
          <div className="popover-overlay" onClick={() => setShowInfo(false)} />
          <div className="popover board-action-popover" style={{ top: infoRect ? infoRect.bottom + 6 : 0, left: infoRect ? infoRect.left : 0 }}>
            <div className="sort-popover-header">Board info</div>
            <div className="board-action-row"><span>Workspace</span><strong>{state.workspaces[board.workspaceId]?.name || 'Workspace'}</strong></div>
            <div className="board-action-row"><span>Groups</span><strong>{board.groupIds.length}</strong></div>
            <div className="board-action-row"><span>Views</span><strong>{board.views.length}</strong></div>
          </div>
        </>
      )}

      {showPeople && (
        <>
          <div className="popover-overlay" onClick={() => setShowPeople(false)} />
          <div className="popover board-action-popover" style={{ top: peopleRect ? peopleRect.bottom + 6 : 0, left: peopleRect ? peopleRect.left : 0 }}>
            <div className="sort-popover-header">People on this board</div>
            {boardPeople.length === 0 ? (
              <div className="sort-popover-empty">No people assigned</div>
            ) : boardPeople.map(user => (
              <div key={user.id} className="board-action-person">
                <span style={{ background: user.color }}>{user.initials}</span>
                <div>{user.name}<small>{user.email}</small></div>
              </div>
            ))}
          </div>
        </>
      )}

      {showHide && (
        <>
          <div className="popover-overlay" onClick={() => setShowHide(false)} />
          <div className="popover board-action-popover" style={{ top: hideRect ? hideRect.bottom + 6 : 0, left: hideRect ? hideRect.left : 0 }}>
            <div className="sort-popover-header">Visible columns</div>
            {columns.map(col => (
              <label key={col.id} className="board-action-check">
                <input
                  type="checkbox"
                  checked={!hiddenColumns.has(col.id)}
                  onChange={() => dispatch({ type: 'TOGGLE_COLUMN_HIDDEN', payload: { boardId, columnId: col.id } })}
                />
                {col.title}
              </label>
            ))}
          </div>
        </>
      )}

      {showMore && (
        <>
          <div className="popover-overlay" onClick={() => setShowMore(false)} />
          <div className="popover board-action-popover" style={{ top: moreRect ? moreRect.bottom + 6 : 0, left: moreRect ? Math.max(8, moreRect.right - 240) : 0 }}>
            <div className="sort-popover-header">Board actions</div>
            <button className="board-action-button" onClick={() => { dispatch({ type: 'CREATE_GROUP', payload: { boardId, title: 'New Group' } }); setShowMore(false); }}>
              Add group
            </button>
            <button className="board-action-button" onClick={() => { handleToggleFavorite(); setShowMore(false); }}>
              {board.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </button>
            <button className="board-action-button" onClick={() => { handleAddView(); setShowMore(false); }}>
              Add view
            </button>
          </div>
        </>
      )}

      {/* Sort popover */}
      {showSort && (
        <>
          <div className="popover-overlay" onClick={() => setShowSort(false)} />
          <div
            className="popover sort-popover"
            style={{
              top: sortRect ? sortRect.bottom + 4 : 0,
              left: sortRect ? sortRect.left : 0,
            }}
          >
            <div className="sort-popover-header">Sort by</div>
            {sortConditions.length === 0 && (
              <div className="sort-popover-empty">No sort applied</div>
            )}
            {sortConditions.map((sort, idx) => (
              <div key={idx} className="sort-condition-row">
                <select
                  className="sort-select"
                  value={sort.columnId}
                  onChange={(e) => handleUpdateSort(idx, 'columnId', e.target.value)}
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
                <select
                  className="sort-select small"
                  value={sort.direction}
                  onChange={(e) => handleUpdateSort(idx, 'direction', e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
                <button className="sort-remove-btn" onClick={() => handleRemoveSort(idx)}>&times;</button>
              </div>
            ))}
            <button className="sort-add-btn" onClick={handleAddSort}>
              + Add another sort
            </button>
          </div>
        </>
      )}

      {/* Filter popover */}
      {showFilter && (
        <>
          <div className="popover-overlay" onClick={() => setShowFilter(false)} />
          <div
            className="popover filter-popover"
            style={{
              top: filterRect ? filterRect.bottom + 4 : 0,
              left: filterRect ? filterRect.left : 0,
            }}
          >
            <div className="sort-popover-header">Filter</div>
            {filterConditions.length === 0 && (
              <div className="sort-popover-empty">No filters applied</div>
            )}
            {filterConditions.map((filter, idx) => (
              <div key={idx} className="sort-condition-row">
                <span className="filter-where">{idx === 0 ? 'Where' : 'And'}</span>
                <select
                  className="sort-select"
                  value={filter.columnId}
                  onChange={(e) => handleUpdateFilter(idx, 'columnId', e.target.value)}
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
                <select
                  className="sort-select"
                  value={filter.condition}
                  onChange={(e) => handleUpdateFilter(idx, 'condition', e.target.value)}
                >
                  <option value="is">is</option>
                  <option value="is_not">is not</option>
                  <option value="contains">contains</option>
                  <option value="is_empty">is empty</option>
                  <option value="is_not_empty">is not empty</option>
                </select>
                {filter.condition !== 'is_empty' && filter.condition !== 'is_not_empty' && (
                  <input
                    className="filter-value-input"
                    type="text"
                    value={filter.value || ''}
                    placeholder="Value..."
                    onChange={(e) => handleUpdateFilter(idx, 'value', e.target.value)}
                  />
                )}
                <button className="sort-remove-btn" onClick={() => handleRemoveFilter(idx)}>&times;</button>
              </div>
            ))}
            <div className="filter-popover-actions">
              <button className="sort-add-btn" onClick={handleAddFilter}>
                + Add another filter
              </button>
              {filterConditions.length > 0 && (
                <button className="filter-clear-btn" onClick={handleClearFilters}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
