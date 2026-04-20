import { Routes, Route, Navigate } from 'react-router-dom';
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
import CreditNoteEntry from './modules/backoffice/pages/CreditNoteEntry';
import CreditNoteList from './modules/backoffice/pages/CreditNoteList';
import AccountsPlaceholderPage from './modules/backoffice/pages/AccountsPlaceholderPage';
import VoucherListPage from './modules/backoffice/pages/VoucherListPage';
import IncomeVoucherEntry from './modules/backoffice/pages/IncomeVoucherEntry';
import IncomeVoucherList from './modules/backoffice/pages/IncomeVoucherList';
import ExpenseVoucherEntry from './modules/backoffice/pages/ExpenseVoucherEntry';
import ExpenseVoucherList from './modules/backoffice/pages/ExpenseVoucherList';
import PaymentVoucherSupplierEntry from './modules/backoffice/pages/PaymentVoucherSupplierEntry';
import PaymentVoucherEntry from './modules/backoffice/pages/PaymentVoucherEntry';
import ReceiptVoucherCustomerEntry from './modules/backoffice/pages/ReceiptVoucherCustomerEntry';
import ReceiptVoucherEntry from './modules/backoffice/pages/ReceiptVoucherEntry';
import ContraVoucherEntry from './modules/backoffice/pages/ContraVoucherEntry';
import JournalVoucherEntry from './modules/backoffice/pages/JournalVoucherEntry';
import AccountGroupDetails from './modules/backoffice/pages/AccountGroupDetails';
import AccountLedgerDetails from './modules/backoffice/pages/AccountLedgerDetails';
import TrialBalance from './modules/backoffice/pages/TrialBalance';
import PayableSummary from './modules/backoffice/pages/PayableSummary';
import ReceivableSummary from './modules/backoffice/pages/ReceivableSummary';
import CustomerEntry from './modules/backoffice/pages/CustomerEntry';
import SupplierEntry from './modules/backoffice/pages/SupplierEntry';
import ProductEntry from './modules/backoffice/pages/ProductEntry';
import ProductPriceList from './modules/backoffice/pages/ProductPriceList';
import CustomerList from './modules/backoffice/pages/CustomerList';
import SupplierList from './modules/backoffice/pages/SupplierList';
import AgentList from './modules/backoffice/pages/AgentList';
import ListPlaceholderPage from './modules/backoffice/pages/ListPlaceholderPage';
import StaffEntry from './modules/backoffice/pages/StaffEntry';
import GroupEntry from './modules/backoffice/pages/GroupEntry';
import SubGroupEntry from './modules/backoffice/pages/SubGroupEntry';
import AreaEntry from './modules/backoffice/pages/AreaEntry';
import TableEntry from './modules/backoffice/pages/TableEntry';

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
      <Route path="/credit-note-entry" element={<CreditNoteEntry />} />
      <Route path="/credit-note-list" element={<CreditNoteList />} />
      <Route path="/income-voucher" element={<IncomeVoucherEntry />} />
      <Route path="/income-voucher-list" element={<IncomeVoucherList />} />
      <Route path="/expense-voucher" element={<ExpenseVoucherEntry />} />
      <Route path="/expense-voucher-list" element={<ExpenseVoucherList />} />
      <Route path="/income-expense-voucher-list" element={<Navigate to="/income-voucher-list" replace />} />
      <Route path="/payment-voucher-supplier" element={<PaymentVoucherSupplierEntry />} />
      <Route path="/payment-voucher" element={<PaymentVoucherEntry />} />
      <Route path="/payment-voucher-list" element={<VoucherListPage title="PAYMENT VOUCHER LIST" filterVoucherTypeId={4} />} />
      <Route path="/receipt-voucher-customer" element={<ReceiptVoucherCustomerEntry />} />
      <Route path="/receipt-voucher-entry" element={<ReceiptVoucherEntry />} />
      <Route path="/receipt-voucher-list" element={<VoucherListPage title="RECEIPT VOUCHER LIST" filterVoucherTypeId={2} />} />
      <Route path="/contra-voucher-entry" element={<ContraVoucherEntry />} />
      <Route path="/journal-voucher-entry" element={<JournalVoucherEntry />} />
      <Route path="/contra-journal-voucher-list" element={<VoucherListPage title="CONTRA / JOURNAL VOUCHER LIST" />} />
      <Route path="/account-group-details" element={<AccountGroupDetails />} />
      <Route path="/account-ledger-details" element={<AccountLedgerDetails />} />
      <Route path="/trial-balance" element={<TrialBalance />} />
      <Route path="/statement-payable-summary" element={<PayableSummary />} />
      <Route path="/statement-receivable-summary" element={<ReceivableSummary />} />
      <Route path="/statement-of-accounts-list" element={<VoucherListPage title="STATEMENT OF ACCOUNTS" />} />
      <Route path="/data-entry/customer-entry" element={<CustomerEntry />} />
      <Route path="/data-entry/supplier-entry" element={<SupplierEntry />} />
      <Route path="/data-entry/product-entry" element={<ProductEntry />} />
      <Route path="/data-entry/staff-entry" element={<StaffEntry />} />
      <Route path="/data-entry/group-entry" element={<GroupEntry />} />
      <Route path="/data-entry/sub-group-entry" element={<SubGroupEntry />} />
      <Route path="/data-entry/area-entry" element={<AreaEntry />} />
      <Route path="/data-entry/table-entry" element={<TableEntry />} />
      <Route path="/lists/product-price-list" element={<ProductPriceList />} />
      <Route path="/lists/customer-list" element={<CustomerList />} />
      <Route path="/lists/supplier-list" element={<SupplierList />} />
      <Route path="/lists/agent-list" element={<AgentList />} />
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
