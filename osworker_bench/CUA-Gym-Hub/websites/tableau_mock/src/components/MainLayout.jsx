import React from 'react'
import { useApp } from '../context/AppContext'
import Navbar from './Navbar'
import HomePage from '../pages/HomePage'
import ExplorePage from '../pages/ExplorePage'
import FavoritesPage from '../pages/FavoritesPage'
import RecentsPage from '../pages/RecentsPage'
import SharedPage from '../pages/SharedPage'
import WorkbookPage from '../pages/WorkbookPage'
import DataSourcesPage from '../pages/DataSourcesPage'
import DataSourceDetailPage from '../pages/DataSourceDetailPage'
import ProjectsPage from '../pages/ProjectsPage'
import AdminPage from '../pages/AdminPage'

export default function MainLayout() {
  const { state } = useApp()
  const page = state.uiState.currentPage

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage />
      case 'explore': return <ExplorePage />
      case 'favorites': return <FavoritesPage />
      case 'recents': return <RecentsPage />
      case 'shared': return <SharedPage />
      case 'workbook': return <WorkbookPage />
      case 'datasources': return <DataSourcesPage />
      case 'datasource-detail': return <DataSourceDetailPage />
      case 'projects': return <ProjectsPage />
      case 'admin': return <AdminPage />
      default: return <HomePage />
    }
  }

  return (
    <div className="app-root">
      <Navbar />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}
