import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { generateImage } from '../utils/imageGenerator.js';

export default function LeftPanel() {
  const { state, toggleLeftPanel, setLeftPanelTab, loadSeries } = useAppContext();
  const { leftPanelTab, activeStudyId } = state.uiState;

  const activeVP = Object.values(state.viewports).find(vp => vp.isActive) || Object.values(state.viewports)[0];

  const getStudySeries = () => {
    if (!activeStudyId) return [];
    let studyIds = [];
    if (leftPanelTab === 'primary') {
      studyIds = [activeStudyId];
    } else if (leftPanelTab === 'recent') {
      studyIds = Object.values(state.studies)
        .filter(s => new Date(s.studyDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
        .map(s => s.id);
    } else {
      studyIds = Object.keys(state.studies);
    }
    return Object.values(state.series)
      .filter(s => studyIds.includes(s.studyId))
      .sort((a, b) => a.seriesNumber - b.seriesNumber);
  };

  const seriesList = getStudySeries();
  const study = state.studies[activeStudyId];
  const patient = study ? state.patients[study.patientId] : null;

  const tabs = ['primary', 'recent', 'all'];

  return (
    <div style={{ width: '240px', background: 'var(--color-bg-panel)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      {/* Collapse toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px' }}>
        <button onClick={toggleLeftPanel} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px' }}>◀</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '0 8px 8px' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setLeftPanelTab(tab)}
            style={{
              flex: 1, padding: '5px 8px', border: 'none', borderRadius: '12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize',
              background: leftPanelTab === tab ? 'var(--color-accent)' : 'transparent',
              color: leftPanelTab === tab ? '#000' : 'var(--color-text-secondary)',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Study info */}
      {study && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: '12px' }}>
          <div style={{ color: 'var(--color-text-secondary)' }}>{study.studyDate}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            {(study.modalities || []).map(m => (
              <span key={m} style={{ background: m === 'CT' ? '#2196f3' : m === 'MR' ? '#4caf50' : m === 'CR' ? '#ff9800' : '#9c27b0', color: '#fff', padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{m}</span>
            ))}
            <span style={{ color: 'var(--color-text-secondary)' }}>📋 {study.numberOfInstances}</span>
          </div>
          <div style={{ color: '#fff', marginTop: '4px', fontSize: '11px' }}>{study.studyDescription}</div>
        </div>
      )}

      {/* Drag hint */}
      <div style={{ padding: '4px 12px', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
        Drag series to viewport or click to load
      </div>

      {/* Series list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>
        {seriesList.map(ser => (
          <SeriesItem
            key={ser.id}
            series={ser}
            isActive={activeVP?.seriesId === ser.id}
            onClick={() => {
              if (activeVP) loadSeries(activeVP.id, ser.id);
            }}
            viewports={state.viewports}
            loadSeries={loadSeries}
          />
        ))}
      </div>
    </div>
  );
}

function SeriesItem({ series, isActive, onClick, viewports, loadSeries }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 120;
    canvas.height = 90;
    const midSlice = Math.ceil(series.numberOfInstances / 2);
    generateImage(canvas, series.thumbnailType, midSlice, series.numberOfInstances);
  }, [series.id, series.thumbnailType, series.numberOfInstances]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', series.id);
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        padding: '6px', marginBottom: '4px', cursor: isDragging ? 'grabbing' : 'grab', borderRadius: '4px',
        background: isActive ? 'rgba(5,216,230,0.08)' : 'transparent',
        transition: 'background 0.15s',
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!isActive && !isDragging) e.currentTarget.style.background = '#1e2a3a'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? 'rgba(5,216,230,0.08)' : 'transparent'; }}>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} style={{
          width: '100%', height: '90px', objectFit: 'contain', borderRadius: '3px',
          border: isActive ? '2px solid var(--color-accent)' : '1px solid #2a3a4a',
        }} />
        {/* Tracking indicator */}
        <span style={{
          position: 'absolute', top: '4px', left: '4px', width: '10px', height: '10px', borderRadius: '50%',
          border: series.isTracked ? '2px solid var(--color-accent)' : '2px dashed var(--color-text-secondary)',
          background: series.isTracked ? 'var(--color-accent)' : 'transparent',
        }} />
      </div>
      <div style={{ color: '#fff', fontSize: '11px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {series.seriesDescription}
      </div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>
        S: {series.seriesNumber}  📋 {series.numberOfInstances}
      </div>
    </div>
  );
}
