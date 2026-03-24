import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Sale from './pages/Sale';
import Login from './pages/Login';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/sales" element={<Sale />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <div style={{ padding: 80, textAlign: 'center' }}>
            <h1>404</h1>
            <p>Page not found</p>
          </div>
        }
      />
    </Routes>
  );
}
