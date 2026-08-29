import React, { useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { FileSystemItem } from '../lib/types';
import { Trash2, RotateCcw, XOctagon } from 'lucide-react';
import { formatBytes } from '../lib/utils';
import { format } from 'date-fns';

export const Trash = () => {
  const { getTrashedItems, dispatch } = useFileSystem();
  const [confirmAction, setConfirmAction] = useState<{ type: 'single' | 'all'; item?: FileSystemItem } | null>(null);
  const items = getTrashedItems();

  const handleRestore = (id: string) => {
    dispatch({ type: 'RESTORE_ITEM', payload: { id } });
  };

  const handleDeleteForever = (id: string) => {
    const item = items.find(candidate => candidate.id === id);
    if (item) setConfirmAction({ type: 'single', item });
  };

  const handleEmptyTrash = () => {
    setConfirmAction({ type: 'all' });
  };

  const handleConfirmDelete = () => {
    if (confirmAction?.type === 'single' && confirmAction.item) {
      dispatch({ type: 'PERMANENT_DELETE', payload: { id: confirmAction.item.id } });
    } else if (confirmAction?.type === 'all') {
      items.forEach(item => {
        dispatch({ type: 'PERMANENT_DELETE', payload: { id: item.id } });
      });
    }
    setConfirmAction(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-gray-50">
        <h1 className="text-lg font-normal text-gray-700">Trash</h1>
        {items.length > 0 && (
          <button 
            onClick={handleEmptyTrash}
            className="text-sm font-medium text-danger hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
          >
            Empty Trash
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Trash2 className="w-16 h-16 mb-4 text-gray-300" />
            <p>Trash is empty</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border text-sm font-medium text-gray-500">
              <div className="col-span-6">Name</div>
              <div className="col-span-3">Date deleted</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 items-center">
                <div className="col-span-6 flex items-center gap-3">
                  <span className="truncate text-sm text-gray-700 font-medium">{item.name}</span>
                </div>
                <div className="col-span-3 text-sm text-gray-500">
                  {format(item.modifiedAt, 'MMM d, yyyy')}
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button 
                    onClick={() => handleRestore(item.id)}
                    className="p-1 text-gray-500 hover:text-primary hover:bg-blue-50 rounded"
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteForever(item.id)}
                    className="p-1 text-gray-500 hover:text-danger hover:bg-red-50 rounded"
                    title="Delete forever"
                  >
                    <XOctagon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center" onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-normal">
                {confirmAction.type === 'all' ? 'Empty trash?' : 'Delete forever?'}
              </h3>
            </div>
            <div className="p-6 text-sm text-gray-700">
              {confirmAction.type === 'all'
                ? `This will permanently delete ${items.length} item${items.length === 1 ? '' : 's'} from this local Drive.`
                : `"${confirmAction.item?.name}" will be permanently deleted from this local Drive.`}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm font-medium rounded hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-danger text-white text-sm font-medium rounded hover:bg-red-700">
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
