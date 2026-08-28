import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import DocumentView from './pages/DocumentView';
import KeyCitePage from './pages/KeyCitePage';
import StatuteView from './pages/StatuteView';
import Folders from './pages/Folders';
import History from './pages/History';
import Go from './pages/Go';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/document/:id" element={<DocumentView />} />
            <Route path="/keycite/:id" element={<KeyCitePage />} />
            <Route path="/statute/:id" element={<StatuteView />} />
            <Route path="/folders" element={<Folders />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
