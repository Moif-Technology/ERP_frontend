import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Sale from './pages/Sale';
import SalesReturn from './pages/SalesReturn';
import Quotation from './pages/Quotation';
import DeliveryOrder from './pages/DeliveryOrder';
import Purchase from './pages/Purchase';
import PurchaseOrder from './pages/PurchaseOrder';
import CustomerEntry from './pages/CustomerEntry';
import SupplierEntry from './pages/SupplierEntry';
import ProductEntry from './pages/ProductEntry';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/sales" element={<Sale />} />
      <Route path="/sales-return" element={<SalesReturn />} />
      <Route path="/quotation" element={<Quotation />} />
      <Route path="/delivery-order" element={<DeliveryOrder />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/purchase-order" element={<PurchaseOrder />} />
      <Route path="/data-entry/customer-entry" element={<CustomerEntry />} />
      <Route path="/data-entry/supplier-entry" element={<SupplierEntry />} />
      <Route path="/data-entry/product-entry" element={<ProductEntry />} />
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