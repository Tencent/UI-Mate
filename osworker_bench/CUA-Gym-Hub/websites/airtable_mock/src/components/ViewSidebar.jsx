import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Grid, Columns, Image, FileText, Calendar, Plus, X, Check } from 'lucide-react';
import { cn, generateId } from '../lib/utils';

const getViewIcon = (type, size = 14) => {
  switch (type) {
    case 'grid': return <Grid size={size} />;
    case 'kanban': return <Columns size={size} />;
    case 'gallery': return <Image size={size} />;
    case 'form': return <FileText size={size} />;
    case 'calendar': return <Calendar size={size} />;
    default: return <Grid size={size} />;
  }
};

const VIEW_TYPES = [
  { type: 'grid', label: 'Grid' },
  { type: 'kanban', label: 'Kanban' },
  { type: 'gallery', label: 'Gallery' },
  { type: 'form', label: 'Form' },
  { type: 'calendar', label: 'Calendar' },
];

// Inline name input for creating a new view
const NewViewForm = ({ viewType, onConfirm, onCancel }) => {
  const [name, setName] = useState(`${viewType.label} view`);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div className="px-3 py-2 bg-blue-50 border-t border-b border-blue-100">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-blue-500">{getViewIcon(viewType.type)}</span>
        <span className="text-xs font-semibold text-blue-700">New {viewType.label} view</span>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <input
          autoFocus
          type="text"
          className="flex-1 border border-blue-300 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 bg-white"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && onCancel()}
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-40"
        >
          <Check size={13} />
        </button>
        <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
          <X size={13} />
        </button>
      </form>
    </div>
  );
};

const ViewSidebar = () => {
  const { state, dispatch, ACTIONS } = useStore();
  const [creatingViewType, setCreatingViewType] = useState(null);

  if (!state.ui?.viewSidebarOpen) return null;

  const activeTable = state.tables[state.activeTableId];
  if (!activeTable) return null;

  const activeView = activeTable.views.find(v => v.id === activeTable.activeViewId) || activeTable.views[0];

  const handleViewClick = (viewId) => {
    dispatch({
      type: ACTIONS.SET_ACTIVE_VIEW,
      payload: { tableId: activeTable.id, viewId }
    });
  };

  const handleCreateView = (type, name) => {
    const newViewId = generateId('view');
    const newView = {
      id: newViewId,
      name,
      type,
      filters: [],
      sorts: [],
      groupBy: [],
      hiddenFieldIds: [],
      fieldWidths: {},
      rowHeight: 'short',
    };

    if (type === 'kanban') {
      const selectField = activeTable.fields.find(f => f.type === 'single_select');
      if (selectField) newView.groupFieldId = selectField.id;
    }
    if (type === 'calendar') {
      const dateField = activeTable.fields.find(f => f.type === 'date');
      if (dateField) newView.dateFieldId = dateField.id;
    }

    dispatch({
      type: 'CREATE_VIEW',
      payload: { tableId: activeTable.id, view: newView }
    });
    setCreatingViewType(null);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</span>
        <button
          onClick={() => dispatch({ type: ACTIONS.TOGGLE_VIEW_SIDEBAR })}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* View list */}
      <div className="flex-1 overflow-y-auto py-1">
        {activeTable.views.map(view => {
          const isActive = view.id === activeView?.id;
          return (
            <div
              key={view.id}
              onClick={() => handleViewClick(view.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors text-sm",
                isActive
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className={cn("shrink-0", isActive ? "text-primary" : "text-gray-400")}>
                {getViewIcon(view.type)}
              </span>
              <span className="truncate flex-1">{view.name}</span>
              {isActive && <Check size={12} className="text-primary shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Inline view name entry */}
      {creatingViewType && (
        <NewViewForm
          viewType={creatingViewType}
          onConfirm={(name) => handleCreateView(creatingViewType.type, name)}
          onCancel={() => setCreatingViewType(null)}
        />
      )}

      {/* Create view section */}
      <div className="border-t border-gray-100 py-2">
        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Create...</div>
        {VIEW_TYPES.map(vt => (
          <button
            key={vt.type}
            onClick={() => setCreatingViewType(vt)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors",
              creatingViewType?.type === vt.type && "bg-blue-50 text-blue-600"
            )}
          >
            <span className="text-gray-400">{getViewIcon(vt.type)}</span>
            <span>{vt.label}</span>
            <Plus size={12} className="ml-auto text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ViewSidebar;
