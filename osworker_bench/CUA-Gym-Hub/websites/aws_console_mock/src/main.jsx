
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App.jsx'
    import ErrorBoundary from './components/ErrorBoundary'
    import './index.css'

    // Clear potentially corrupted state on load if needed
    // localStorage.removeItem('aws_mock_state');

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    )
  