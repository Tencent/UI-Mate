import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { useApp } from '../context/AppContext.jsx'
import SearchModal from './SearchModal.jsx'

export default function Layout() {
  const { sidebarCollapsed, activeModal, setActiveModal } = useApp()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        marginLeft: sidebarCollapsed ? 52 : 240,
        transition: 'margin-left 0.2s ease-in-out',
        minWidth: 0
      }}>
        <Outlet />
      </div>
      {activeModal?.type === 'search' && (
        <SearchModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  )
}
