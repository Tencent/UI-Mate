import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Spreadsheet } from './pages/Spreadsheet';
import { Go } from './pages/Go';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spreadsheet" element={<Spreadsheet />} />
        <Route path="/go" element={<Go />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
