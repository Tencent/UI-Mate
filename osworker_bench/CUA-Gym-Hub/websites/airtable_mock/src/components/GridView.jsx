import React from 'react';
import { useStore } from '../store/store';
import Cell from './Cell';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { FIELD_TYPES } from '../lib/utils';

const GridView = ({ table }) => {
  const { state, dispatch, ACTIONS } = useStore();
  const [deleteRecordId, setDeleteRecordId] = React.useState(null);
  const [showFieldDialog, setShowFieldDialog] = React.useState(false);
  const [fieldName, setFieldName] = React.useState('');
  const [fieldType, setFieldType] = React.useState(FIELD_TYPES.TEXT);

  const handleCellChange = (recordId, fieldId, value) => {
    dispatch({
      type: ACTIONS.UPDATE_CELL,
      payload: { tableId: table.id, recordId, fieldId, value }
    });
  };

  const handleAddRow = () => {
    dispatch({ type: ACTIONS.ADD_RECORD, payload: { tableId: table.id } });
  };

  const handleDeleteRow = (recordId) => {
    setDeleteRecordId(recordId);
  };

  const confirmDelete = () => {
    if (!deleteRecordId) return;
    dispatch({ type: ACTIONS.DELETE_RECORD, payload: { tableId: table.id, recordId: deleteRecordId } });
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { type: 'delete_record', label: `Deleted a record from ${table.name}` } });
    setDeleteRecordId(null);
  };

  const handleAddField = (e) => {
    e.preventDefault();
    const name = fieldName.trim();
    if (!name) return;
    dispatch({
      type: ACTIONS.ADD_FIELD,
      payload: {
        tableId: table.id,
        field: {
          id: `fld_${Date.now().toString(36)}`,
          name,
          type: fieldType,
          options: fieldType === FIELD_TYPES.SINGLE_SELECT ? [{ id: 'opt-new', name: 'Option', color: 'bg-gray-100 text-gray-800' }] : undefined
        }
      }
    });
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { type: 'add_field', label: `Added ${name} field to ${table.name}` } });
    setFieldName('');
    setFieldType(FIELD_TYPES.TEXT);
    setShowFieldDialog(false);
  };

  const searchQuery = (state.ui?.searchQuery || '').trim().toLowerCase();
  const visibleRecords = searchQuery
    ? table.records.filter(record =>
        table.fields.some(field => String(record.fields[field.id] ?? '').toLowerCase().includes(searchQuery))
      )
    : table.records;

  const highlightMatch = (record, field) =>
    searchQuery && String(record.fields[field.id] ?? '').toLowerCase().includes(searchQuery);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 overflow-auto relative">
        <table className="w-full border-collapse min-w-max">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr>
              <th className="w-10 border-b border-r border-cell-border bg-gray-50 p-2">
                <div className="flex justify-center text-gray-400">
                  <input type="checkbox" className="rounded" />
                </div>
              </th>
              {table.fields.map(field => (
                <th key={field.id} className="border-b border-r border-cell-border bg-gray-50 p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center gap-2">
                    {/* Icon based on type could go here */}
                    <span>{field.name}</span>
                  </div>
                </th>
              ))}
              <th className="w-10 border-b border-cell-border bg-gray-50">
                <button
                  onClick={() => setShowFieldDialog(true)}
                  className="h-8 w-8 rounded hover:bg-gray-200 inline-flex items-center justify-center text-gray-500"
                  title="Add field"
                >
                  <Plus size={16} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record, index) => (
              <tr key={record.id} className="group hover:bg-gray-50">
                <td className="border-b border-r border-cell-border text-center text-gray-400 text-xs">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <div className="hidden group-hover:flex justify-center cursor-grab">
                    <GripVertical size={14} />
                  </div>
                </td>
                {table.fields.map(field => (
                  <td key={field.id} className={`p-0 border-b border-r border-cell-border relative ${highlightMatch(record, field) ? 'bg-yellow-100' : ''}`}>
                    <Cell 
                      field={field} 
                      value={record.fields[field.id]} 
                      onChange={(val) => handleCellChange(record.id, field.id, val)}
                    />
                  </td>
                ))}
                <td className="border-b border-cell-border text-center">
                  <button 
                    onClick={() => handleDeleteRow(record.id)}
                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td className="border-b border-r border-cell-border p-2 text-center text-gray-300">
                <Plus size={16} />
              </td>
              <td colSpan={table.fields.length + 1} className="border-b border-cell-border p-0">
                <button 
                  onClick={handleAddRow}
                  className="w-full text-left px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Record
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="h-10 border-t border-gray-200 bg-gray-50 flex items-center px-4 text-xs text-gray-500">
        {visibleRecords.length} records{searchQuery && ` matching "${state.ui.searchQuery}"`} {searchQuery && `(${table.records.length} total)`}
      </div>

      {deleteRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteRecordId(null)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Delete record?</h2>
              <button className="rounded p-1 hover:bg-gray-100" onClick={() => setDeleteRecordId(null)}><X size={16} /></button>
            </div>
            <p className="mb-5 text-sm text-gray-600">This moves the record out of the current table for this local sandbox session.</p>
            <div className="flex justify-end gap-2">
              <button className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={() => setDeleteRecordId(null)}>Cancel</button>
              <button className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showFieldDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowFieldDialog(false)}>
          <form className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl" onSubmit={handleAddField} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add field</h2>
              <button type="button" className="rounded p-1 hover:bg-gray-100" onClick={() => setShowFieldDialog(false)}><X size={16} /></button>
            </div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Field name</label>
            <input className="mb-3 w-full rounded border px-3 py-2 text-sm outline-none focus:border-primary" value={fieldName} onChange={(e) => setFieldName(e.target.value)} autoFocus />
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Type</label>
            <select className="mb-5 w-full rounded border px-3 py-2 text-sm outline-none focus:border-primary" value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
              {Object.values(FIELD_TYPES).map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={() => setShowFieldDialog(false)}>Cancel</button>
              <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GridView;
