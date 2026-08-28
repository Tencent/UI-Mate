import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Note: StrictMode removed to prevent double-rendering issues with contentEditable
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)