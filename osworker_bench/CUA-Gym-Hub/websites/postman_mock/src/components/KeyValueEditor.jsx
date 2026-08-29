import React from 'react';
import { Trash2, CheckSquare, Square } from 'lucide-react';

export const KeyValueEditor = ({ pairs, onChange, onAdd, onRemove }) => {
  const handleChange = (id, field, value) => {
    const newPairs = pairs.map(p => p.id === id ? { ...p, [field]: value } : p);
    onChange(newPairs);
  };

  const toggleEnabled = (id) => {
    const newPairs = pairs.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    onChange(newPairs);
  };

  return (
    <div className="w-full border border-gray-200 rounded">
      <div className="flex bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
        <div className="w-8 p-2 text-center flex-shrink-0"></div>
        <div className="flex-1 p-2 border-r border-gray-200">Key</div>
        <div className="flex-1 p-2 border-r border-gray-200">Value</div>
        <div className="flex-1 p-2 border-r border-gray-200 text-gray-400">Description</div>
        <div className="w-10 p-2 flex-shrink-0"></div>
      </div>
      {pairs.map((pair) => (
        <div key={pair.id} className="flex border-b border-gray-100 group">
          <div className="w-8 flex items-center justify-center cursor-pointer flex-shrink-0" onClick={() => toggleEnabled(pair.id)}>
            {pair.enabled ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} className="text-gray-300" />}
          </div>
          <div className="flex-1 border-r border-gray-200">
            <input
              type="text"
              className="w-full p-2 text-sm outline-none bg-transparent font-mono"
              placeholder="Key"
              value={pair.key}
              onChange={(e) => handleChange(pair.id, 'key', e.target.value)}
            />
          </div>
          <div className="flex-1 border-r border-gray-200">
            <input
              type="text"
              className="w-full p-2 text-sm outline-none bg-transparent font-mono"
              placeholder="Value"
              value={pair.value}
              onChange={(e) => handleChange(pair.id, 'value', e.target.value)}
            />
          </div>
          <div className="flex-1 border-r border-gray-200">
            <input
              type="text"
              className="w-full p-2 text-xs outline-none bg-transparent text-gray-500"
              placeholder="Description (optional)"
              value={pair.description || ''}
              onChange={(e) => handleChange(pair.id, 'description', e.target.value)}
            />
          </div>
          <div className="w-10 flex items-center justify-center flex-shrink-0">
            <button
              onClick={() => onRemove(pair.id)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      <div className="p-2">
        <button
          onClick={onAdd}
          className="text-xs font-medium text-gray-500 hover:text-primary border border-transparent hover:border-gray-200 px-2 py-1 rounded"
        >
          + Add new
        </button>
      </div>
    </div>
  );
};
