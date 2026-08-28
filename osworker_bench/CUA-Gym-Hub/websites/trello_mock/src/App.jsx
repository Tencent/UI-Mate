import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import BoardList from './components/BoardList';
import Board from './components/Board';
import DebugState from './components/DebugState';

function RedirectWithQuery({ to }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BoardList />} />
          <Route path="/board/:boardId" element={<Board />} />
          <Route path="/go" element={<DebugState />} />
          <Route path="*" element={<RedirectWithQuery to="/" />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
