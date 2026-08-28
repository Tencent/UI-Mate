import React from 'react';

// Keeps a single page's render error from unmounting the whole app (which would blank
// the screen AND remove the left rail, leaving the user unable to navigate back).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Teams mock: render error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', fontFamily: "'Segoe UI', sans-serif",
          gap: '0.75rem', color: '#242424',
        }}>
          <h2 style={{ margin: 0 }}>Something went wrong on this page</h2>
          <p style={{ color: '#666', margin: 0 }}>{this.state.error?.message}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Go back
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
