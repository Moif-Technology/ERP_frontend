import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import '../shared/styles/index.css';
import App from './App';

function pickRouter() {
  try {
    const mode = String(import.meta.env?.VITE_ROUTER_MODE ?? '').toLowerCase();
    if (mode === 'browser') return BrowserRouter;
    if (mode === 'hash') return HashRouter;
    if (window?.location?.protocol === 'file:') return HashRouter;
  } catch {
    // fall through to default
  }
  return HashRouter;
}

const Router = pickRouter();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
