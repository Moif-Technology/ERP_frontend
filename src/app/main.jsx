import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import '../shared/styles/index.css';
import App from './App';
import { currentPathAsHashUrl, shouldRedirectToHashUrl, shouldUseHashRouter } from './router/routerMode';

function pickRouter() {
  return shouldUseHashRouter() ? HashRouter : BrowserRouter;
}

if (shouldRedirectToHashUrl()) {
  window.location.replace(currentPathAsHashUrl());
}

const Router = pickRouter();

if (!shouldRedirectToHashUrl()) {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
}
