import React from 'react';
import { useStore } from '../store/store';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';

const KanbanView = ({ table, view }) => {
  const { dispatch, ACTIONS } = useStore();
  
  // Find the grouping field (default to first single select if not specified)
  const groupFieldId = view.groupFieldId || table.fields.find(f => f.type === 'single_select')?.id;
  const groupField = table.fields.find(f => f.id === groupFieldId);

  if (!groupField) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Please select a Single Select field to group by.
      </div>
    );
  }

  const columns = [
    { id: 'uncategorized', name: 'Uncategorized', color: 'bg-gray-100' },
    ...(groupField.options || [])
  ];

  const getRecordsForColumn = (colName) => {
    return table.records.filter(r => {
      const val = r.fields[groupFieldId];
      if (colName === 'Uncategorized') return !val;
      return val === colName;
    });
  };

  const primaryField = table.fields.find(f => f.primary) || table.fields[0];
  const coverField = table.fields.find(f => f.type === 'attachment');

  return (
    <div className="flex h-full overflow-x-auto bg-gray-100 p-6 gap-6">
      {columns.map(col => {
        const records = getRecordsForColumn(col.name);
        return (
          <div key={col.id} className="flex-shrink-0 w-72 flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", col.color || "bg-white text-gray-800")}>
                  {col.name}
                </span>
                <span className="text-gray-400 text-xs">{records.length}</span>
              </div>
              <div className="flex gap-1">
                <button className="text-gray-400 hover:text-gray-600"><Plus size={16} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
              {records.map(record => (
                <div key={record.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  {coverField && record.fields[coverField.id]?.[0] && (
                    <div className="h-32 -mx-3 -mt-3 mb-3 bg-gray-100 rounded-t overflow-hidden">
                      <img src={record.fields[coverField.id][0].url} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="font-medium text-gray-800 mb-2">
                    {record.fields[primaryField.id] || 'Unnamed Record'}
                  </div>
                  <div className="space-y-1">
                    {table.fields.slice(1, 4).filter(f => f.id !== groupFieldId).map(f => {
                      const val = record.fields[f.id];
                      if (!val) return null;
                      return (
                        <div key={f.id} className="text-xs flex items-center gap-2 text-gray-600">
                          <span className="text-gray-400 w-16 truncate">{f.name}</span>
                          <span className="truncate flex-1">
                            {typeof val === 'object' ? '...' : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button 
                className="w-full py-2 text-gray-400 hover:bg-gray-200 rounded border border-transparent hover:border-gray-300 border-dashed flex items-center justify-center gap-2 text-sm"
                onClick={() => {
                  const initialFields = col.name === 'Uncategorized' ? {} : { [groupFieldId]: col.name };
                  dispatch({ type: ACTIONS.ADD_RECORD, payload: { tableId: table.id, initialFields } });
                }}
              >
                <Plus size={14} /> New
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
