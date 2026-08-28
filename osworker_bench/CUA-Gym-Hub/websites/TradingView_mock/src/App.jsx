import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from './context/AppContext.jsx';
import Go from './pages/Go.jsx';
import TopToolbar from './components/Toolbar/TopToolbar.jsx';
import DrawingToolbar from './components/DrawingToolbar/DrawingToolbar.jsx';
import ChartContainer from './components/Chart/ChartContainer.jsx';
import WidgetBar from './components/WidgetBar/WidgetBar.jsx';
import BottomPanel from './components/BottomPanel/BottomPanel.jsx';
import StatusBar from './components/StatusBar/StatusBar.jsx';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function ChartLayout() {
  const { state } = useAppContext();
  const { uiState } = state;
  const rightPanelOpen = uiState.activeRightPanel !== null;
  const bottomPanelOpen = uiState.activeBottomPanel !== null;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'grid',
      gridTemplateRows: `48px 1fr ${bottomPanelOpen ? (uiState.bottomPanelHeight + 32) + 'px' : '32px'} 24px`,
      gridTemplateColumns: `48px 1fr ${rightPanelOpen ? (48 + uiState.rightPanelWidth) + 'px' : '48px'}`,
      gridTemplateAreas: `
        "topbar topbar topbar"
        "left chart right"
        "left bottom right"
        "status status status"
      `,
      background: 'var(--bg-page)',
      overflow: 'hidden',
    }}>
      <div style={{ gridArea: 'topbar', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)', zIndex: 20 }}>
        <TopToolbar />
      </div>
      <div style={{ gridArea: 'left', borderRight: '1px solid var(--border)', background: 'var(--bg-page)', zIndex: 10 }}>
        <DrawingToolbar />
      </div>
      <div style={{ gridArea: 'chart', overflow: 'hidden', position: 'relative' }}>
        <ChartContainer />
      </div>
      <div style={{ gridArea: 'right', borderLeft: '1px solid var(--border)', background: 'var(--bg-panel)', zIndex: 10, overflow: 'hidden' }}>
        <WidgetBar />
      </div>
      <div style={{ gridArea: 'bottom', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
        <BottomPanel />
      </div>
      <div style={{ gridArea: 'status', borderTop: '1px solid var(--border)', background: 'var(--bg-page)', zIndex: 10 }}>
        <StatusBar />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RedirectWithQuery to="/chart" />} />
      <Route path="/chart" element={<ChartLayout />} />
      <Route path="/chart/:symbolId" element={<ChartLayout />} />
      <Route path="/go" element={<Go />} />
    </Routes>
  );
}
