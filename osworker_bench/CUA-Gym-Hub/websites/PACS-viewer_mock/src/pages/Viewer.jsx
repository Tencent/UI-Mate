import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import Toolbar from '../components/Toolbar.jsx';
import LeftPanel from '../components/LeftPanel.jsx';
import Viewport from '../components/Viewport.jsx';
import RightPanel from '../components/RightPanel.jsx';

// Wrapper that adds drag-and-drop support to a Viewport
function DroppableViewport({ viewportId }) {
  const { loadSeries } = useAppContext();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const seriesId = e.dataTransfer.getData('text/plain');
    if (seriesId) {
      loadSeries(viewportId, seriesId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        outline: isDragOver ? '2px dashed var(--color-accent)' : 'none',
        outlineOffset: '-2px',
      }}>
      <Viewport viewportId={viewportId} />
      {isDragOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,216,230,0.08)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--color-accent)' }}>
          Drop series here
        </div>
      )}
    </div>
  );
}

export default function Viewer() {
  const { studyId } = useParams();
  const { state, openStudy } = useAppContext();
  const { leftPanelOpen, rightPanelOpen } = state.uiState;

  useEffect(() => {
    if (studyId && state.uiState.activeStudyId !== studyId) {
      openStudy(studyId);
    }
  }, [studyId]);

  const { layoutRows, layoutColumns } = state.settings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {leftPanelOpen && <LeftPanel />}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${layoutColumns}, 1fr)`, gridTemplateRows: `repeat(${layoutRows}, 1fr)`, gap: '2px', background: 'var(--color-border)', overflow: 'hidden' }}>
          {Object.values(state.viewports).map(vp => (
            <DroppableViewport key={vp.id} viewportId={vp.id} />
          ))}
        </div>
        {rightPanelOpen && <RightPanel />}
      </div>
    </div>
  );
}
