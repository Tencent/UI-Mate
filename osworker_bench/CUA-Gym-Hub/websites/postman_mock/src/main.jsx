import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { StoreProvider, useStore } from './store/StoreContext';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// State Inspection Component
const GoEndpoint = () => {
  const { getDebugState } = useStore();
  const data = getDebugState();

  return (
    <pre className="p-4 bg-gray-900 text-green-400 font-mono text-sm h-screen overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

// Preserves ?sid= query string during redirects
function RedirectWithQuery({ to }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

const Root = () => {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/go" element={<GoEndpoint />} />
          <Route path="/" element={<App />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
