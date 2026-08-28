import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    // Clear localStorage and reload
    localStorage.removeItem('slackCloneState');
    localStorage.removeItem('slackCloneInitialState');
    window.location.reload();
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8f9fa',
          fontFamily: 'Arial, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#e01e5a', marginBottom: '20px', fontSize: '24px' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ color: '#616061', marginBottom: '20px', lineHeight: '1.5' }}>
              The application encountered an error and couldn't continue. This is usually caused by corrupted data or a bug in the code.
            </p>

            {this.state.error && (
              <details style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                  Error Details
                </summary>
                <pre style={{
                  overflow: 'auto',
                  fontSize: '12px',
                  color: '#e01e5a',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#007a5a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Reset & Reload
              </button>
              <button
                onClick={this.handleDismiss}
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#616061',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Try to Continue
              </button>
            </div>

            <p style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#868686',
              lineHeight: '1.5'
            }}>
              Tip: If this keeps happening, try clearing your browser cache or using a different browser.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
