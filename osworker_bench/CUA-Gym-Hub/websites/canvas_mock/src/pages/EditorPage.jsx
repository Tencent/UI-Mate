import React, { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import Toolbar from '../components/Editor/Toolbar';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import LayersPanel from '../components/Editor/LayersPanel';
import { useLocation } from 'react-router-dom';
import { TEMPLATES } from '../templates';
import { getSessionId } from '../lib/fabric-utils';

const EditorPage = () => {
  const { canvasRef, canvas, activeObject, undo, redo, isSaved, persistCanvas } = useCanvas();
  const location = useLocation();

  // Handle initialization from navigation state (e.g., from /create or templates)
  useEffect(() => {
    if (!canvas) return;

    const initCanvas = async () => {
      const sid = getSessionId();
      const initKey = sid ? `canvas_initial_state_${sid}` : 'canvas_initial_state';

      if (location.state?.template) {
        const tmpl = TEMPLATES[location.state.template];
        if (tmpl) {
          // Clear existing
          canvas.clear();
          await canvas.setBackgroundColor(tmpl.canvas.backgroundColor);
          canvas.setDimensions({ width: tmpl.canvas.width, height: tmpl.canvas.height });

          const fabricJSON = {
            version: "5.3.0", // Fabric JSON version compatibility
            objects: tmpl.objects
          };

          await canvas.loadFromJSON(fabricJSON);
          canvas.requestRenderAll();

          // Save initial state after load (session-aware)
          localStorage.setItem(initKey, JSON.stringify({
            state: canvas.toJSON(['id']),
            timestamp: new Date().toISOString(),
            image: canvas.toDataURL()
          }));
        }
      } else if (location.state?.canvasData) {
          // From /create endpoint simulation
          const data = location.state.canvasData;
          canvas.setDimensions({
              width: data.canvas.width || 800,
              height: data.canvas.height || 600
          });
          await canvas.setBackgroundColor(data.canvas.backgroundColor || '#ffffff');

          const fabricObjects = data.objects.map(obj => {
              const base = {
                  left: obj.position?.x || 0,
                  top: obj.position?.y || 0,
                  width: obj.size?.width,
                  height: obj.size?.height,
                  fill: obj.style?.fill,
                  stroke: obj.style?.stroke,
                  strokeWidth: obj.style?.strokeWidth,
                  opacity: obj.style?.opacity,
                  angle: obj.rotation || 0
              };

              if (obj.type === 'text') {
                  return {
                      type: 'i-text',
                      ...base,
                      text: obj.content,
                      fontSize: obj.style?.fontSize,
                      fontFamily: obj.style?.fontFamily,
                      fontWeight: obj.style?.fontWeight
                  };
              }
              if (obj.type === 'rect') return { type: 'rect', ...base };
              if (obj.type === 'circle') return { type: 'circle', ...base, radius: obj.radius };
              if (obj.type === 'image') return { type: 'image', ...base, src: obj.url };

              return null;
          }).filter(Boolean);

          const fabricJSON = { objects: fabricObjects };

          await canvas.loadFromJSON(fabricJSON);
          canvas.requestRenderAll();

          localStorage.setItem(initKey, JSON.stringify({
              state: canvas.toJSON(['id']),
              timestamp: new Date().toISOString(),
              image: canvas.toDataURL()
          }));
      }
    };

    initCanvas();
  }, [canvas, location.state]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!canvas) return;

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObjects();
        if (active.length && !canvas.isDrawingMode) {
          canvas.discardActiveObject();
          active.forEach(obj => canvas.remove(obj));
          canvas.requestRenderAll();
        }
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, undo, redo]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Toolbar canvas={canvas} undo={undo} redo={redo} isSaved={isSaved} persistCanvas={persistCanvas} />

      <div className="flex flex-1 overflow-hidden">
        <LayersPanel canvas={canvas} />

        <div className="flex-1 bg-gray-200 relative overflow-hidden flex items-center justify-center canvas-container">
           <canvas ref={canvasRef} />
        </div>

        <PropertiesPanel canvas={canvas} activeObject={activeObject} />
      </div>
    </div>
  );
};

export default EditorPage;
