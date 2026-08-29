import React from 'react';
import { useStore } from '../store/store';
import { Plus } from 'lucide-react';

const GalleryView = ({ table }) => {
  const { dispatch, ACTIONS } = useStore();
  const primaryField = table.fields.find(f => f.primary) || table.fields[0];
  const coverField = table.fields.find(f => f.type === 'attachment');

  return (
    <div className="h-full overflow-auto bg-gray-100 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => dispatch({ type: ACTIONS.ADD_RECORD, payload: { tableId: table.id } })}
          className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-orange-50 cursor-pointer transition-colors"
        >
          <Plus size={48} />
          <span className="mt-2 font-medium">New Record</span>
        </div>

        {table.records.map(record => (
          <div
            key={record.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
            onClick={() => dispatch({ type: ACTIONS.SET_EXPANDED_RECORD, payload: record.id })}
          >
            <div className="aspect-video bg-gray-100 relative">
              {coverField && record.fields[coverField.id]?.[0] ? (
                <img src={record.fields[coverField.id][0].url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                  No Cover
                </div>
              )}
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-bold text-lg mb-4 text-gray-800">
                {record.fields[primaryField.id] || 'Unnamed Record'}
              </h3>
              <div className="space-y-2">
                {table.fields.slice(1, 5).map(f => {
                   const val = record.fields[f.id];
                   if (!val) return null;
                   return (
                     <div key={f.id} className="text-sm">
                       <div className="text-xs text-gray-400 uppercase font-semibold mb-0.5">{f.name}</div>
                       <div className="text-gray-700 truncate">
                         {typeof val === 'object' ? JSON.stringify(val).slice(0, 20) + '...' : String(val)}
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryView;