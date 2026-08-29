import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DesignProvider } from './context/DesignContext';
import { Editor } from './pages/Editor';
import { Go } from './pages/Go';

function App() {
  return (
    <DesignProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/go" element={<Go />} />
        </Routes>
      </Router>
    </DesignProvider>
  );
}

export default App;
