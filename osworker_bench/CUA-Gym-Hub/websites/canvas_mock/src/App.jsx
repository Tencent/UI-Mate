import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import GoDebug from './pages/GoDebug';
import CreateSimulation from './pages/CreateSimulation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/go" element={<GoDebug />} />
        <Route path="/create" element={<CreateSimulation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
