import React, { useEffect, useRef, useState } from 'react';
import { Point } from 'fabric';
import { 
  MousePointer2, Hand, Type, Square, Circle, Minus, Image as ImageIcon, 
  Undo2, Redo2, Trash2, Download, Save
} from 'lucide-react';
import { createRect, createCircle, createText, createLine, addImage } from '../../lib/fabric-utils';

const Toolbar = ({ canvas, undo, redo, isSaved, persistCanvas }) => {
  const imageInputRef = useRef(null);
  const importInputRef = useRef(null);
  const panRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const [mode, setMode] = useState('select');
  const [status, setStatus] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (!showResetConfirm) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowResetConfirm(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirm]);

  useEffect(() => {
    if (!canvas || mode !== 'pan') return undefined;

    const handleMouseDown = ({ e }) => {
      panRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    };
    const handleMouseMove = ({ e }) => {
      if (!panRef.current.active) return;
      const dx = e.clientX - panRef.current.lastX;
      const dy = e.clientY - panRef.current.lastY;
      canvas.relativePan(new Point(dx, dy));
      panRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    };
    const handleMouseUp = () => {
      panRef.current.active = false;
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      panRef.current.active = false;
    };
  }, [canvas, mode]);
  
  const handleAddRect = () => {
    if (!canvas) return;
    const rect = createRect();
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const handleAddCircle = () => {
    if (!canvas) return;
    const circle = createCircle();
    canvas.add(circle);
    canvas.setActiveObject(circle);
  };

  const handleAddText = () => {
    if (!canvas) return;
    const text = createText();
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const handleAddLine = () => {
    if (!canvas) return;
    const line = createLine();
    canvas.add(line);
    canvas.setActiveObject(line);
  };

  const handleAddImage = () => {
    if (!canvas) return;
    imageInputRef.current?.click();
  };

  const handleImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = () => addImage(canvas, reader.result, { name: file.name });
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleDelete = () => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length) {
      canvas.discardActiveObject();
      active.forEach(obj => canvas.remove(obj));
      canvas.requestRenderAll();
    }
  };

  const handleClear = () => {
    if (!canvas) return;
    setShowResetConfirm(true);
  };

  const confirmClear = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.requestRenderAll();
    persistCanvas?.();
    setShowResetConfirm(false);
    setStatus('Canvas reset locally.');
  };

  const handleDownload = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    const link = document.createElement('a');
    link.download = 'canvas-export.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (!canvas) return;
    const blob = new Blob([JSON.stringify(canvas.toJSON(['id', 'name', 'selectable', 'lockMovementX', 'lockMovementY']), null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'canvas-export.json';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus('Canvas JSON export generated.');
  };

  const handleImportJson = (event) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await canvas.loadFromJSON(JSON.parse(reader.result));
        canvas.requestRenderAll();
        persistCanvas?.();
        setStatus(`Imported ${file.name}.`);
      } catch (error) {
        setStatus('Import failed: invalid canvas JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const setSelectMode = () => {
    if (!canvas) return;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.getObjects().forEach(obj => { if (!obj.lockMovementX) obj.selectable = true; });
    setMode('select');
    setStatus('Select mode active.');
  };

  const setPanMode = () => {
    if (!canvas) return;
    canvas.selection = false;
    canvas.defaultCursor = 'grab';
    canvas.discardActiveObject();
    canvas.getObjects().forEach(obj => { obj.selectable = false; });
    canvas.requestRenderAll();
    setMode('pan');
    setStatus('Pan mode active. Drag the canvas to move the viewport.');
  };

  const handleSaveNow = () => {
    persistCanvas?.();
    setStatus('Saved to local session state.');
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm z-10 relative">
      <div className="flex items-center space-x-2">
        <div className="font-bold text-xl text-primary mr-6">BoltCanvas</div>
        
        <div className="h-8 w-px bg-gray-300 mx-2"></div>
        
        <button onClick={setSelectMode} className={`p-2 hover:bg-gray-100 rounded ${mode === 'select' ? 'bg-blue-50 text-primary' : ''}`} title="Select">
          <MousePointer2 size={20} />
        </button>
        <button onClick={setPanMode} className={`p-2 hover:bg-gray-100 rounded ${mode === 'pan' ? 'bg-blue-50 text-primary' : ''}`} title="Pan">
          <Hand size={20} />
        </button>
        
        <div className="h-8 w-px bg-gray-300 mx-2"></div>
        
        <button onClick={handleAddText} className="p-2 hover:bg-gray-100 rounded" title="Add Text (T)">
          <Type size={20} />
        </button>
        <button onClick={handleAddRect} className="p-2 hover:bg-gray-100 rounded" title="Add Rectangle (R)">
          <Square size={20} />
        </button>
        <button onClick={handleAddCircle} className="p-2 hover:bg-gray-100 rounded" title="Add Circle (C)">
          <Circle size={20} />
        </button>
        <button onClick={handleAddLine} className="p-2 hover:bg-gray-100 rounded" title="Add Line (L)">
          <Minus size={20} />
        </button>
        <button onClick={handleAddImage} className="p-2 hover:bg-gray-100 rounded" title="Add Image (I)">
          <ImageIcon size={20} />
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      </div>

      <div className="flex items-center space-x-2">
        <div className="text-sm text-gray-500 mr-4">
          {isSaved ? <span className="flex items-center text-green-600"><Save size={14} className="mr-1"/> Saved</span> : <span className="text-amber-500">Unsaved changes...</span>}
        </div>
        
        <button onClick={undo} className="p-2 hover:bg-gray-100 rounded" title="Undo (Ctrl+Z)">
          <Undo2 size={20} />
        </button>
        <button onClick={redo} className="p-2 hover:bg-gray-100 rounded" title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={20} />
        </button>
        <button onClick={handleSaveNow} className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-300">
          Save
        </button>
        
        <div className="h-8 w-px bg-gray-300 mx-2"></div>
        
        <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-red-500 rounded" title="Delete">
          <Trash2 size={20} />
        </button>
        <button onClick={handleClear} className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-300">
          Reset
        </button>
        <button onClick={() => importInputRef.current?.click()} className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-300">
          Import
        </button>
        <button onClick={handleExportJson} className="px-3 py-1 text-sm hover:bg-gray-100 rounded border border-gray-300">
          JSON
        </button>
        <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportJson} />
        <button onClick={handleDownload} className="p-2 bg-primary text-white hover:bg-blue-600 rounded flex items-center space-x-1">
          <Download size={18} />
          <span className="text-sm">Export</span>
        </button>
      </div>

      {status && (
        <div className="absolute top-full right-4 mt-2 bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-xl z-50">
          {status}
          <button onClick={() => setStatus('')} className="ml-3 text-gray-300 hover:text-white">x</button>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Reset canvas?</h3>
            <p className="text-sm text-gray-600 mb-4">This clears all objects in the local sandbox canvas for this session.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={confirmClear} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
