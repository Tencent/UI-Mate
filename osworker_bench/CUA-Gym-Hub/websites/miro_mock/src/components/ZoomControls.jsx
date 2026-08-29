import React from 'react';
import { Minus, Plus, HelpCircle } from 'lucide-react';

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onShowShortcuts }) {
  const pct = Math.round(zoom * 100);

  return (
    <div className="zoom-controls">
      <button className="zoom-btn" onClick={onZoomOut} title="Zoom out (Ctrl+-)">
        <Minus size={16} />
      </button>
      <span className="zoom-pct">{pct}%</span>
      <button className="zoom-btn" onClick={onZoomIn} title="Zoom in (Ctrl++)">
        <Plus size={16} />
      </button>
      <div className="zoom-divider" />
      <button className="zoom-btn" title="Keyboard shortcuts (?)" onClick={onShowShortcuts}>
        <HelpCircle size={16} />
      </button>
    </div>
  );
}
