import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Login from './pages/Login';

export default function AppRoutes() {
  return (
    <Routes>
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