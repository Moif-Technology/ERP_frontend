import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Sale from './pages/Sale';
import Quotation from './pages/Quotation';
import DeliveryOrder from './pages/DeliveryOrder';
import Purchase from './pages/Purchase';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/sales" element={<Sale />} />
      <Route path="/quotation" element={<Quotation />} />
      <Route path="/delivery-order" element={<DeliveryOrder />} />
      <Route path="/purchase" element={<Purchase />} />
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