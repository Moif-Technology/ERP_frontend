import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Login from './pages/Login';
import ProtectedRoute from './app/router/ProtectedRoute';
import PublicRoute from './app/router/PublicRoute';

import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Login from './pages/Login';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<ProductList />} />
      {/* Login without layout */}
      <Route path="/login" element={<Login />} />

      {/* Protected area with layout (header, sidebar, module tabs) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        {/* Any unknown protected route still shows layout */}
        <Route
          path="*"
          element={
            <div style={{ padding: 80, textAlign: 'center' }}>
              <h1>404</h1>
              <p>Page not found</p>
            </div>
          }
        />
      </Route>

      {/* Default: visiting root takes you to login first */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

      {/* Login — redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected area — redirect to login if not logged in */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route
          path="*"
          element={
            <div style={{ padding: 80, textAlign: 'center' }}>
              <h1>404</h1>
              <p>Page not found</p>
            </div>
          }
        />
      </Route>

      {/* Root → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

