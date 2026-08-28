import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useDesign } from '../../context/DesignContext';
import { CanvasObject } from './CanvasObject';

export const CanvasArea = () => {
  const { 
    canvasConfig, 
    elements, 
    selectedId, 
    setSelectedId, 
    updateElement,
    addElement
  } = useDesign();
  
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    // or clicked on the background rect
    const clickedOnBg = e.target.attrs.id === 'canvas-bg';
    
    if (clickedOnEmpty || clickedOnBg) {
      setSelectedId(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    const [pointer] = stageRef.current.getPointersPositions();
    
    // Adjust pointer for stage scale and position
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point(pointer);

    const type = e.dataTransfer.getData('type');
    const src = e.dataTransfer.getData('src');
    
    if (type === 'image') {
      addElement({
        type: 'image',
        src: src,
        x: pos.x - 100,
        y: pos.y - 75,
        width: 200,
        height: 150
      });
    } else if (type === 'text') {
      addElement({
        type: 'text',
        text: 'Heading',
        fontSize: 40,
        fill: '#000000',
        x: pos.x,
        y: pos.y,
        fontFamily: 'Arial'
      });
    } else if (type === 'rect') {
      addElement({
        type: 'rect',
        width: 100,
        height: 100,
        fill: '#00C4CC',
        x: pos.x,
        y: pos.y
      });
    }
  };

  return (
    <div 
      className="flex-1 bg-gray-100 overflow-hidden flex items-center justify-center relative"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        className="shadow-lg origin-center transition-transform"
        style={{ transform: `scale(${scale})` }}
      >
        <Stage
          width={canvasConfig.width}
          height={canvasConfig.height}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          style={{ background: '#fff' }}
        >
          <Layer>
            {/* Background */}
            <Rect
              id="canvas-bg"
              x={0}
              y={0}
              width={canvasConfig.width}
              height={canvasConfig.height}
              fill={canvasConfig.backgroundColor}
            />
            
            {elements.map((el, i) => (
              <CanvasObject
                key={el.id}
                shapeProps={el}
                isSelected={el.id === selectedId}
                onSelect={() => setSelectedId(el.id)}
                onChange={(newAttrs) => updateElement(el.id, newAttrs)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow p-2 flex gap-2 text-sm">
        <button onClick={() => setScale(s => Math.max(0.25, s - 0.1))} className="w-6 h-6 hover:bg-gray-100 rounded">-</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="w-6 h-6 hover:bg-gray-100 rounded">+</button>
      </div>
    </div>
  );
};
