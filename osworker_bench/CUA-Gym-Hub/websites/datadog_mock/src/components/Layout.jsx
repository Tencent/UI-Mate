import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAppContext } from '../context/AppContext';

export default function Layout() {
  const { state } = useAppContext();
  const collapsed = state.sidebarCollapsed;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`main-area${collapsed ? ' collapsed' : ''}`}>
        <TopBar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
