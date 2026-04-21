import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './modules/backoffice/pages/Dashboard';
import Home from './modules/backoffice/pages/Home';
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
import ProfitAndLossAccount from './modules/backoffice/pages/ProfitAndLossAccount';
import BalanceSheet from './modules/backoffice/pages/BalanceSheet';
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
import DamageEntry from './modules/backoffice/pages/DamageEntry';
import ProductMovement from './modules/backoffice/pages/ProductMovement';
import AdditionalStockEntry from './modules/backoffice/pages/AdditionalStockEntry';
import StockAdjustment from './modules/backoffice/pages/StockAdjustment';
import StockAdjustmentList from './modules/backoffice/pages/StockAdjustmentList';
import ReorderList from './modules/backoffice/pages/ReorderList';
import DealsOffersPlaceholderPage from './modules/backoffice/pages/DealsOffersPlaceholderPage';
import DiscountEntry from './modules/backoffice/pages/DiscountEntry';
import DiscountViewer from './modules/backoffice/pages/DiscountViewer';
import GiftVoucherSettings from './modules/backoffice/pages/GiftVoucherSettings';
import GiftVoucherViewer from './modules/backoffice/pages/GiftVoucherViewer';
import OfferPacketCreation from './modules/backoffice/pages/OfferPacketCreation';
import OfferPacketList from './modules/backoffice/pages/OfferPacketList';
import OfferPackingEntry from './modules/backoffice/pages/OfferPackingEntry';
import OfferUnpackingEntry from './modules/backoffice/pages/OfferUnpackingEntry';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/home" element={<Home />} />
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
      <Route path="/payment-voucher-list" element={<AccountsPlaceholderPage />} />
      <Route path="/receipt-voucher-customer" element={<ReceiptVoucherCustomerEntry />} />
      <Route path="/receipt-voucher-entry" element={<ReceiptVoucherEntry />} />
      <Route path="/receipt-voucher-list" element={<AccountsPlaceholderPage />} />
      <Route path="/contra-voucher-entry" element={<ContraVoucherEntry />} />
      <Route path="/journal-voucher-entry" element={<JournalVoucherEntry />} />
      <Route path="/contra-journal-voucher-list" element={<AccountsPlaceholderPage />} />
      <Route path="/account-group-details" element={<AccountGroupDetails />} />
      <Route path="/account-ledger-details" element={<AccountLedgerDetails />} />
      <Route path="/trial-balance" element={<TrialBalance />} />
      <Route path="/financials" element={<Navigate to="/financials/profit-and-loss-account" replace />} />
      <Route path="/financials/profit-and-loss-account" element={<ProfitAndLossAccount />} />
      <Route path="/financials/balance-sheet" element={<BalanceSheet />} />
      <Route path="/statement-payable-summary" element={<PayableSummary />} />
      <Route path="/statement-receivable-summary" element={<ReceivableSummary />} />
      <Route path="/statement-of-accounts-list" element={<AccountsPlaceholderPage />} />
      <Route path="/data-entry/customer-entry" element={<CustomerEntry />} />
      <Route path="/data-entry/supplier-entry" element={<SupplierEntry />} />
      <Route path="/data-entry/product-entry" element={<ProductEntry />} />
      <Route path="/lists/product-price-list" element={<ProductPriceList />} />
      <Route path="/lists/customer-list" element={<CustomerList />} />
      <Route path="/lists/supplier-list" element={<SupplierList />} />
      <Route path="/lists/agent-list" element={<AgentList />} />
      <Route path="/stock-hub" element={<Navigate to="/stock-hub/stock-adjustment" replace />} />
      <Route path="/stock-hub/stock-adjustment-list" element={<StockAdjustmentList />} />
      <Route path="/stock-hub/reorder-list" element={<ReorderList />} />
      <Route path="/stock-hub/stock-adjustment" element={<StockAdjustment />} />
      <Route path="/stock-hub/damage-entry" element={<DamageEntry />} />
      <Route path="/stock-hub/additional-stock-entry" element={<AdditionalStockEntry />} />
      <Route path="/stock-hub/product-movement" element={<ProductMovement />} />
      <Route path="/deals-offers" element={<Navigate to="/deals-offers/discount-entry" replace />} />
      <Route path="/deals-offers/discount-entry" element={<DiscountEntry />} />
      <Route path="/deals-offers/discount-viewer" element={<DiscountViewer />} />
      <Route path="/deals-offers/gift-voucher-settings" element={<GiftVoucherSettings />} />
      <Route path="/deals-offers/gift-voucher-viewer" element={<GiftVoucherViewer />} />
      <Route path="/deals-offers/offer-packet-creation" element={<OfferPacketCreation />} />
      <Route path="/deals-offers/offer-packing-entry" element={<OfferPackingEntry />} />
      <Route path="/deals-offers/offer-unpacking-entry" element={<OfferUnpackingEntry />} />
      <Route path="/deals-offers/offer-packet-list" element={<OfferPacketList />} />
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
