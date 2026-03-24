import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Login from './pages/Login';
import ProtectedRoute from './app/router/ProtectedRoute';
import PublicRoute from './app/router/PublicRoute';

export default function AppRoutes() {
  return (
    <Routes>
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
