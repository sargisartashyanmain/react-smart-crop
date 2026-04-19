/**
 * Application entry point for development and demo.
 * 
 * Renders the App component with React StrictMode for development warnings
 * and wraps it with context providers for theme and language management.
 * This is only used during development and demo; the main export is index.ts.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
