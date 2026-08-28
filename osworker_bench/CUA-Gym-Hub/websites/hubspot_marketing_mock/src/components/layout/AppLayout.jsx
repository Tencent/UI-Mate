import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const FULLSCREEN_ROUTES = ['/marketing/email/', '/marketing/forms/', '/automations/workflows/'];

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isFullscreen = FULLSCREEN_ROUTES.some(r => location.pathname.startsWith(r));
  const sidebarWidth = isFullscreen ? 0 : (sidebarCollapsed ? 56 : 240);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isFullscreen && (
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      )}
      <div style={{ flex: 1, marginLeft: sidebarWidth, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!isFullscreen && <TopBar sidebarWidth={sidebarWidth} />}
        <main style={{
          flex: 1,
          marginTop: isFullscreen ? 0 : 56,
          background: 'var(--hs-page-bg)',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
