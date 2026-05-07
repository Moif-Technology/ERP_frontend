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
import VehicleEntry from './modules/garage/pages/VehicleEntry';
import VehicleList from './modules/garage/pages/VehicleList';
import ColorEntry from './modules/garage/pages/ColorEntry';
import CarGroupEntry from './modules/garage/pages/CarGroupEntry';
import CarSubGroupEntry from './modules/garage/pages/CarSubGroupEntry';

const guarded = (element, features) => (
  <FeatureGuard any={features}>{element}</FeatureGuard>
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
      <Route path="/data-entry/customer-entry" element={guarded(<CustomerEntry />, ['core.customers', 'backoffice.customers'])} />
      <Route path="/data-entry/supplier-entry" element={guarded(<SupplierEntry />, ['core.suppliers', 'backoffice.suppliers'])} />
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
      <Route path="/lists/customer-list" element={guarded(<CustomerList />, ['core.customers', 'backoffice.customers', 'crm'])} />
      <Route path="/lists/supplier-list" element={guarded(<SupplierList />, ['core.suppliers', 'backoffice.suppliers', 'backoffice.purchase'])} />
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
      <Route path="/garage" element={<Navigate to="/garage/job-card-entry" replace />} />
      <Route path="/garage/job-card-entry" element={<JobCardEntry />} />
      <Route path="/garage/job-card-list" element={<JobCardList />} />
      <Route path="/garage/estimation-entry" element={<EstimationEntry />} />
      <Route path="/garage/estimation-list" element={<EstimationList />} />
      <Route path="/garage/workshop-monitor" element={<WorkshopMonitor />} />
      <Route path="/garage/parts-search" element={<PartsSearch />} />
      <Route path="/garage/technician-monitor" element={<TechnicianMonitor />} />
      <Route path="/garage/vehicle-history" element={<VehicleHistory />} />
      <Route path="/garage/technician-entry" element={<TechnicianEntry />} />
      <Route path="/garage/job-description-entry" element={<JobDescriptionEntry />} />
      <Route path="/garage/branch-entry" element={<BranchEntry />} />
      <Route path="/garage/part-request" element={<PartRequest />} />
      <Route path="/garage/sublet-jobs" element={<SubletJobs />} />
      <Route path="/garage/gate-pass-viewer" element={<GatePassViewer />} />
      <Route path="/garage/punching-entry" element={<PunchingEntry />} />
      <Route path="/garage/job-code-punching" element={<JobCodePunching />} />
      <Route path="/garage/punching-list" element={<PunchingList />} />
      <Route path="/garage/pre-job-card-entry" element={<PreJobCardEntry />} />
      <Route path="/garage/additional-vehicle-history" element={<AdditionalVehicleHistory />} />
      <Route path="/garage/sublet-lpo" element={<SubletLpo />} />
      <Route path="/garage/consumable-entry" element={<ConsumableEntry />} />
      <Route path="/garage/lubricant-monitor" element={<LubricantMonitor />} />
      <Route path="/garage/consumable-monitor" element={<ConsumableMonitor />} />
      <Route path="/garage/sublet-monitor" element={<SubletMonitor />} />
      <Route path="/garage/home" element={<GarageHome />} />
      <Route path="/garage/dashboard" element={<GarageDashboard />} />
      <Route path="/garage/vehicle-list" element={<VehicleList />} />
      <Route path="/garage/vehicle-entry" element={<VehicleEntry />} />
      <Route path="/garage/vehicle-entry/:id" element={<VehicleEntry />} />
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
