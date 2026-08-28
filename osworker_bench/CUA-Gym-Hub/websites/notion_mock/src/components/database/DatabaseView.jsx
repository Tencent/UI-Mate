import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Link } from 'react-router-dom';
import { generateId } from '../../utils/helpers';
import { Plus, X, ChevronDown, ChevronLeft, ChevronRight, Filter, ArrowUpDown, Search, MoreHorizontal, Trash2, Eye, EyeOff, Pencil, Maximize2 } from 'lucide-react';
import clsx from 'clsx';

// --- Shared Cell Components ---

const EditableTextCell = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== (value || '')) onSave(draft);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-full bg-white border border-blue-400 rounded px-1 py-0.5 text-sm text-gray-900 outline-none"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value || ''); setEditing(false); }
        }}
      />
    );
  }
  return (
    <span className="block w-full min-h-[20px] cursor-text hover:bg-gray-100 rounded px-1 py-0.5" onClick={() => { setDraft(value || ''); setEditing(true); }}>
      {value || '-'}
    </span>
  );
};

const colorForOption = (opt) => {
  if (opt === 'Done' || opt === 'Finished') return 'bg-green-100 text-green-700';
  if (opt === 'In Progress' || opt === 'Reading') return 'bg-blue-100 text-blue-700';
  if (opt === 'Not Started' || opt === 'Want to Read') return 'bg-gray-100 text-gray-700';
  if (opt === 'High') return 'bg-red-100 text-red-700';
  if (opt === 'Medium') return 'bg-yellow-100 text-yellow-700';
  if (opt === 'Low') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
};

const SelectCell = ({ value, options, onSave }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <span className="inline-block cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 min-h-[20px] min-w-[40px]" onClick={() => setOpen(!open)}>
        {value ? <span className={clsx('px-2 py-0.5 rounded-sm text-xs font-medium', colorForOption(value))}>{value}</span> : <span className="text-gray-400">-</span>}
      </span>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[160px]">
          {options.map(opt => (
            <div key={opt} className={clsx('px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center', value === opt && 'bg-gray-50')}
              onClick={() => { onSave(opt); setOpen(false); }}>
              <span className={clsx('px-2 py-0.5 rounded-sm text-xs font-medium', colorForOption(opt))}>{opt}</span>
            </div>
          ))}
          {value && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <div className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 text-gray-400" onClick={() => { onSave(''); setOpen(false); }}>Clear</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const MultiSelectCell = ({ value, options, onSave }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = Array.isArray(value) ? value : [];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (opt) => {
    const newVal = selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt];
    onSave(newVal);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex flex-wrap gap-1 cursor-pointer min-h-[24px] px-1 py-0.5 hover:bg-gray-100 rounded" onClick={() => setOpen(!open)}>
        {selected.length > 0 ? selected.map(s => (
          <span key={s} className={clsx('px-1.5 py-0.5 rounded text-xs font-medium', colorForOption(s))}>{s}</span>
        )) : <span className="text-gray-400 text-sm">-</span>}
      </div>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[180px]">
          {options.map(opt => (
            <label key={opt} className="flex items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="mr-2" />
              <span className={clsx('px-2 py-0.5 rounded-sm text-xs font-medium', colorForOption(opt))}>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CheckboxCell = ({ value, onSave }) => (
  <div className="flex items-center justify-center cursor-pointer" onClick={() => onSave(!value)}>
    <div className={clsx('w-4 h-4 border rounded flex items-center justify-center transition-colors',
      value ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400 hover:bg-gray-100')}>
      {value && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
    </div>
  </div>
);

const UrlCell = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);

  if (editing) {
    return <input ref={inputRef} className="w-full bg-white border border-blue-400 rounded px-1 py-0.5 text-sm outline-none"
      value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); onSave(draft); }}
      onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onSave(draft); } if (e.key === 'Escape') setEditing(false); }} />;
  }
  return value ? (
    <div className="flex items-center gap-1">
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate">{value}</a>
      <button className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0" onClick={() => { setDraft(value); setEditing(true); }}>edit</button>
    </div>
  ) : <span className="text-gray-400 cursor-text hover:bg-gray-100 rounded px-1 py-0.5 block" onClick={() => setEditing(true)}>-</span>;
};

// --- Render any cell by property type ---
const renderCell = (item, prop, onSave) => {
  const value = item.properties?.[prop.id];
  switch (prop.type) {
    case 'select':
    case 'status':
      return <SelectCell value={value || ''} options={prop.options || []} onSave={(v) => onSave(item.id, prop.id, v)} />;
    case 'multi-select':
      return <MultiSelectCell value={value} options={prop.options || []} onSave={(v) => onSave(item.id, prop.id, v)} />;
    case 'checkbox':
      return <CheckboxCell value={!!value} onSave={(v) => onSave(item.id, prop.id, v)} />;
    case 'url':
      return <UrlCell value={value || ''} onSave={(v) => onSave(item.id, prop.id, v)} />;
    case 'number':
      return <EditableTextCell value={value != null ? String(value) : ''} onSave={(v) => onSave(item.id, prop.id, v)} />;
    case 'person':
      return <span className="text-sm text-gray-600">{Array.isArray(value) ? value.join(', ') || '-' : '-'}</span>;
    case 'created_time':
      return <span className="text-xs text-gray-500">{item.createdDate ? new Date(item.createdDate).toLocaleDateString() : '-'}</span>;
    case 'last_edited_time':
      return <span className="text-xs text-gray-500">{item.lastEditedDate ? new Date(item.lastEditedDate).toLocaleDateString() : '-'}</span>;
    default:
      return <EditableTextCell value={Array.isArray(value) ? value.join(', ') : (value || '')} onSave={(v) => onSave(item.id, prop.id, v)} />;
  }
};

// --- Filter logic ---
const applyFilters = (items, filters, properties) => {
  if (!filters || filters.length === 0) return items;
  return items.filter(item => {
    return filters.every(f => {
      const val = item.properties?.[f.propertyId];
      const prop = properties.find(p => p.id === f.propertyId);
      if (!prop) return true;
      const strVal = Array.isArray(val) ? val.join(', ') : String(val || '');
      switch (f.operator) {
        case 'is': return strVal === f.value;
        case 'is_not': return strVal !== f.value;
        case 'contains': return strVal.toLowerCase().includes((f.value || '').toLowerCase());
        case 'does_not_contain': return !strVal.toLowerCase().includes((f.value || '').toLowerCase());
        case 'is_empty': return !val || (Array.isArray(val) && val.length === 0) || val === '';
        case 'is_not_empty': return val && (!Array.isArray(val) || val.length > 0) && val !== '';
        default: return true;
      }
    });
  });
};

// --- Sort logic ---
const applySorts = (items, sorts, properties) => {
  if (!sorts || sorts.length === 0) return items;
  return [...items].sort((a, b) => {
    for (const s of sorts) {
      const prop = properties.find(p => p.id === s.propertyId);
      if (!prop) continue;
      let aVal = a.properties?.[s.propertyId] || '';
      let bVal = b.properties?.[s.propertyId] || '';
      if (Array.isArray(aVal)) aVal = aVal.join(', ');
      if (Array.isArray(bVal)) bVal = bVal.join(', ');
      let cmp = 0;
      if (prop.type === 'number') {
        cmp = (parseFloat(aVal) || 0) - (parseFloat(bVal) || 0);
      } else if (prop.type === 'date') {
        cmp = new Date(aVal || 0) - new Date(bVal || 0);
      } else if (prop.type === 'select' && prop.options) {
        cmp = (prop.options.indexOf(aVal) || 0) - (prop.options.indexOf(bVal) || 0);
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      if (cmp !== 0) return s.direction === 'descending' ? -cmp : cmp;
    }
    return 0;
  });
};

// --- Filter Bar ---
const FilterBar = ({ filters, onUpdate, onRemove, onAdd, properties }) => {
  const operatorsByType = {
    text: ['contains', 'does_not_contain', 'is', 'is_not', 'is_empty', 'is_not_empty'],
    select: ['is', 'is_not', 'is_empty', 'is_not_empty'],
    'multi-select': ['contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
    status: ['is', 'is_not', 'is_empty', 'is_not_empty'],
    number: ['is', 'is_not', 'is_empty', 'is_not_empty'],
    date: ['is', 'is_not', 'is_empty', 'is_not_empty'],
    person: ['is_empty', 'is_not_empty'],
    checkbox: ['is', 'is_not'],
    url: ['contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-1">
      {filters.map((f, idx) => {
        const prop = properties.find(p => p.id === f.propertyId);
        const ops = operatorsByType[prop?.type || 'text'] || operatorsByType.text;
        return (
          <div key={f.id} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs">
            <select className="bg-transparent outline-none text-gray-700" value={f.propertyId}
              onChange={e => onUpdate(idx, { ...f, propertyId: e.target.value, value: '' })}>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="bg-transparent outline-none text-gray-500" value={f.operator}
              onChange={e => onUpdate(idx, { ...f, operator: e.target.value })}>
              {ops.map(op => <option key={op} value={op}>{op.replace(/_/g, ' ')}</option>)}
            </select>
            {!['is_empty', 'is_not_empty'].includes(f.operator) && (
              prop?.type === 'select' || prop?.type === 'status' ? (
                <select className="bg-transparent outline-none text-gray-700 max-w-[120px]" value={f.value || ''}
                  onChange={e => onUpdate(idx, { ...f, value: e.target.value })}>
                  <option value="">---</option>
                  {(prop.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input className="bg-white border border-gray-200 rounded px-1 w-24 outline-none" value={f.value || ''}
                  onChange={e => onUpdate(idx, { ...f, value: e.target.value })} placeholder="value" />
              )
            )}
            <button className="text-gray-400 hover:text-red-500 ml-1" onClick={() => onRemove(idx)}><X size={12} /></button>
          </div>
        );
      })}
      <button className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded" onClick={onAdd}>+ Add filter</button>
    </div>
  );
};

// --- Sort Bar ---
const SortBar = ({ sorts, onUpdate, onRemove, onAdd, properties }) => (
  <div className="flex flex-wrap items-center gap-2 py-2 px-1">
    {sorts.map((s, idx) => (
      <div key={s.id} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs">
        <select className="bg-transparent outline-none text-gray-700" value={s.propertyId}
          onChange={e => onUpdate(idx, { ...s, propertyId: e.target.value })}>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="bg-transparent outline-none text-gray-500" value={s.direction}
          onChange={e => onUpdate(idx, { ...s, direction: e.target.value })}>
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
        <button className="text-gray-400 hover:text-red-500 ml-1" onClick={() => onRemove(idx)}><X size={12} /></button>
      </div>
    ))}
    <button className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded" onClick={onAdd}>+ Add sort</button>
  </div>
);

// --- Column Header Menu (Property Management) ---
const ColumnHeaderMenu = ({ prop, dbId, onClose }) => {
  const { updateProperty, deleteProperty } = useStore();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(prop.name);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => { if (renaming && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [renaming]);

  if (renaming) {
    return (
      <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 min-w-[200px]">
        <input ref={inputRef} className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { updateProperty(dbId, prop.id, { name }); onClose(); } if (e.key === 'Escape') onClose(); }}
          onBlur={() => { updateProperty(dbId, prop.id, { name }); onClose(); }} />
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] text-sm">
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700"
        onClick={() => setRenaming(true)}>
        <Pencil size={14} className="mr-2 text-gray-500" /> Rename
      </button>
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-red-600"
        onClick={() => { deleteProperty(dbId, prop.id); onClose(); }}>
        <Trash2 size={14} className="mr-2" /> Delete property
      </button>
    </div>
  );
};

// --- Add Property Menu ---
const AddPropertyMenu = ({ dbId, onClose }) => {
  const { addProperty } = useStore();
  const ref = useRef(null);
  const types = [
    { type: 'text', label: 'Text' }, { type: 'number', label: 'Number' },
    { type: 'select', label: 'Select' }, { type: 'multi-select', label: 'Multi-select' },
    { type: 'status', label: 'Status' }, { type: 'date', label: 'Date' },
    { type: 'person', label: 'Person' }, { type: 'checkbox', label: 'Checkbox' },
    { type: 'url', label: 'URL' },
  ];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleAdd = (type) => {
    const prop = {
      id: generateId(),
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
    };
    if (type === 'select' || type === 'multi-select') prop.options = [];
    if (type === 'status') prop.options = ['To-do', 'In Progress', 'Done'];
    addProperty(dbId, prop);
    onClose();
  };

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] text-sm">
      <div className="px-3 py-1 text-xs font-medium text-gray-500">Property type</div>
      {types.map(t => (
        <button key={t.type} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-gray-700"
          onClick={() => handleAdd(t.type)}>{t.label}</button>
      ))}
    </div>
  );
};

// --- Table View ---
const TableView = ({ database, activeView }) => {
  const { state, updateDbItem, addDbItem, updatePage } = useStore();
  const [headerMenu, setHeaderMenu] = useState(null);
  const [showAddProp, setShowAddProp] = useState(false);
  const allItems = database.items.map(id => state.pages[id]).filter(Boolean);
  const visibleProps = activeView?.visibleProperties
    ? database.properties.filter(p => activeView.visibleProperties.includes(p.id))
    : database.properties;

  let items = applyFilters(allItems, activeView?.filters, database.properties);
  items = applySorts(items, activeView?.sorts, database.properties);

  const handleCellSave = (itemId, propertyId, value) => updateDbItem(database.id, itemId, propertyId, value);

  return (
    <div className="overflow-x-auto border-t border-r border-l border-gray-200 rounded-sm mt-4">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 font-medium">
          <tr>
            <th className="px-3 py-2 border-b border-r w-1/4">Name</th>
            {visibleProps.map(prop => (
              <th key={prop.id} className="px-3 py-2 border-b border-r min-w-[140px] relative cursor-pointer hover:bg-gray-100"
                onClick={() => setHeaderMenu(headerMenu === prop.id ? null : prop.id)}>
                {prop.name}
                {headerMenu === prop.id && (
                  <ColumnHeaderMenu prop={prop} dbId={database.id} onClose={() => setHeaderMenu(null)} />
                )}
              </th>
            ))}
            <th className="px-2 py-2 border-b w-8 relative">
              <button className="text-gray-400 hover:text-gray-600 text-lg" onClick={() => setShowAddProp(true)}>+</button>
              {showAddProp && <AddPropertyMenu dbId={database.id} onClose={() => setShowAddProp(false)} />}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-50 group">
              <td className="px-3 py-2 border-b border-r">
                {/* Name cell: title is edited INLINE (click = edit, not
                    navigate). Opening the row page is an explicit hover-only
                    icon, so clicking the name no longer traps into an empty
                    sub-document. */}
                <div className="flex items-center group/name">
                  <span className="mr-2 flex-shrink-0">{item.icon || '\u{1F4C4}'}</span>
                  <div className="flex-1 min-w-0 font-medium text-gray-900">
                    <EditableTextCell value={item.title} onSave={(v) => updatePage(item.id, { title: v })} />
                  </div>
                  <Link
                    to={`/page/${item.id}`}
                    className="ml-1 flex-shrink-0 opacity-0 group-hover/name:opacity-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded p-0.5 transition-opacity"
                    title="Open page"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Maximize2 size={13} />
                  </Link>
                </div>
              </td>
              {visibleProps.map(prop => (
                <td key={prop.id} className="px-3 py-2 border-b border-r text-gray-600">
                  {renderCell(item, prop, handleCellSave)}
                </td>
              ))}
              <td className="border-b" />
            </tr>
          ))}
          <tr>
            <td colSpan={visibleProps.length + 2} className="px-3 py-2 text-gray-400 hover:bg-gray-50 cursor-pointer border-b"
              onClick={() => addDbItem(database.id)}>+ New</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// --- Board View ---
const BoardView = ({ database, activeView }) => {
  const { state, addDbItem, updateDbItem } = useStore();
  const allItems = database.items.map(id => state.pages[id]).filter(Boolean);
  let items = applyFilters(allItems, activeView?.filters, database.properties);
  items = applySorts(items, activeView?.sorts, database.properties);

  const groupPropId = activeView?.groupBy || database.properties.find(p => p.type === 'select')?.id;
  const groupProp = database.properties.find(p => p.id === groupPropId);
  const groups = groupProp ? groupProp.options : ['No Status'];

  const [dragItem, setDragItem] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);

  const handleDragStart = (e, itemId) => {
    setDragItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, group) => {
    e.preventDefault();
    setDragOverGroup(group);
  };

  const handleDrop = (e, group) => {
    e.preventDefault();
    if (dragItem && groupProp) {
      updateDbItem(database.id, dragItem, groupProp.id, group);
    }
    setDragItem(null);
    setDragOverGroup(null);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setDragOverGroup(null);
  };

  const visibleProps = activeView?.visibleProperties
    ? database.properties.filter(p => activeView.visibleProperties.includes(p.id) && p.id !== groupPropId)
    : database.properties.filter(p => p.id !== groupPropId);

  return (
    <div className="flex overflow-x-auto pb-4 mt-6 gap-4">
      {groups.map(group => {
        const groupItems = items.filter(item => {
          const val = item.properties?.[groupPropId];
          return val === group || (!val && group === 'No Status');
        });
        return (
          <div key={group} className="min-w-[260px] w-[260px]"
            onDragOver={(e) => handleDragOver(e, group)}
            onDrop={(e) => handleDrop(e, group)}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center">
                <span className={clsx('px-2 py-0.5 rounded-sm text-xs font-medium mr-2', colorForOption(group))}>{group}</span>
                <span className="text-gray-400 text-xs">{groupItems.length}</span>
              </div>
              <div className="text-gray-400 hover:bg-gray-100 p-1 rounded cursor-pointer" onClick={() => addDbItem(database.id)}>+</div>
            </div>
            <div className={clsx('space-y-2 min-h-[40px] rounded-md transition-colors', dragOverGroup === group && 'bg-blue-50 border border-blue-200 border-dashed')}>
              {groupItems.map(item => (
                <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item.id)} onDragEnd={handleDragEnd}
                  className={clsx('block bg-white p-3 rounded shadow-sm border border-gray-200 hover:bg-gray-50 transition-all cursor-grab active:cursor-grabbing',
                    dragItem === item.id && 'opacity-50 shadow-md')}>
                  <Link to={`/page/${item.id}`} className="block">
                    <div className="flex items-center mb-2">
                      <span className="mr-2 text-lg">{item.icon || '\u{1F4C4}'}</span>
                      <span className="font-medium text-sm text-gray-900">{item.title}</span>
                    </div>
                    <div className="space-y-1">
                      {visibleProps.slice(0, 3).map(prop => {
                        const val = item.properties?.[prop.id];
                        if (!val || (Array.isArray(val) && val.length === 0)) return null;
                        return (
                          <div key={prop.id} className="text-xs text-gray-500 flex items-center">
                            {prop.type === 'date' && <span className="mr-1">{'\u{1F4C5}'}</span>}
                            {prop.type === 'person' && <span className="mr-1">{'\u{1F464}'}</span>}
                            {prop.type === 'select' || prop.type === 'status' ? (
                              <span className={clsx('px-1.5 py-0.5 rounded text-xs', colorForOption(val))}>{val}</span>
                            ) : Array.isArray(val) ? val.length + ' items' : String(val)}
                          </div>
                        );
                      })}
                    </div>
                  </Link>
                </div>
              ))}
              <div className="text-gray-400 text-sm p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => addDbItem(database.id)}>+ New</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- List View ---
const ListView = ({ database, activeView }) => {
  const { state, addDbItem } = useStore();
  const allItems = database.items.map(id => state.pages[id]).filter(Boolean);
  let items = applyFilters(allItems, activeView?.filters, database.properties);
  items = applySorts(items, activeView?.sorts, database.properties);

  const visibleProps = activeView?.visibleProperties
    ? database.properties.filter(p => activeView.visibleProperties.includes(p.id))
    : database.properties.slice(0, 3);

  return (
    <div className="mt-4">
      {items.map(item => (
        <Link to={`/page/${item.id}`} key={item.id}
          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-100 group min-h-[36px]">
          <div className="flex items-center min-w-0">
            <span className="mr-2 text-lg flex-shrink-0">{item.icon || '\u{1F4C4}'}</span>
            <span className="font-medium text-sm text-gray-900 truncate">{item.title}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {visibleProps.slice(0, 3).map(prop => {
              const val = item.properties?.[prop.id];
              if (!val || (Array.isArray(val) && val.length === 0)) return null;
              return (
                <span key={prop.id} className="text-xs">
                  {(prop.type === 'select' || prop.type === 'status') ? (
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', colorForOption(val))}>{val}</span>
                  ) : prop.type === 'date' ? (
                    <span className="text-gray-500">{val}</span>
                  ) : prop.type === 'checkbox' ? (
                    <span>{val ? '\u2705' : '\u2B1C'}</span>
                  ) : (
                    <span className="text-gray-500">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                  )}
                </span>
              );
            })}
          </div>
        </Link>
      ))}
      <div className="px-3 py-2 text-gray-400 hover:bg-gray-50 cursor-pointer text-sm" onClick={() => addDbItem(database.id)}>+ New</div>
    </div>
  );
};

// --- Gallery View ---
const GalleryView = ({ database, activeView }) => {
  const { state, addDbItem } = useStore();
  const allItems = database.items.map(id => state.pages[id]).filter(Boolean);
  let items = applyFilters(allItems, activeView?.filters, database.properties);
  items = applySorts(items, activeView?.sorts, database.properties);

  const visibleProps = activeView?.visibleProperties
    ? database.properties.filter(p => activeView.visibleProperties.includes(p.id))
    : database.properties.slice(0, 2);

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {items.map(item => {
        const page = state.pages[item.id];
        const cover = page?.cover;
        return (
          <Link to={`/page/${item.id}`} key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-[120px] bg-gray-50 flex items-center justify-center">
              {cover ? (
                <img src={cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{item.icon || '\u{1F4C4}'}</span>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center mb-1">
                <span className="mr-1.5 text-lg">{item.icon || '\u{1F4C4}'}</span>
                <span className="font-medium text-sm text-gray-900 truncate">{item.title}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {visibleProps.slice(0, 2).map(prop => {
                  const val = item.properties?.[prop.id];
                  if (!val || (Array.isArray(val) && val.length === 0)) return null;
                  return (
                    <span key={prop.id} className="text-xs">
                      {(prop.type === 'select' || prop.type === 'status') ? (
                        <span className={clsx('px-1.5 py-0.5 rounded text-xs', colorForOption(val))}>{val}</span>
                      ) : (
                        <span className="text-gray-500">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </Link>
        );
      })}
      <div className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center h-[200px] hover:bg-gray-50 cursor-pointer text-gray-400"
        onClick={() => addDbItem(database.id)}>
        <div className="text-center">
          <Plus size={24} className="mx-auto mb-1" />
          <span className="text-sm">New</span>
        </div>
      </div>
    </div>
  );
};

// --- Calendar View ---
const CalendarView = ({ database, activeView }) => {
  const { state, addDbItem, addProperty } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const allItems = database.items.map(id => state.pages[id]).filter(Boolean);
  let items = applyFilters(allItems, activeView?.filters, database.properties);

  // Find date property
  const dateProp = database.properties.find(p => p.type === 'date');
  if (!dateProp) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <div className="text-sm font-medium text-gray-700">Calendar needs a date property</div>
        <div className="mt-1 text-sm text-gray-500">Add one locally and this view will immediately place items on the calendar.</div>
        <button
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          onClick={() => addProperty(database.id, { id: generateId(), name: 'Date', type: 'date' })}
        >
          Add Date Property
        </button>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const weeks = [];
  let day = 1 - startDow;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const currentDay = day;
      let dateObj;
      let isCurrentMonth = true;
      if (currentDay < 1) {
        dateObj = new Date(year, month - 1, daysInPrevMonth + currentDay);
        isCurrentMonth = false;
      } else if (currentDay > daysInMonth) {
        dateObj = new Date(year, month + 1, currentDay - daysInMonth);
        isCurrentMonth = false;
      } else {
        dateObj = new Date(year, month, currentDay);
      }
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayItems = items.filter(item => {
        const val = item.properties?.[dateProp.id];
        return val === dateStr;
      });
      const isToday = dateObj.toDateString() === today.toDateString();
      week.push({ day: dateObj.getDate(), dateStr, items: dayItems, isCurrentMonth, isToday });
      day++;
    }
    weeks.push(week);
    if (day > daysInMonth && weeks.length >= 5) break;
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{monthNames[month]} {year}</h3>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft size={18} /></button>
          <button className="text-sm px-2 py-1 hover:bg-gray-100 rounded" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {dayLabels.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-2 border-b border-gray-200">{d}</div>)}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((cell, di) => (
              <div key={di} className={clsx('min-h-[80px] border-b border-r border-gray-200 p-1',
                !cell.isCurrentMonth && 'bg-gray-50')}>
                <div className="flex items-center justify-between">
                  <span className={clsx('text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    cell.isToday ? 'bg-blue-500 text-white' : cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-400')}>
                    {cell.day}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {cell.items.slice(0, 3).map(item => (
                    <Link to={`/page/${item.id}`} key={item.id}
                      className="block text-xs px-1 py-0.5 bg-blue-50 text-blue-700 rounded truncate hover:bg-blue-100 cursor-pointer">
                      {item.title}
                    </Link>
                  ))}
                  {cell.items.length > 3 && <span className="text-xs text-gray-400">+{cell.items.length - 3} more</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Add View Dropdown ---
const AddViewDropdown = ({ onAdd, onClose }) => {
  const ref = useRef(null);
  const viewTypes = [
    { type: 'table', label: 'Table' },
    { type: 'board', label: 'Board' },
    { type: 'list', label: 'List' },
    { type: 'gallery', label: 'Gallery' },
    { type: 'calendar', label: 'Calendar' },
  ];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px] text-sm">
      {viewTypes.map(v => (
        <button key={v.type} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-gray-700"
          onClick={() => { onAdd(v.type); onClose(); }}>{v.label}</button>
      ))}
    </div>
  );
};

// --- Main DatabaseView ---
export const DatabaseView = ({ pageId }) => {
  const { state, addView, updateView, deleteView } = useStore();
  const database = state.pages[pageId];
  const [activeViewId, setActiveViewId] = useState(null);
  const [showAddView, setShowAddView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSorts, setShowSorts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  if (!database || database.type !== 'database') return null;

  const views = database.views || [];
  const activeView = views.find(v => v.id === activeViewId) || views[0] || { type: database.viewType || 'table', filters: [], sorts: [], visibleProperties: database.properties.map(p => p.id) };
  const currentViewId = activeView.id;

  const handleAddView = (type) => {
    const groupProp = database.properties.find(p => p.type === 'select');
    const newView = {
      id: generateId(),
      name: type.charAt(0).toUpperCase() + type.slice(1) + ' View',
      type,
      filters: [],
      sorts: [],
      groupBy: type === 'board' && groupProp ? groupProp.id : null,
      visibleProperties: database.properties.map(p => p.id),
    };
    addView(pageId, newView);
    setActiveViewId(newView.id);
  };

  // Filter handlers
  const handleAddFilter = () => {
    if (!currentViewId) return;
    const firstProp = database.properties[0];
    if (!firstProp) return;
    const newFilter = { id: generateId(), propertyId: firstProp.id, operator: 'contains', value: '' };
    const newFilters = [...(activeView.filters || []), newFilter];
    updateView(pageId, currentViewId, { filters: newFilters });
  };

  const handleUpdateFilter = (idx, filter) => {
    if (!currentViewId) return;
    const newFilters = [...(activeView.filters || [])];
    newFilters[idx] = filter;
    updateView(pageId, currentViewId, { filters: newFilters });
  };

  const handleRemoveFilter = (idx) => {
    if (!currentViewId) return;
    const newFilters = (activeView.filters || []).filter((_, i) => i !== idx);
    updateView(pageId, currentViewId, { filters: newFilters });
    if (newFilters.length === 0) setShowFilters(false);
  };

  // Sort handlers
  const handleAddSort = () => {
    if (!currentViewId) return;
    const firstProp = database.properties[0];
    if (!firstProp) return;
    const newSort = { id: generateId(), propertyId: firstProp.id, direction: 'ascending' };
    const newSorts = [...(activeView.sorts || []), newSort];
    updateView(pageId, currentViewId, { sorts: newSorts });
  };

  const handleUpdateSort = (idx, sort) => {
    if (!currentViewId) return;
    const newSorts = [...(activeView.sorts || [])];
    newSorts[idx] = sort;
    updateView(pageId, currentViewId, { sorts: newSorts });
  };

  const handleRemoveSort = (idx) => {
    if (!currentViewId) return;
    const newSorts = (activeView.sorts || []).filter((_, i) => i !== idx);
    updateView(pageId, currentViewId, { sorts: newSorts });
    if (newSorts.length === 0) setShowSorts(false);
  };

  const renderView = () => {
    // Apply search filter on top of view filters/sorts
    const applySearch = (items) => {
      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase();
      return items.filter(item => {
        // Match on title
        if ((item.title || '').toLowerCase().includes(q)) return true;
        // Match on any property value
        if (item.properties) {
          for (const val of Object.values(item.properties)) {
            const strVal = Array.isArray(val) ? val.join(' ') : String(val || '');
            if (strVal.toLowerCase().includes(q)) return true;
          }
        }
        return false;
      });
    };

    const searchFilteredDatabase = searchQuery.trim() ? {
      ...database,
      items: database.items.filter(id => {
        const item = state.pages[id];
        if (!item) return false;
        const q = searchQuery.toLowerCase();
        if ((item.title || '').toLowerCase().includes(q)) return true;
        if (item.properties) {
          for (const val of Object.values(item.properties)) {
            const strVal = Array.isArray(val) ? val.join(' ') : String(val || '');
            if (strVal.toLowerCase().includes(q)) return true;
          }
        }
        return false;
      })
    } : database;

    const viewProps = { database: searchFilteredDatabase, activeView };
    switch (activeView.type) {
      case 'board': return <BoardView {...viewProps} />;
      case 'list': return <ListView {...viewProps} />;
      case 'gallery': return <GalleryView {...viewProps} />;
      case 'calendar': return <CalendarView {...viewProps} />;
      default: return <TableView {...viewProps} />;
    }
  };

  return (
    <div className="mt-8">
      {/* View Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-4">
        {views.map(view => (
          <div key={view.id}
            className={clsx('px-3 py-2 text-sm cursor-pointer',
              (activeViewId === view.id || (!activeViewId && view === views[0])) ? 'font-medium border-b-2 border-black' : 'text-gray-500 hover:bg-gray-100')}
            onClick={() => setActiveViewId(view.id)}>
            {view.name}
          </div>
        ))}
        <div className="relative">
          <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer rounded-t" onClick={() => setShowAddView(!showAddView)}>
            + Add View
          </div>
          {showAddView && <AddViewDropdown onAdd={handleAddView} onClose={() => setShowAddView(false)} />}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center space-x-2 mb-2">
        <button className={clsx('text-sm px-2 py-1 rounded flex items-center gap-1',
          showFilters || (activeView.filters?.length > 0) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100')}
          onClick={() => setShowFilters(!showFilters)}>
          <Filter size={14} /> Filter {activeView.filters?.length > 0 && `(${activeView.filters.length})`}
        </button>
        <button className={clsx('text-sm px-2 py-1 rounded flex items-center gap-1',
          showSorts || (activeView.sorts?.length > 0) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100')}
          onClick={() => setShowSorts(!showSorts)}>
          <ArrowUpDown size={14} /> Sort {activeView.sorts?.length > 0 && `(${activeView.sorts.length})`}
        </button>
        <button className={clsx('text-sm px-2 py-1 rounded flex items-center gap-1',
          showSearch ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100')}
          onClick={() => setShowSearch(!showSearch)}>
          <Search size={14} /> Search
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <Search size={14} className="text-gray-400" />
          <input className="flex-1 text-sm outline-none border-b border-gray-200 py-1" placeholder="Search items..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
          <button className="text-gray-400 hover:text-gray-600" onClick={() => { setShowSearch(false); setSearchQuery(''); }}><X size={14} /></button>
        </div>
      )}

      {/* Filter bar */}
      {showFilters && (
        <FilterBar filters={activeView.filters || []} properties={database.properties}
          onUpdate={handleUpdateFilter} onRemove={handleRemoveFilter} onAdd={handleAddFilter} />
      )}

      {/* Sort bar */}
      {showSorts && (
        <SortBar sorts={activeView.sorts || []} properties={database.properties}
          onUpdate={handleUpdateSort} onRemove={handleRemoveSort} onAdd={handleAddSort} />
      )}

      {renderView()}
    </div>
  );
};
