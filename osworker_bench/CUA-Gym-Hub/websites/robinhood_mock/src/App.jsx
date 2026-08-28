import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import History from './pages/History';
import Account from './pages/Account';
import Notifications from './pages/Notifications';
import Crypto from './pages/Crypto';
import Transfers from './pages/Transfers';
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
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
          <h1 className="text-2xl text-red-500 mb-4">Something went wrong.</h1>
          <div className="bg-gray-900 p-4 rounded overflow-auto">
            <p className="font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
            <pre className="text-xs text-gray-400">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/go" element={<Go />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="stock/:symbol" element={<StockDetail />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="history" element={<History />} />
              <Route path="account" element={<Account />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="crypto" element={<Crypto />} />
              <Route path="transfers" element={<Transfers />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ErrorBoundary>
  );
}

export default App;
