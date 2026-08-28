import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { CoinbaseProvider } from './context/CoinbaseContext';
import Layout from './components/Layout';
import TradeModal from './components/TradeModal';
import SendReceiveModal from './components/SendReceiveModal';
import Home from './pages/Home';
import Assets from './pages/Assets';
import AssetDetailPage from './pages/AssetDetailPage';
import Trade from './pages/Trade';
import History from './pages/History';
import Settings from './pages/Settings';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-gray-900 p-8 font-mono">
          <h1 className="text-2xl text-red-500 mb-4">Something went wrong.</h1>
          <div className="bg-gray-50 p-4 rounded-lg overflow-auto border border-gray-200">
            <p className="font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
            <pre className="text-xs text-gray-500">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/go" element={<Go />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="assets" element={<Assets />} />
          <Route path="asset/:id" element={<AssetDetailPage />} />
          <Route path="trade" element={<Trade />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <TradeModal />
      <SendReceiveModal />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CoinbaseProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CoinbaseProvider>
    </ErrorBoundary>
  );
}

export default App;
