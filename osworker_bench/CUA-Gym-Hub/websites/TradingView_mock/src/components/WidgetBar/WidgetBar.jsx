import React from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import {
  List, Bell, Info, Flame, Calendar, Newspaper
} from 'lucide-react';
import WatchlistPanel from './WatchlistPanel.jsx';
import AlertsPanel from './AlertsPanel.jsx';
import SymbolDetailsPanel from './SymbolDetailsPanel.jsx';
import HotlistsPanel from './HotlistsPanel.jsx';
import CalendarPanel from './CalendarPanel.jsx';
import NewsPanel from './NewsPanel.jsx';

const PANELS = [
  { id: 'watchlist', icon: List, label: 'Watchlist' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'details', icon: Info, label: 'Symbol Details' },
  { id: 'hotlists', icon: Flame, label: 'Hotlists' },
  { id: 'calendar', icon: Calendar, label: 'Economic Calendar' },
  { id: 'news', icon: Newspaper, label: 'News' },
];

function PanelContent({ panelId }) {
  switch (panelId) {
    case 'watchlist': return <WatchlistPanel />;
    case 'alerts': return <AlertsPanel />;
    case 'details': return <SymbolDetailsPanel />;
    case 'hotlists': return <HotlistsPanel />;
    case 'calendar': return <CalendarPanel />;
    case 'news': return <NewsPanel />;
    default: return null;
  }
}

export default function WidgetBar() {
  const { state, toggleRightPanel } = useAppContext();
  const activePanel = state.uiState.activeRightPanel;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Panel content */}
      {activePanel && (
        <div style={{
          width: state.uiState.rightPanelWidth,
          height: '100%',
          overflowY: 'auto',
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-panel)',
          flexShrink: 0,
        }}>
          <PanelContent panelId={activePanel} />
        </div>
      )}

      {/* Icon rail */}
      <div style={{
        width: 48,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        gap: 2,
        background: 'var(--bg-panel)',
        flexShrink: 0,
      }}>
        {PANELS.map(p => {
          const Icon = p.icon;
          const isActive = activePanel === p.id;
          return (
            <button
              key={p.id}
              title={p.label}
              onClick={() => toggleRightPanel(p.id)}
              className="tv-icon-btn"
              style={{
                width: 36,
                height: 36,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(41,98,255,0.12)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                borderRadius: 0,
                marginLeft: 0,
                position: 'relative',
              }}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
