
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
        this.setState({
          error: error,
          errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
              <div className="bg-white p-8 rounded shadow-lg max-w-2xl w-full">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                <p className="text-gray-700 mb-4">The application crashed. Here are the details:</p>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64 mb-4 border border-gray-300">
                  <pre className="text-sm text-red-800 whitespace-pre-wrap">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                  <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reload Page
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('aws_mock_state');
                    window.location.reload();
                  }} 
                  className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Clear Data & Reload
                </button>
              </div>
            </div>
          );
        }

        return this.props.children;
      }
    }

    export default ErrorBoundary;
  