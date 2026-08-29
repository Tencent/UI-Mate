import React, { useState, useEffect } from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from 'lucide-react';

const LayersPanel = ({ canvas }) => {
  const [objects, setObjects] = useState([]);

  const refreshLayers = () => {
    if (!canvas) return;
    // Fabric stores objects bottom-up, we want top-down for layers
    const objs = [...canvas.getObjects()].reverse();
    setObjects(objs.map(o => ({
      id: o.id || Math.random().toString(),
      type: o.type,
      visible: o.visible,
      locked: o.lockMovementX && o.lockMovementY,
      ref: o
    })));
  };

  useEffect(() => {
    if (!canvas) return;
    
    refreshLayers();
    
    canvas.on('object:added', refreshLayers);
    canvas.on('object:removed', refreshLayers);
    canvas.on('object:modified', refreshLayers);
    
    return () => {
      canvas.off('object:added', refreshLayers);
      canvas.off('object:removed', refreshLayers);
      canvas.off('object:modified', refreshLayers);
    };
  }, [canvas]);

  const selectObject = (obj) => {
    if (canvas) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    }
  };

  const toggleVisibility = (obj, e) => {
    e.stopPropagation();
    obj.set('visible', !obj.visible);
    if (!obj.visible) canvas.discardActiveObject();
    canvas.requestRenderAll();
    refreshLayers();
  };

  const toggleLock = (obj, e) => {
    e.stopPropagation();
    const isLocked = !(obj.lockMovementX && obj.lockMovementY);
    obj.set({
      lockMovementX: isLocked,
      lockMovementY: isLocked,
      lockRotation: isLocked,
      lockScalingX: isLocked,
      lockScalingY: isLocked,
      selectable: !isLocked
    });
    if (isLocked) canvas.discardActiveObject();
    canvas.requestRenderAll();
    refreshLayers();
  };

  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center">
        <Layers size={16} className="mr-2 text-gray-500" />
        <h3 className="font-semibold text-gray-700 text-sm">Layers</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {objects.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">No objects</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {objects.map((layer, index) => (
              <li 
                key={layer.id}
                onClick={() => selectObject(layer.ref)}
                className="flex items-center p-2 hover:bg-blue-50 cursor-pointer group"
              >
                <GripVertical size={14} className="text-gray-300 mr-2 cursor-move" />
                <div className="flex-1 truncate text-sm text-gray-700">
                  {layer.type} {objects.length - index}
                </div>
                
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => toggleVisibility(layer.ref, e)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button 
                    onClick={(e) => toggleLock(layer.ref, e)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  >
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;