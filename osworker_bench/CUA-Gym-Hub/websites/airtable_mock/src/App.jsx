import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider, useStore } from './store/store';
import Toolbar from './components/Toolbar';
import GridView from './components/GridView';
import KanbanView from './components/KanbanView';
import GalleryView from './components/GalleryView';
import FormView from './components/FormView';
import CalendarView from './components/CalendarView';
import ExpandedRecord from './components/ExpandedRecord';
import ViewSidebar from './components/ViewSidebar';
import Sidebar from './components/Sidebar';
import GoDebug from './pages/GoDebug';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

const MainLayout = () => {
  const { state } = useStore();

  if (!state) return null;

  const activeTable = state.tables[state.activeTableId];
  const activeView = activeTable?.views.find(v => v.id === activeTable.activeViewId) || activeTable?.views[0];

  const renderView = () => {
    if (!activeTable || !activeView) return <div>No view selected</div>;

    switch (activeView.type) {
      case 'grid': return <GridView table={activeTable} view={activeView} />;
      case 'kanban': return <KanbanView table={activeTable} view={activeView} />;
      case 'gallery': return <GalleryView table={activeTable} view={activeView} />;
      case 'form': return <FormView table={activeTable} view={activeView} />;
      case 'calendar': return <CalendarView table={activeTable} view={activeView} />;
      default: return <GridView table={activeTable} view={activeView} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Toolbar />
        <div className="flex-1 overflow-hidden flex">
          <ViewSidebar />
          <div className="flex-1 overflow-hidden">
            {renderView()}
          </div>
        </div>
        <ExpandedRecord />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/go" element={<GoDebug />} />
          <Route path="*" element={<RedirectWithQuery to="/" />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;
