import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import '../shared/styles/index.css';
import App from './App';
import { getRouterMode } from './router/routerMode';

function pickRouter() {
  return getRouterMode() === 'browser' ? BrowserRouter : HashRouter;
}

const Router = pickRouter();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
