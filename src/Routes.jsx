import { Routes, Route } from 'react-router-dom';
import Dashboard from './modules/backoffice/pages/Dashboard';
import ProductList from './modules/backoffice/pages/ProductList';
import Sale from './modules/backoffice/pages/Sale';
import SalesList from './modules/backoffice/pages/SalesList';
import SalesReturn from './modules/backoffice/pages/SalesReturn';
import Quotation from './modules/backoffice/pages/Quotation';
import QuotationList from './modules/backoffice/pages/QuotationList';
import DeliveryOrder from './modules/backoffice/pages/DeliveryOrder';
import Purchase from './modules/backoffice/pages/Purchase';
import PurchaseOrder from './modules/backoffice/pages/PurchaseOrder';
import GoodsReceiveNote from './modules/backoffice/pages/GoodsReceiveNote';
import PurchaseVoucherEntry from './modules/backoffice/pages/PurchaseVoucherEntry';
import PurchaseVoucherList from './modules/backoffice/pages/PurchaseVoucherList';
import SalesVoucherEntry from './modules/backoffice/pages/SalesVoucherEntry';
import SalesVoucherList from './modules/backoffice/pages/SalesVoucherList';
import DebitNoteEntry from './modules/backoffice/pages/DebitNoteEntry';
import DebitNoteList from './modules/backoffice/pages/DebitNoteList';
import CustomerEntry from './modules/backoffice/pages/CustomerEntry';
import SupplierEntry from './modules/backoffice/pages/SupplierEntry';
import ProductEntry from './modules/backoffice/pages/ProductEntry';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/sales" element={<Sale />} />
      <Route path="/sales-list" element={<SalesList />} />
      <Route path="/sales-return" element={<SalesReturn />} />
      <Route path="/quotation" element={<Quotation />} />
      <Route path="/quotation-list" element={<QuotationList />} />
      <Route path="/delivery-order" element={<DeliveryOrder />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/purchase-order" element={<PurchaseOrder />} />
      <Route path="/goods-receive-note" element={<GoodsReceiveNote />} />
      <Route path="/purchase-voucher-entry" element={<PurchaseVoucherEntry />} />
      <Route path="/purchase-voucher-list" element={<PurchaseVoucherList />} />
      <Route path="/sales-voucher-entry" element={<SalesVoucherEntry />} />
      <Route path="/sales-voucher-list" element={<SalesVoucherList />} />
      <Route path="/debit-note-entry" element={<DebitNoteEntry />} />
      <Route path="/debit-note-list" element={<DebitNoteList />} />
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
