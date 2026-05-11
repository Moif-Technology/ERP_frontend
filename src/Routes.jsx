import { Routes, Route, Navigate } from 'react-router-dom';
import FeatureGuard from './core/access/FeatureGuard.jsx';
import LockedAccessPage from './core/access/LockedAccessPage.jsx';
import Dashboard from './modules/backoffice/pages/Dashboard';
import Home from './modules/backoffice/pages/Home';
import ProductList from './modules/backoffice/pages/ProductList';
import Sale from './modules/backoffice/pages/Sale';
import SalesList from './modules/backoffice/pages/SalesList';
import SalesReturn from './modules/backoffice/pages/SalesReturn';
import Quotation from './modules/backoffice/pages/Quotation';
import QuotationList from './modules/backoffice/pages/QuotationList';
import DeliveryOrder from './modules/backoffice/pages/DeliveryOrder';
import DeliveryOrderList from './modules/backoffice/pages/DeliveryOrderList';
import Purchase from './modules/backoffice/pages/Purchase';
import PurchaseOrder from './modules/backoffice/pages/PurchaseOrder';
import GoodsReceiveNote from './modules/backoffice/pages/GoodsReceiveNote';
import PurchaseList from './modules/backoffice/pages/PurchaseList';
import PurchaseOrderList from './modules/backoffice/pages/PurchaseOrderList';
import GoodsReceiveNoteList from './modules/backoffice/pages/GoodsReceiveNoteList';
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
import StaffEntry from './modules/backoffice/pages/StaffEntry';
import RoleEntry from './modules/backoffice/pages/RoleEntry';
import RoleManagement from './modules/backoffice/pages/RoleManagement';
import GroupEntry from './modules/backoffice/pages/GroupEntry';
import SubGroupEntry from './modules/backoffice/pages/SubGroupEntry';
import AreaEntry from './modules/backoffice/pages/AreaEntry';
import TableEntry from './modules/backoffice/pages/TableEntry';
import DamageEntry from './modules/backoffice/pages/DamageEntry';
import DamageEntryList from './modules/backoffice/pages/DamageEntryList';
import ProductMovement from './modules/backoffice/pages/ProductMovement';
import AdditionalStockEntry from './modules/backoffice/pages/AdditionalStockEntry';
import AdditionalStockEntryList from './modules/backoffice/pages/AdditionalStockEntryList';
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
import CurrencyMaster from './modules/backoffice/pages/CurrencyMaster.jsx';
import ExchangeRateEntry from './modules/backoffice/pages/ExchangeRateEntry.jsx';
import ExchangeRateList from './modules/backoffice/pages/ExchangeRateList.jsx';
import RecipeEntry from './modules/backoffice/pages/RecipeEntry.jsx';
import RecipeList from './modules/backoffice/pages/RecipeList.jsx';
import ProductionOrderEntry from './modules/backoffice/pages/ProductionOrderEntry.jsx';
import ProductionOrderList from './modules/backoffice/pages/ProductionOrderList.jsx';
import MaterialRequisition from './modules/backoffice/pages/MaterialRequisition.jsx';
import DeliveryScheduleEntry from './modules/backoffice/pages/DeliveryScheduleEntry.jsx';
import DeliveryScheduleList from './modules/backoffice/pages/DeliveryScheduleList.jsx';
import DispatchEntry from './modules/backoffice/pages/DispatchEntry.jsx';
import DeliveryTracking from './modules/backoffice/pages/DeliveryTracking.jsx';
import DriverEntry from './modules/backoffice/pages/DriverEntry.jsx';
import BackofficeVehicleEntry from './modules/backoffice/pages/VehicleEntry.jsx';
import ReportsPlaceholderPage from './modules/backoffice/pages/ReportsPlaceholderPage.jsx';
import ManagementPlaceholderPage from './modules/backoffice/pages/ManagementPlaceholderPage.jsx';
import ToolsPlaceholderPage from './modules/backoffice/pages/ToolsPlaceholderPage.jsx';

// HR Module Pages
import EmployeeList from './modules/hr/pages/EmployeeList';
import EmployeeForm from './modules/hr/pages/EmployeeForm';
import EmployeeProfile from './modules/hr/pages/EmployeeProfile';
import HRDashboard from './modules/hr/pages/HRDashboard';
import AttendanceOverview from './modules/hr/pages/AttendanceOverview';
import ShiftMaster from './modules/hr/pages/ShiftMaster';
import LeaveManagement from './modules/hr/pages/LeaveManagement';
import LeaveTypeMaster from './modules/hr/pages/LeaveTypeMaster';
import DocumentTypeMaster from './modules/hr/pages/DocumentTypeMaster';

// CRM Module Pages
import LeadListPage from './modules/crm/pages/LeadListPage';
import LeadEntryPage from './modules/crm/pages/LeadEntryPage';
import LeadWorkspacePage from './modules/crm/pages/LeadWorkspacePage';
import CRMDashboard from './modules/crm/pages/CRMDashboard';
import OpportunityListPage from './modules/crm/pages/OpportunityListPage';
import OpportunityEntryPage from './modules/crm/pages/OpportunityEntryPage';
import OpportunityWorkspacePage from './modules/crm/pages/OpportunityWorkspacePage';
import FollowUpListPage from './modules/crm/pages/FollowUpListPage';
import InteractionLogPage from './modules/crm/pages/InteractionLogPage';
import LeadSourceMasterPage from './modules/crm/pages/LeadSourceMasterPage';
import LeadStatusMasterPage from './modules/crm/pages/LeadStatusMasterPage';
import OpportunityStageMasterPage from './modules/crm/pages/OpportunityStageMasterPage';

// Garage Module Pages
import JobCardEntry from './modules/garage/pages/JobCardEntry';
import EstimationEntry from './modules/garage/pages/EstimationEntry';
import JobCardList from './modules/garage/pages/JobCardList';
import EstimationList from './modules/garage/pages/EstimationList';
import WorkshopMonitor from './modules/garage/pages/WorkshopMonitor';
import PartsSearch from './modules/garage/pages/PartsSearch';
import TechnicianMonitor from './modules/garage/pages/TechnicianMonitor';
import VehicleHistory from './modules/garage/pages/VehicleHistory';
import TechnicianEntry from './modules/garage/pages/TechnicianEntry';
import JobDescriptionEntry from './modules/garage/pages/JobDescriptionEntry';
import BranchEntry from './modules/garage/pages/BranchEntry';
import PartRequest from './modules/garage/pages/PartRequest';
import SubletJobs from './modules/garage/pages/SubletJobs';
import GatePassViewer from './modules/garage/pages/GatePassViewer';
import PunchingEntry from './modules/garage/pages/PunchingEntry';
import JobCodePunching from './modules/garage/pages/JobCodePunching';
import PunchingList from './modules/garage/pages/PunchingList';
import PreJobCardEntry from './modules/garage/pages/PreJobCardEntry';
import AdditionalVehicleHistory from './modules/garage/pages/AdditionalVehicleHistory';
import SubletLpo from './modules/garage/pages/SubletLpo';
import ConsumableEntry from './modules/garage/pages/ConsumableEntry';
import LubricantMonitor from './modules/garage/pages/LubricantMonitor';
import ConsumableMonitor from './modules/garage/pages/ConsumableMonitor';
import SubletMonitor from './modules/garage/pages/SubletMonitor';
import GarageHome from './modules/garage/pages/GarageHome';
import GarageDashboard from './modules/garage/pages/GarageDashboard';
import GarageVehicleEntry from './modules/garage/pages/VehicleEntry';
import VehicleList from './modules/garage/pages/VehicleList';
import ColorEntry from './modules/garage/pages/ColorEntry';
import CarGroupEntry from './modules/garage/pages/CarGroupEntry';
import CarSubGroupEntry from './modules/garage/pages/CarSubGroupEntry';

const guarded = (element, features) => (
  <FeatureGuard any={features}>{element}</FeatureGuard>
);

const guardedAll = (element, features) => (
  <FeatureGuard all={features}>{element}</FeatureGuard>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={guarded(<Dashboard />, 'backoffice.dashboard')} />
      <Route path="/dashboard" element={guarded(<Dashboard />, 'backoffice.dashboard')} />
      <Route path="/home" element={guarded(<Home />, 'backoffice.dashboard')} />
      <Route path="/products" element={guarded(<ProductList />, ['backoffice.product_master', 'pos.product_search'])} />
      <Route path="/sales" element={guarded(<Sale />, 'backoffice.sales')} />
      <Route path="/sales-list" element={guarded(<SalesList />, 'backoffice.sales')} />
      <Route path="/sales-return" element={guarded(<SalesReturn />, 'backoffice.sales')} />
      <Route path="/quotation" element={guarded(<Quotation />, 'backoffice.sales_quotation')} />
      <Route path="/quotation-list" element={guarded(<QuotationList />, 'backoffice.sales_quotation')} />
      <Route path="/delivery-order" element={guarded(<DeliveryOrder />, 'backoffice.delivery_order')} />
      <Route path="/delivery-order-list" element={guarded(<DeliveryOrderList />, 'backoffice.delivery_order')} />
      <Route path="/purchase" element={guarded(<Purchase />, 'backoffice.purchase')} />
      <Route path="/purchase-list" element={guarded(<PurchaseList />, 'backoffice.purchase')} />
      <Route path="/purchase-order" element={guarded(<PurchaseOrder />, 'backoffice.purchase_order')} />
      <Route path="/purchase-order-list" element={guarded(<PurchaseOrderList />, 'backoffice.purchase_order')} />
      <Route path="/goods-receive-note" element={guarded(<GoodsReceiveNote />, 'backoffice.grn')} />
      <Route path="/goods-receive-note-list" element={guarded(<GoodsReceiveNoteList />, 'backoffice.grn')} />
      <Route path="/purchase-voucher-entry" element={guarded(<PurchaseVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/purchase-voucher-list" element={guarded(<PurchaseVoucherList />, 'backoffice.vouchers')} />
      <Route path="/sales-voucher-entry" element={guarded(<SalesVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/sales-voucher-list" element={guarded(<SalesVoucherList />, 'backoffice.vouchers')} />
      <Route path="/debit-note-entry" element={guarded(<DebitNoteEntry />, 'backoffice.vouchers')} />
      <Route path="/debit-note-list" element={guarded(<DebitNoteList />, 'backoffice.vouchers')} />
      <Route path="/credit-note-entry" element={guarded(<CreditNoteEntry />, 'backoffice.vouchers')} />
      <Route path="/credit-note-list" element={guarded(<CreditNoteList />, 'backoffice.vouchers')} />
      <Route path="/income-voucher" element={guarded(<IncomeVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/income-voucher-list" element={guarded(<IncomeVoucherList />, 'backoffice.vouchers')} />
      <Route path="/expense-voucher" element={guarded(<ExpenseVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/expense-voucher-list" element={guarded(<ExpenseVoucherList />, 'backoffice.vouchers')} />
      <Route path="/income-expense-voucher-list" element={<Navigate to="/income-voucher-list" replace />} />
      <Route path="/payment-voucher-supplier" element={guarded(<PaymentVoucherSupplierEntry />, 'backoffice.vouchers')} />
      <Route path="/payment-voucher" element={guarded(<PaymentVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/payment-voucher-list" element={guarded(<VoucherListPage title="PAYMENT VOUCHER LIST" filterVoucherTypeId={4} />, 'backoffice.vouchers')} />
      <Route path="/receipt-voucher-customer" element={guarded(<ReceiptVoucherCustomerEntry />, 'backoffice.vouchers')} />
      <Route path="/receipt-voucher-entry" element={guarded(<ReceiptVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/receipt-voucher-list" element={guarded(<VoucherListPage title="RECEIPT VOUCHER LIST" filterVoucherTypeId={2} />, 'backoffice.vouchers')} />
      <Route path="/contra-voucher-entry" element={guarded(<ContraVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/journal-voucher-entry" element={guarded(<JournalVoucherEntry />, 'backoffice.vouchers')} />
      <Route path="/contra-journal-voucher-list" element={guarded(<VoucherListPage title="CONTRA / JOURNAL VOUCHER LIST" />, 'backoffice.vouchers')} />
      <Route path="/account-group-details" element={guarded(<AccountGroupDetails />, 'backoffice.accounts')} />
      <Route path="/account-ledger-details" element={guarded(<AccountLedgerDetails />, 'backoffice.accounts')} />
      <Route path="/trial-balance" element={guarded(<TrialBalance />, 'backoffice.accounts')} />
      <Route path="/financials" element={<Navigate to="/trial-balance" replace />} />
      <Route path="/financials/profit-and-loss-account" element={guarded(<ProfitAndLossAccount />, 'backoffice.accounts')} />
      <Route path="/financials/balance-sheet" element={guarded(<BalanceSheet />, 'backoffice.accounts')} />
      <Route path="/statement-payable-summary" element={guarded(<PayableSummary />, 'backoffice.accounts')} />
      <Route path="/statement-receivable-summary" element={guarded(<ReceivableSummary />, 'backoffice.accounts')} />
      <Route path="/statement-of-accounts-list" element={guarded(<VoucherListPage title="STATEMENT OF ACCOUNTS" />, 'backoffice.accounts')} />
      <Route path="/data-entry/customer-entry" element={guarded(<CustomerEntry />, 'backoffice.customers')} />
      <Route path="/data-entry/supplier-entry" element={guarded(<SupplierEntry />, 'backoffice.suppliers')} />
      <Route path="/data-entry/product-entry" element={guarded(<ProductEntry />, 'backoffice.product_master')} />
      <Route path="/data-entry/staff-entry" element={guarded(<StaffEntry />, ['core.users', 'backoffice.staff'])} />
      <Route path="/data-entry/role-entry" element={guarded(<RoleEntry />, 'core.roles')} />
      <Route path="/configuration/handle-permissions" element={guarded(<RoleManagement />, ['core.roles', 'core.permissions'])} />
      <Route path="/data-entry/roles" element={<Navigate to="/configuration/handle-permissions" replace />} />
      <Route path="/data-entry/group-entry" element={guarded(<GroupEntry />, 'backoffice.product_group')} />
      <Route path="/data-entry/sub-group-entry" element={guarded(<SubGroupEntry />, 'backoffice.product_group')} />
      <Route path="/data-entry/area-entry" element={guarded(<AreaEntry />, ['backoffice.area_master', 'pos.areas'])} />
      <Route path="/data-entry/table-entry" element={guarded(<TableEntry />, ['backoffice.table_master', 'pos.tables'])} />
      <Route path="/lists/product-price-list" element={guarded(<ProductPriceList />, 'backoffice.product_master')} />
      <Route path="/lists/customer-list" element={guarded(<CustomerList />, 'backoffice.customers')} />
      <Route path="/lists/supplier-list" element={guarded(<SupplierList />, 'backoffice.suppliers')} />
      <Route path="/lists/agent-list" element={guarded(<AgentList />, 'backoffice.staff')} />
      <Route path="/stock-hub" element={<Navigate to="/stock-hub/stock-adjustment" replace />} />
      <Route path="/stock-hub/stock-adjustment-list" element={guarded(<StockAdjustmentList />, 'backoffice.stock_adjustment')} />
      <Route path="/stock-hub/reorder-list" element={guarded(<ReorderList />, 'backoffice.reorder')} />
      <Route path="/stock-hub/stock-adjustment" element={guarded(<StockAdjustment />, 'backoffice.stock_adjustment')} />
      <Route path="/stock-hub/stock-adjustment/:id" element={guarded(<StockAdjustment />, 'backoffice.stock_adjustment')} />
      <Route path="/stock-hub/damage-entry" element={guarded(<DamageEntry />, 'backoffice.damage_entry')} />
      <Route path="/stock-hub/damage-entry/:id" element={guarded(<DamageEntry />, 'backoffice.damage_entry')} />
      <Route path="/stock-hub/damage-entry-list" element={guarded(<DamageEntryList />, 'backoffice.damage_entry')} />
      <Route path="/stock-hub/additional-stock-entry" element={guarded(<AdditionalStockEntry />, 'backoffice.stock_entry')} />
      <Route path="/stock-hub/additional-stock-entry/:id" element={guarded(<AdditionalStockEntry />, 'backoffice.stock_entry')} />
      <Route path="/stock-hub/additional-stock-entry-list" element={guarded(<AdditionalStockEntryList />, 'backoffice.stock_entry')} />
      <Route path="/stock-hub/product-movement" element={guarded(<ProductMovement />, 'backoffice.product_movement')} />
      <Route path="/exchange-hub" element={<Navigate to="/exchange-hub/currency-master" replace />} />
      <Route path="/exchange-hub/currency-master" element={guarded(<CurrencyMaster />, 'backoffice.exchange')} />
      <Route path="/exchange-hub/rate-entry" element={guarded(<ExchangeRateEntry />, 'backoffice.exchange')} />
      <Route path="/exchange-hub/rate-entry/:rateId" element={guarded(<ExchangeRateEntry />, 'backoffice.exchange')} />
      <Route path="/exchange-hub/rate-list" element={guarded(<ExchangeRateList />, 'backoffice.exchange')} />
      <Route path="/manufacturing" element={<Navigate to="/manufacturing/recipe-entry" replace />} />
      <Route path="/manufacturing/recipe-entry" element={guarded(<RecipeEntry />, 'backoffice.manufacturing')} />
      <Route path="/manufacturing/recipe-list" element={guarded(<RecipeList />, 'backoffice.manufacturing')} />
      <Route path="/manufacturing/production-order" element={guarded(<ProductionOrderEntry />, 'backoffice.manufacturing')} />
      <Route path="/manufacturing/production-order-list" element={guarded(<ProductionOrderList />, 'backoffice.manufacturing')} />
      <Route path="/manufacturing/material-requisition" element={guarded(<MaterialRequisition />, 'backoffice.manufacturing')} />
      <Route path="/logistics" element={<Navigate to="/logistics/delivery-schedule" replace />} />
      <Route path="/logistics/delivery-schedule" element={guarded(<DeliveryScheduleEntry />, 'backoffice.logistics')} />
      <Route path="/logistics/delivery-schedule-list" element={guarded(<DeliveryScheduleList />, 'backoffice.logistics')} />
      <Route path="/logistics/dispatch-entry" element={guarded(<DispatchEntry />, 'backoffice.logistics')} />
      <Route path="/logistics/delivery-tracking" element={guarded(<DeliveryTracking />, 'backoffice.logistics')} />
      <Route path="/logistics/driver-entry" element={guarded(<DriverEntry />, 'backoffice.logistics')} />
      <Route path="/logistics/vehicle-entry" element={guarded(<BackofficeVehicleEntry />, 'backoffice.logistics')} />
      <Route path="/reports" element={<Navigate to="/reports/sales-summary" replace />} />
      <Route path="/reports/sales-summary" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.sales'])} />
      <Route path="/reports/sales-by-customer" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.sales'])} />
      <Route path="/reports/sales-by-product" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.sales'])} />
      <Route path="/reports/sales-by-agent" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.sales'])} />
      <Route path="/reports/purchase-summary" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.purchase'])} />
      <Route path="/reports/supplier-purchase" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.purchase'])} />
      <Route path="/reports/stock-summary" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.inventory'])} />
      <Route path="/reports/product-movement-report" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.inventory'])} />
      <Route path="/reports/reorder-report" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.inventory'])} />
      <Route path="/reports/receivables-report" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.accounts'])} />
      <Route path="/reports/payables-report" element={guardedAll(<ReportsPlaceholderPage />, ['backoffice.reports', 'backoffice.accounts'])} />
      <Route path="/reports/attendance-report" element={guarded(<ReportsPlaceholderPage />, 'hr.reports')} />
      <Route path="/reports/leave-report" element={guarded(<ReportsPlaceholderPage />, 'hr.reports')} />
      <Route path="/management" element={<Navigate to="/management/company-settings" replace />} />
      <Route path="/management/company-settings" element={guarded(<ManagementPlaceholderPage />, 'core.users')} />
      <Route path="/management/branch-management" element={guarded(<ManagementPlaceholderPage />, 'core.users')} />
      <Route path="/management/user-management" element={guarded(<ManagementPlaceholderPage />, 'core.users')} />
      <Route path="/tools" element={<Navigate to="/tools/data-import" replace />} />
      <Route path="/tools/data-import" element={guarded(<ToolsPlaceholderPage />, 'core.settings')} />
      <Route path="/tools/data-export" element={guarded(<ToolsPlaceholderPage />, 'core.settings')} />
      <Route path="/tools/system-logs" element={guarded(<ToolsPlaceholderPage />, 'core.settings')} />
      <Route path="/deals-offers" element={<Navigate to="/deals-offers/discount-entry" replace />} />
      <Route path="/deals-offers/discount-entry" element={guarded(<DiscountEntry />, 'backoffice.deals_offers')} />
      <Route path="/deals-offers/discount-viewer" element={guarded(<DiscountViewer />, 'backoffice.deals_offers')} />
      <Route path="/deals-offers/gift-voucher-settings" element={guarded(<GiftVoucherSettings />, 'backoffice.deals_offers')} />
      <Route path="/deals-offers/gift-voucher-viewer" element={guarded(<GiftVoucherViewer />, 'backoffice.deals_offers')} />
      <Route path="/deals-offers/offer-packet-creation" element={guarded(<OfferPacketCreation />, 'backoffice.deals_offers')} />
      <Route path="/deals-offers/offer-packing-entry" element={guarded(<OfferPackingEntry />, 'backoffice.deals_offers')} />
      <Route path="/deals-offers/offer-unpacking-entry" element={guarded(<OfferUnpackingEntry />, 'backoffice.deals_offers')} />
      <Route path="/deals-offers/offer-packet-list" element={guarded(<OfferPacketList />, 'backoffice.deals_offers')} />

      {/* Garage Module */}
      <Route path="/garage" element={guarded(<Navigate to="/garage/job-card-entry" replace />, 'garage')} />
      <Route path="/garage/job-card-entry" element={guarded(<JobCardEntry />, 'garage')} />
      <Route path="/garage/job-card-list" element={guarded(<JobCardList />, 'garage')} />
      <Route path="/garage/estimation-entry" element={guarded(<EstimationEntry />, 'garage')} />
      <Route path="/garage/estimation-list" element={guarded(<EstimationList />, 'garage')} />
      <Route path="/garage/workshop-monitor" element={guarded(<WorkshopMonitor />, 'garage')} />
      <Route path="/garage/parts-search" element={guarded(<PartsSearch />, 'garage')} />
      <Route path="/garage/technician-monitor" element={guarded(<TechnicianMonitor />, 'garage')} />
      <Route path="/garage/vehicle-history" element={guarded(<VehicleHistory />, 'garage')} />
      <Route path="/garage/technician-entry" element={guarded(<TechnicianEntry />, 'garage')} />
      <Route path="/garage/job-description-entry" element={guarded(<JobDescriptionEntry />, 'garage')} />
      <Route path="/garage/branch-entry" element={guarded(<BranchEntry />, 'garage')} />
      <Route path="/garage/part-request" element={guarded(<PartRequest />, 'garage')} />
      <Route path="/garage/sublet-jobs" element={guarded(<SubletJobs />, 'garage')} />
      <Route path="/garage/gate-pass-viewer" element={guarded(<GatePassViewer />, 'garage')} />
      <Route path="/garage/punching-entry" element={guarded(<PunchingEntry />, 'garage')} />
      <Route path="/garage/job-code-punching" element={guarded(<JobCodePunching />, 'garage')} />
      <Route path="/garage/punching-list" element={guarded(<PunchingList />, 'garage')} />
      <Route path="/garage/pre-job-card-entry" element={guarded(<PreJobCardEntry />, 'garage')} />
      <Route path="/garage/additional-vehicle-history" element={guarded(<AdditionalVehicleHistory />, 'garage')} />
      <Route path="/garage/sublet-lpo" element={guarded(<SubletLpo />, 'garage')} />
      <Route path="/garage/consumable-entry" element={guarded(<ConsumableEntry />, 'garage')} />
      <Route path="/garage/lubricant-monitor" element={guarded(<LubricantMonitor />, 'garage')} />
      <Route path="/garage/consumable-monitor" element={guarded(<ConsumableMonitor />, 'garage')} />
      <Route path="/garage/sublet-monitor" element={guarded(<SubletMonitor />, 'garage')} />
      <Route path="/garage/home" element={guarded(<GarageHome />, 'garage')} />
      <Route path="/garage/dashboard" element={guarded(<GarageDashboard />, 'garage')} />
      <Route path="/garage/vehicle-list" element={guarded(<VehicleList />, 'garage')} />
      <Route path="/garage/vehicle-entry" element={guarded(<GarageVehicleEntry />, 'garage')} />
      <Route path="/garage/vehicle-entry/:id" element={guarded(<GarageVehicleEntry />, 'garage')} />
      <Route path="/garage/color-entry" element={<ColorEntry />} />
      <Route path="/garage/car-group-entry" element={<CarGroupEntry />} />
      <Route path="/garage/car-sub-group-entry" element={<CarSubGroupEntry />} />

      {/* HR Module */}
      <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
      <Route path="/hr/dashboard" element={guarded(<HRDashboard />, 'hr.dashboard')} />
      <Route path="/hr/employees" element={guarded(<EmployeeList />, 'hr.employee_master')} />
      <Route path="/hr/employee-entry" element={guarded(<EmployeeForm />, 'hr.employee_master')} />
      <Route path="/hr/employee-entry/:id" element={guarded(<EmployeeForm />, 'hr.employee_master')} />
      <Route path="/hr/employee-profile/:id" element={guarded(<EmployeeProfile />, 'hr.employee_master')} />
      <Route path="/hr/attendance" element={guarded(<AttendanceOverview />, 'hr.attendance')} />
      <Route path="/hr/leave-management" element={guarded(<LeaveManagement />, 'hr.leave')} />
      <Route path="/hr/shift-master" element={guarded(<ShiftMaster />, 'hr.shifts')} />
      <Route path="/hr/leave-type-master" element={guarded(<LeaveTypeMaster />, 'hr.leave')} />
      <Route path="/hr/document-type-master" element={guarded(<DocumentTypeMaster />, 'hr.document_types')} />

      {/* CRM Module */}
      <Route path="/crm" element={<Navigate to="/crm/dashboard" replace />} />
      <Route path="/crm/dashboard" element={guarded(<CRMDashboard />, 'crm.dashboard')} />
      <Route path="/crm/leads" element={guarded(<LeadListPage />, 'crm.leads')} />
      <Route path="/crm/lead-entry" element={guarded(<LeadEntryPage />, 'crm.leads')} />
      <Route path="/crm/lead-entry/:id" element={guarded(<LeadEntryPage />, 'crm.leads')} />
      <Route path="/crm/lead-workspace/:id" element={guarded(<LeadWorkspacePage />, 'crm.leads')} />
      <Route path="/crm/opportunities" element={guarded(<OpportunityListPage />, 'crm.opportunities')} />
      <Route path="/crm/opportunity-entry" element={guarded(<OpportunityEntryPage />, 'crm.opportunities')} />
      <Route path="/crm/opportunity-entry/:id" element={guarded(<OpportunityEntryPage />, 'crm.opportunities')} />
      <Route path="/crm/opportunity-workspace/:id" element={guarded(<OpportunityWorkspacePage />, 'crm.opportunities')} />
      <Route path="/crm/followups" element={guarded(<FollowUpListPage />, 'crm.followups')} />
      <Route path="/crm/interactions" element={guarded(<InteractionLogPage />, 'crm.interactions')} />
      <Route path="/crm/masters/lead-sources" element={guarded(<LeadSourceMasterPage />, 'crm.lead_sources')} />
      <Route path="/crm/masters/lead-statuses" element={guarded(<LeadStatusMasterPage />, 'crm.lead_statuses')} />
      <Route path="/crm/masters/opportunity-stages" element={guarded(<OpportunityStageMasterPage />, 'crm.opportunity_stages')} />

      <Route path="/locked" element={<LockedAccessPage />} />

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
