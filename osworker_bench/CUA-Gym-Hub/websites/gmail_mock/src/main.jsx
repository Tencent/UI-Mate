import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setCustomInitialState } from './data/mockData'

console.log('Starting Xmail Mock application...');

// Check if there's a custom state set via /post endpoint
async function loadCustomState() {
  try {
    const response = await fetch('/state');
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) {
        // Clear localStorage to force using the custom state
        localStorage.removeItem('xmail-clone-state');
        setCustomInitialState(data.stored_state);
        console.log('[Xmail Mock] Loaded custom initial state from /post endpoint');
        return true;
      }
    }
  } catch (e) {
    // Server endpoint not available (e.g., in production build)
    console.log('[Xmail Mock] Using default state');
  }
  return false;
}

// Initialize app
async function init() {
  await loadCustomState();

  const root = document.getElementById('root');

  if (root) {
    try {
      const reactRoot = ReactDOM.createRoot(root);
      reactRoot.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('Xmail Mock application mounted successfully');
    } catch (error) {
      console.error('Failed to mount application:', error);
      root.innerHTML = `<div style="color: red; padding: 20px;">
        <h1>Application Error</h1>
        <pre>${error.toString()}</pre>
      </div>`;
    }
  } else {
    console.error('Root element not found');
  }
}

init();
