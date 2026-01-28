/**
 * Main Entry Point for CleanCart React Application
 * Initializes and renders the root React component
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Render React app to DOM
// StrictMode helps identify potential problems in development
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
