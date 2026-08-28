import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SpaceView } from './pages/SpaceView';
import { PageView } from './pages/PageView';
import { GoDebug } from './pages/GoDebug';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/go" element={<GoDebug />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="spaces/:spaceId" element={<SpaceView />} />
            <Route path="spaces/:spaceId/pages/:pageId" element={<PageView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
