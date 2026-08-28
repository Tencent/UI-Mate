
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import Home from './pages/Home';
    import Results from './pages/Results';
    import Booking from './pages/Booking';
    import Go from './pages/Go';
    import { StoreProvider } from './lib/store';

    function App() {
      return (
        <StoreProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<Results />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/go" element={<Go />} />
            </Routes>
          </Router>
        </StoreProvider>
      );
    }

    export default App;

