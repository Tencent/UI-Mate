import React, { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { CanvasArea } from '../components/Canvas/CanvasArea';
import { PropertiesPanel } from '../components/PropertiesPanel/PropertiesPanel';
import { useDesign } from '../context/DesignContext';

export const Editor = () => {
  const { undo, redo, selectedId, deleteElement, duplicateElement } = useDesign();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          deleteElement(selectedId);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        duplicateElement(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, deleteElement, duplicateElement]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Toolbar />
          <PropertiesPanel />
          <CanvasArea />
        </div>
      </div>
    </div>
  );
};
