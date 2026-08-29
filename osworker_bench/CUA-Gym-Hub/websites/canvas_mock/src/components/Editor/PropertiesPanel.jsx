import React, { useEffect, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

const PropertiesPanel = ({ canvas, activeObject }) => {
  const [props, setProps] = useState(null);

  useEffect(() => {
    if (activeObject) {
      updatePropsFromObject(activeObject);
    } else {
      setProps(null);
    }
  }, [activeObject]);

  // Listen for object modifications to update panel live
  useEffect(() => {
    if (!canvas) return;
    
    const handleMod = () => {
      if (canvas.getActiveObject()) {
        updatePropsFromObject(canvas.getActiveObject());
      }
    };

    canvas.on('object:modified', handleMod);
    canvas.on('object:scaling', handleMod);
    canvas.on('object:moving', handleMod);
    
    return () => {
      canvas.off('object:modified', handleMod);
      canvas.off('object:scaling', handleMod);
      canvas.off('object:moving', handleMod);
    };
  }, [canvas]);

  const updatePropsFromObject = (obj) => {
    setProps({
      type: obj.type,
      left: Math.round(obj.left),
      top: Math.round(obj.top),
      width: Math.round(obj.getScaledWidth()),
      height: Math.round(obj.getScaledHeight()),
      angle: Math.round(obj.angle),
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity * 100,
      // Text specific
      text: obj.text,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      textAlign: obj.textAlign,
    });
  };

  const handleChange = (key, value) => {
    if (!canvas || !canvas.getActiveObject()) return;
    const obj = canvas.getActiveObject();
    
    if (key === 'opacity') value = value / 100;
    if (key === 'width' || key === 'height') {
      if (obj.type === 'rect' || obj.type === 'image') {
        obj.set(key, parseInt(value));
        // Reset scale to 1 to apply dimensions directly
        obj.set('scaleX', 1);
        obj.set('scaleY', 1);
      } else {
        // For complex shapes, scaling is better
        const scale = parseInt(value) / (key === 'width' ? obj.width : obj.height);
        obj.scale(scale);
      }
    } else {
      obj.set(key, value);
    }

    obj.setCoords();
    canvas.requestRenderAll();
    updatePropsFromObject(obj);
    canvas.fire('object:modified'); // Trigger history save
  };

  if (!activeObject || !props) {
    return (
      <div className="w-[300px] bg-white border-l border-gray-200 p-4 overflow-y-auto h-full">
        <div className="text-gray-400 text-center mt-10">
          Select an object to edit properties
        </div>
      </div>
    );
  }

  return (
    <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-10">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">
          {props.type} Properties
        </h3>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Position & Size */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase">Layout</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input 
                type="number" 
                value={props.left} 
                onChange={(e) => handleChange('left', parseInt(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input 
                type="number" 
                value={props.top} 
                onChange={(e) => handleChange('top', parseInt(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">W</label>
              <input 
                type="number" 
                value={props.width} 
                onChange={(e) => handleChange('width', parseInt(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">H</label>
              <input 
                type="number" 
                value={props.height} 
                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Rotation</label>
              <input 
                type="number" 
                value={props.angle} 
                onChange={(e) => handleChange('angle', parseInt(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase">Appearance</h4>
          
          {props.type !== 'image' && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fill Color</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  value={props.fill} 
                  onChange={(e) => handleChange('fill', e.target.value)}
                  className="w-8 h-8 border rounded cursor-pointer p-0" 
                />
                <input 
                  type="text" 
                  value={props.fill} 
                  onChange={(e) => handleChange('fill', e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm" 
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 block mb-1">Opacity ({props.opacity}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={props.opacity} 
              onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
              className="w-full" 
            />
          </div>
        </div>

        {/* Text Specific */}
        {(props.type === 'i-text' || props.type === 'text') && (
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Typography</h4>
            
            <div>
              <label className="text-xs text-gray-500">Font Family</label>
              <select 
                value={props.fontFamily} 
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div className="flex space-x-2">
               <div className="flex-1">
                <label className="text-xs text-gray-500">Size</label>
                <input 
                  type="number" 
                  value={props.fontSize} 
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm" 
                />
              </div>
              <div className="flex items-end space-x-1 pb-1">
                <button 
                  onClick={() => handleChange('fontWeight', props.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`p-1 rounded ${props.fontWeight === 'bold' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <Bold size={16} />
                </button>
                <button 
                  onClick={() => handleChange('fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`p-1 rounded ${props.fontStyle === 'italic' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <Italic size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Alignment</label>
              <div className="flex border rounded overflow-hidden">
                {['left', 'center', 'right', 'justify'].map((align) => (
                  <button
                    key={align}
                    onClick={() => handleChange('textAlign', align)}
                    className={`flex-1 p-1 flex justify-center ${props.textAlign === align ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
                  >
                    {align === 'left' && <AlignLeft size={16} />}
                    {align === 'center' && <AlignCenter size={16} />}
                    {align === 'right' && <AlignRight size={16} />}
                    {align === 'justify' && <AlignJustify size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;