import React from 'react';
import { useDesign } from '../../context/DesignContext';

export const PropertiesPanel = () => {
  const { selectedId, elements, updateElement } = useDesign();
  const selectedElement = elements.find(el => el.id === selectedId);

  if (!selectedElement) return null;

  return (
    <div className="h-12 bg-white border-b flex items-center px-4 gap-4 text-sm overflow-x-auto">
      {/* Color Picker (for shapes/text) */}
      {(['rect', 'circle', 'text', 'star'].includes(selectedElement.type)) && (
        <div className="flex items-center gap-2 border-r pr-4">
          <div 
            className="w-6 h-6 rounded border cursor-pointer"
            style={{ backgroundColor: selectedElement.fill }}
            onClick={() => {
              const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#000000', '#FFFFFF'];
              const currentIdx = colors.indexOf(selectedElement.fill);
              const nextColor = colors[(currentIdx + 1) % colors.length];
              updateElement(selectedId, { fill: nextColor });
            }}
          />
          <span className="text-xs text-gray-500">Color</span>
        </div>
      )}

      {/* Text Properties */}
      {selectedElement.type === 'text' && (
        <>
          <div className="flex items-center gap-2 border-r pr-4">
            <select 
              value={selectedElement.fontFamily}
              onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
              className="border rounded px-2 py-1"
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border-r pr-4">
            <input 
              type="number" 
              value={Math.round(selectedElement.fontSize)}
              onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })}
              className="w-16 border rounded px-2 py-1"
            />
            <span className="text-xs">px</span>
          </div>
          <div className="flex items-center gap-1 border-r pr-4">
            <button 
              className={`p-1 rounded ${selectedElement.fontWeight === 'bold' ? 'bg-gray-200' : ''}`}
              onClick={() => updateElement(selectedId, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
            >
              <b>B</b>
            </button>
            <button 
              className={`p-1 rounded ${selectedElement.fontStyle === 'italic' ? 'bg-gray-200' : ''}`}
              onClick={() => updateElement(selectedId, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
            >
              <i>I</i>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={selectedElement.text}
              onChange={(e) => updateElement(selectedId, { text: e.target.value })}
              className="border rounded px-2 py-1 w-40"
              placeholder="Edit text..."
            />
          </div>
        </>
      )}

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Opacity</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1"
          value={selectedElement.opacity || 1}
          onChange={(e) => updateElement(selectedId, { opacity: parseFloat(e.target.value) })}
          className="w-24"
        />
      </div>
    </div>
  );
};
