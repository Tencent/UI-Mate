import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { EnvironmentModal } from './components/EnvironmentModal';
import { useStore } from './store/StoreContext';

function App() {
  const { state, dispatch } = useStore();
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const workbenchRef = useRef(null);

  const splitRatio = state.splitRatio || 50;

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e) => {
      if (!workbenchRef.current) return;
      const rect = workbenchRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ratio = Math.min(80, Math.max(20, (y / rect.height) * 100));
      dispatch({ type: 'SET_SPLIT_RATIO', payload: Math.round(ratio) });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dispatch]);

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800 font-sans overflow-hidden">
      {/* Header */}
      <Header onOpenEnvModal={() => setShowEnvModal(true)} />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (icon rail + panel) */}
        <Sidebar />

        {/* Workbench */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <TabBar />

          {/* Split: Request (top) / Response (bottom) */}
          <div
            ref={workbenchRef}
            className="flex-1 flex flex-col overflow-hidden"
            style={{ cursor: isDragging ? 'row-resize' : undefined }}
          >
            {/* Request Builder */}
            <div
              className="overflow-hidden"
              style={{ height: `${splitRatio}%`, minHeight: '100px' }}
            >
              <RequestPanel />
            </div>

            {/* Resizable Divider */}
            <div
              className={`resize-handle h-1 bg-sidebar-border flex-shrink-0 ${isDragging ? 'active' : ''}`}
              onMouseDown={handleMouseDown}
            >
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300 rounded" />
              </div>
            </div>

            {/* Response Viewer */}
            <div
              className="overflow-hidden"
              style={{ height: `${100 - splitRatio}%`, minHeight: '60px' }}
            >
              <ResponsePanel />
            </div>
          </div>
        </div>
      </div>

      {showEnvModal && <EnvironmentModal onClose={() => setShowEnvModal(false)} />}
    </div>
  );
}

export default App;
