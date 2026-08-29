import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const location = useLocation();
  const isSpaceView = location.pathname.startsWith('/spaces/');
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar is only shown in space view or if we want a global sidebar */}
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
