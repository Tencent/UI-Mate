import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import TeamChat from './pages/TeamChat';
import Meetings from './pages/Meetings';
import Contacts from './pages/Contacts';
import Recordings from './pages/Recordings';
import Settings from './pages/Settings';
import Room from './pages/Room';
import StateInspector from './pages/StateInspector';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/go" element={<StateInspector />} />
          <Route path="/room/:id" element={<Room />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="chat" element={<TeamChat />} />
            <Route path="chat/:channelId" element={<TeamChat />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="recordings" element={<Recordings />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<RedirectWithQuery to="/" />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
