import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import StockScreener from './StockScreener.jsx';
import PineEditor from './PineEditor.jsx';
import TextNotes from './TextNotes.jsx';

const TABS = [
  { id: 'screener', label: 'Stock Screener' },
  { id: 'pine', label: 'Pine Editor' },
  { id: 'notes', label: 'Text Notes' },
];

export default function BottomPanel() {
  const { state, toggleBottomPanel } = useAppContext();
  const activePanel = state.uiState.activeBottomPanel;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab bar - always visible */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 32, flexShrink: 0,
        borderBottom: activePanel ? '1px solid var(--border)' : 'none',
        background: 'var(--bg-panel)',
        paddingLeft: 4,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => toggleBottomPanel(tab.id)}
            style={{
              padding: '0 14px', height: '100%', fontSize: 12, fontWeight: 500,
              borderBottom: activePanel === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activePanel === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'transparent', borderRadius: 0,
              transition: 'color 0.1s',
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {activePanel && (
          <button
            className="tv-icon-btn"
            style={{ width: 28, height: 28, marginRight: 4 }}
            title="Close panel"
            onClick={() => toggleBottomPanel(activePanel)}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Panel content - only rendered when active */}
      {activePanel && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activePanel === 'screener' && <StockScreener />}
          {activePanel === 'pine' && <PineEditor />}
          {activePanel === 'notes' && <TextNotes />}
        </div>
      )}
    </div>
  );
}
