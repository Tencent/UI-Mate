
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/MainLayout';
import ChannelView from './components/ChannelView';
import DMView from './components/DMView';
import AllDMsPage from './components/AllDMsPage';
import ThreadsPage from './components/ThreadsPage';
import MentionsPage from './components/MentionsPage';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
import UnreadsPage from './components/UnreadsPage';
import StateInspector from './components/StateInspector';
import './App.css';

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/go" element={<StateInspector />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<RedirectWithQuery to="/channel/general" />} />
              <Route path="channel/:channelId" element={<ChannelView />} />
              <Route path="dm/:dmId" element={<DMView />} />
              <Route path="unreads" element={<UnreadsPage />} />
              <Route path="all-dms" element={<AllDMsPage />} />
              <Route path="threads" element={<ThreadsPage />} />
              <Route path="mentions" element={<MentionsPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
