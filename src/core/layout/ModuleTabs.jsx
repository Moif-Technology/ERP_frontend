// src/core/layout/ModuleTabs.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAnyFeature } from '../access/access.service.js';
import ProductIcon from '../../shared/assets/icons/ProductIcon.svg';
import QuotationIcon from '../../shared/assets/icons/QuotationIcon.svg';
import DeliveryIcon from '../../shared/assets/icons/DeliveryIcon.svg';
import SaleIcon from '../../shared/assets/icons/SaleIcon.svg';
import ReturnIcon from '../../shared/assets/icons/ReturnIcon.svg';
import SalesReturnIcon from '../../shared/assets/icons/refresh.svg';
import PurchaseIcon from '../../shared/assets/icons/purchase.svg';
import PurchaseOrderIcon from '../../shared/assets/icons/purchase order.svg';
import GrnIcon from '../../shared/assets/icons/grn.svg';
import SupplierInvoiceIcon from '../../shared/assets/icons/invoice.svg';
import ListIcon from '../../shared/assets/icons/list2.svg';
import SearchIcon from '../../shared/assets/icons/search2.svg';
import ConfigIcon from '../../shared/assets/icons/edit.svg';
import PurchaseVoucherIcon from '../../shared/assets/icons/purchase_voucher.svg';
import SalesVoucherIcon from '../../shared/assets/icons/sales_voucher.svg';
import DebitNoteIcon from '../../shared/assets/icons/debit_note.svg';
import CreditNoteIcon from '../../shared/assets/icons/creadit_note.svg';
import IncomeIcon from '../../shared/assets/icons/Income.svg';
import ExpenceIcon from '../../shared/assets/icons/expence.svg';
import PaymentSupplierIcon from '../../shared/assets/icons/payment_supplier.svg';
import PaymentEntryIcon from '../../shared/assets/icons/payment_entry.svg';
import ReceiptCustomerIcon from '../../shared/assets/icons/receipt_cutomer.svg';
import ReceiptVoucherIcon from '../../shared/assets/icons/Receipt.svg';
import LedgerModuleIcon from '../../shared/assets/icons/ledger_module.svg';
import GroupDetailsIcon from '../../shared/assets/icons/group_details.svg';
import LedgerDetailsIcon from '../../shared/assets/icons/ledger.svg';
import TrialBalanceIcon from '../../shared/assets/icons/trial_balance.svg';
import PayableSummaryIcon from '../../shared/assets/icons/payable.svg';
import ReceivableSummaryIcon from '../../shared/assets/icons/receivable.svg';
import LeaveTypeIcon from '../../shared/assets/icons/leave-type.svg';
import GarageJobCardIcon from '../../shared/assets/icons/garage-job-card.svg';
import GarageEstimationIcon from '../../shared/assets/icons/garage-estimation.svg';
import GarageWorkshopMonitorIcon from '../../shared/assets/icons/garage-workshop-monitor.svg';
import GaragePartsSearchIcon from '../../shared/assets/icons/garage-parts-search.svg';
import GarageTechnicianMonitorIcon from '../../shared/assets/icons/garage-technician-monitor.svg';
import GarageVehicleHistoryIcon from '../../shared/assets/icons/garage-vehicle-history.svg';

function ExpandChevron({ expanded }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-slate-600 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BreadcrumbChevron() {
  return (
    <svg
      className="h-3 w-3 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const getActionItems = (moduleIcon, labels) => {
  const iconMap = { List: ListIcon, Edit: ConfigIcon, Search: SearchIcon };
  return labels.map((label) => ({
    label,
    icon: iconMap[label] || moduleIcon,
  }));
};

const moduleGroups = {
  customer: [
    { name: 'Product', icon: ProductIcon, feature: 'backoffice.product_master', actions: getActionItems(ProductIcon, ['Product entry', 'List']) },
    { name: 'Quotation', icon: QuotationIcon, feature: 'backoffice.sales_quotation', actions: getActionItems(QuotationIcon, ['Quotation', 'List']) },
    { name: 'Delivery Order', icon: DeliveryIcon, feature: 'backoffice.delivery_order', actions: getActionItems(DeliveryIcon, ['Delivery', 'List']) },
    { name: 'Sale', icon: SaleIcon, feature: 'backoffice.sales', actions: getActionItems(SaleIcon, ['Sales', 'List']) },
    { name: 'Sale Return', icon: SalesReturnIcon, feature: 'backoffice.sales', actions: getActionItems(SalesReturnIcon, ['Returns', 'List']) },
  ],
  supplier: [
    { name: 'Purchase', icon: PurchaseIcon, feature: 'backoffice.purchase', actions: getActionItems(PurchaseIcon, ['Purchases', 'List']) },
    { name: 'Local Purchase Order', icon: PurchaseOrderIcon, feature: 'backoffice.purchase_order', actions: getActionItems(PurchaseOrderIcon, ['LPO', 'List']) },
    { name: 'GRN', icon: GrnIcon, feature: 'backoffice.grn', actions: getActionItems(GrnIcon, ['GRN', 'List']) },
    { name: 'Supplier Invoice', icon: SupplierInvoiceIcon, feature: 'backoffice.purchase', actions: getActionItems(SupplierInvoiceIcon, ['Invoices', 'List']) },
    { name: 'Supplier Return', icon: ReturnIcon, feature: 'backoffice.purchase', actions: getActionItems(ReturnIcon, ['Returns', 'List']) },
  ],
  accounts: [
    { name: 'Purchase voucher', icon: PurchaseVoucherIcon, feature: 'backoffice.vouchers', actions: getActionItems(PurchaseVoucherIcon, ['Purchase voucher', 'List']) },
    { name: 'Sales voucher', icon: SalesVoucherIcon, feature: 'backoffice.vouchers', actions: getActionItems(SalesVoucherIcon, ['Sales voucher', 'List']) },
    {
      name: 'Debit / Credit notes',
      icon: DebitNoteIcon,
      feature: 'backoffice.vouchers',
      actions: [
        { label: 'Debit note', icon: DebitNoteIcon },
        { label: 'Debit list', icon: ListIcon },
        { label: 'Credit note', icon: CreditNoteIcon },
        { label: 'Credit list', icon: ListIcon },
      ],
    },
    {
      name: 'Income/Expense voucher',
      icon: IncomeIcon,
      feature: 'backoffice.vouchers',
      actions: [
        { label: 'Income', icon: IncomeIcon },
        { label: 'Income list', icon: ListIcon },
        { label: 'Expence', icon: ExpenceIcon },
        { label: 'Expense list', icon: ListIcon },
      ],
    },
    {
      name: 'Payment Voucher',
      icon: PaymentEntryIcon,
      feature: 'backoffice.vouchers',
      actions: [
        { label: 'Payment Voucher supplier', icon: PaymentSupplierIcon },
        { label: 'Payment voucher', icon: PaymentEntryIcon },
        { label: 'List', icon: ListIcon },
      ],
    },
    {
      name: 'Receipt voucher',
      icon: ReceiptVoucherIcon,
      feature: 'backoffice.vouchers',
      actions: [
        { label: 'Receipt (customer)', icon: ReceiptCustomerIcon },
        { label: 'Receipt voucher', icon: ReceiptVoucherIcon },
        { label: 'List', icon: ListIcon },
      ],
    },
    {
      name: 'Contra / Journal',
      icon: QuotationIcon,
      feature: 'backoffice.vouchers',
      actions: [
        { label: 'Contra voucher', icon: LedgerModuleIcon },
        { label: 'Journal voucher', icon: QuotationIcon },
        { label: 'List', icon: ListIcon },
      ],
    },
    {
      name: 'Account details',
      icon: GroupDetailsIcon,
      feature: 'backoffice.accounts',
      actions: [
        { label: 'Group details', icon: GroupDetailsIcon },
        { label: 'Ledger details', icon: LedgerDetailsIcon },
        { label: 'Trial balance', icon: TrialBalanceIcon },
      ],
    },
    {
      name: 'Statement of accounts',
      icon: ListIcon,
      feature: 'backoffice.accounts',
      actions: [
        { label: 'Payable summary', icon: PayableSummaryIcon },
        { label: 'Receivable summary', icon: ReceivableSummaryIcon },
        { label: 'List', icon: ListIcon },
      ],
    },
  ],
  hr: [
    {
      name: 'Overview',
      icon: ListIcon,
      features: ['hr.dashboard', 'hr.attendance', 'hr.leave'],
      actions: [
        { label: 'Dashboard', icon: TrialBalanceIcon },
        { label: 'Attendance', icon: SearchIcon },
        { label: 'Leaves', icon: LeaveTypeIcon },
      ],
    },
    {
      name: 'Employee',
      icon: GroupDetailsIcon,
      feature: 'hr.employee_master',
      actions: [
        { label: 'Directory', icon: ListIcon },
        { label: 'Add Employee', icon: ConfigIcon },
      ],
    },
    {
      name: 'Masters',
      icon: LedgerModuleIcon,
      features: ['hr.shifts', 'hr.leave', 'hr.document_types'],
      actions: [
        { label: 'Shift Master', icon: ConfigIcon },
        { label: 'Leave Master', icon: LeaveTypeIcon },
        { label: 'Document Master', icon: ConfigIcon },
      ],
    },
  ],
  garage: [
    {
      name: 'Job card entry',
      icon: GarageJobCardIcon,
      feature: 'garage',
      actions: getActionItems(GarageJobCardIcon, ['Entry', 'List']),
    },
    {
      name: 'Estimation entry',
      icon: GarageEstimationIcon,
      feature: 'garage',
      actions: getActionItems(GarageEstimationIcon, ['Entry', 'List']),
    },
    {
      name: 'Workshop monitor',
      icon: GarageWorkshopMonitorIcon,
      feature: 'garage',
      actions: getActionItems(GarageWorkshopMonitorIcon, ['Monitor']),
    },
    {
      name: 'Parts search',
      icon: GaragePartsSearchIcon,
      feature: 'garage',
      actions: getActionItems(GaragePartsSearchIcon, ['Search']),
    },
    {
      name: 'Technician monitor',
      icon: GarageTechnicianMonitorIcon,
      feature: 'garage',
      actions: getActionItems(GarageTechnicianMonitorIcon, ['Monitor']),
    },
    {
      name: 'Vehicle history',
      icon: GarageVehicleHistoryIcon,
      feature: 'garage',
      actions: getActionItems(GarageVehicleHistoryIcon, ['History']),
    },
  ],
};

export default function ModuleTabs({ expanded, onExpandedChange }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer');
  const [selectedAction, setSelectedAction] = useState({ module: null, action: null });

  const availableTabs = [
    { key: 'customer', label: 'CUSTOMER', features: ['backoffice.product_master', 'backoffice.sales', 'backoffice.sales_quotation', 'backoffice.delivery_order'] },
    { key: 'supplier', label: 'SUPPLIER', features: ['backoffice.purchase', 'backoffice.purchase_order', 'backoffice.grn'] },
    { key: 'accounts', label: 'ACCOUNTS', features: ['backoffice.accounts', 'backoffice.vouchers'] },
    { key: 'garage', label: 'GARAGE', features: ['garage'] },
    { key: 'hr', label: 'HR', features: ['hr'] },
  ].filter((tab) => hasAnyFeature(tab.features));

  const safeActiveTab = availableTabs.some((tab) => tab.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key || 'customer';
  const currentModules = (moduleGroups[safeActiveTab] || moduleGroups.customer).filter((module) =>
    hasAnyFeature(module.features ?? module.feature),
  );
  const activeTabLabel = safeActiveTab ? safeActiveTab.charAt(0).toUpperCase() + safeActiveTab.slice(1) : '';
  const isAccountsTab = safeActiveTab === 'accounts';

  const handleActionClick = (module, action) => {
    setSelectedAction({ module, action });
    if (module === 'Product' && action === 'Product entry') {
      navigate('/data-entry/product-entry');
    }
    if (module === 'Product' && action === 'List') {
      navigate('/products');
    }
    if (module === 'Sale' && action === 'Sales') {
      navigate('/sales');
    }
    if (module === 'Sale' && action === 'List') {
      navigate('/sales-list');
    }
    if (module === 'Quotation' && action === 'Quotation') {
      navigate('/quotation');
    }
    if (module === 'Quotation' && action === 'List') {
      navigate('/quotation-list');
    }
    if (module === 'Delivery Order' && action === 'Delivery') {
      navigate('/delivery-order');
    }
    if (module === 'Delivery Order' && action === 'List') {
      navigate('/delivery-order-list');
    }
    if (module === 'Purchase' && (action === 'Purchases' || action === 'List')) {
      navigate(action === 'List' ? '/purchase-list' : '/purchase');
    }
    if (module === 'Local Purchase Order' && (action === 'LPO' || action === 'List')) {
      navigate(action === 'List' ? '/purchase-order-list' : '/purchase-order');
    }
    if (module === 'GRN' && (action === 'GRN' || action === 'List')) {
      navigate(action === 'List' ? '/goods-receive-note-list' : '/goods-receive-note');
    }
    if (module === 'Sale Return' && (action === 'Returns' || action === 'List')) {
      navigate('/sales-return');
    }
    if (module === 'Purchase voucher' && action === 'Purchase voucher') {
      navigate('/purchase-voucher-entry');
    }
    if (module === 'Purchase voucher' && action === 'List') {
      navigate('/purchase-voucher-list');
    }
    if (module === 'Sales voucher' && action === 'Sales voucher') {
      navigate('/sales-voucher-entry');
    }
    if (module === 'Sales voucher' && action === 'List') {
      navigate('/sales-voucher-list');
    }
    if (module === 'Debit / Credit notes' && action === 'Debit note') {
      navigate('/debit-note-entry');
    }
    if (module === 'Debit / Credit notes' && action === 'Debit list') {
      navigate('/debit-note-list');
    }
    if (module === 'Debit / Credit notes' && action === 'Credit note') {
      navigate('/credit-note-entry');
    }
    if (module === 'Debit / Credit notes' && action === 'Credit list') {
      navigate('/credit-note-list');
    }
    if (module === 'Income/Expense voucher' && action === 'Income') {
      navigate('/income-voucher');
    }
    if (module === 'Income/Expense voucher' && action === 'Income list') {
      navigate('/income-voucher-list');
    }
    if (module === 'Income/Expense voucher' && action === 'Expence') {
      navigate('/expense-voucher');
    }
    if (module === 'Income/Expense voucher' && action === 'Expense list') {
      navigate('/expense-voucher-list');
    }
    if (module === 'Payment Voucher' && action === 'Payment Voucher supplier') {
      navigate('/payment-voucher-supplier');
    }
    if (module === 'Payment Voucher' && action === 'Payment voucher') {
      navigate('/payment-voucher');
    }
    if (module === 'Payment Voucher' && action === 'List') {
      navigate('/payment-voucher-list');
    }
    if (module === 'Receipt voucher' && action === 'Receipt (customer)') {
      navigate('/receipt-voucher-customer');
    }
    if (module === 'Receipt voucher' && action === 'Receipt voucher') {
      navigate('/receipt-voucher-entry');
    }
    if (module === 'Receipt voucher' && action === 'List') {
      navigate('/receipt-voucher-list');
    }
    if (module === 'Contra / Journal' && action === 'Contra voucher') {
      navigate('/contra-voucher-entry');
    }
    if (module === 'Contra / Journal' && action === 'Journal voucher') {
      navigate('/journal-voucher-entry');
    }
    if (module === 'Contra / Journal' && action === 'List') {
      navigate('/contra-journal-voucher-list');
    }
    if (module === 'Account details' && action === 'Group details') {
      navigate('/account-group-details');
    }
    if (module === 'Account details' && action === 'Ledger details') {
      navigate('/account-ledger-details');
    }
    if (module === 'Account details' && action === 'Trial balance') {
      navigate('/trial-balance');
    }
    if (module === 'Statement of accounts' && action === 'Payable summary') {
      navigate('/statement-payable-summary');
    }
    if (module === 'Statement of accounts' && action === 'Receivable summary') {
      navigate('/statement-receivable-summary');
    }
    if (module === 'Statement of accounts' && action === 'List') {
      navigate('/statement-of-accounts-list');
    }
    // Garage Routes
    if (module === 'Job card entry' && action === 'Entry') {
      navigate('/garage/job-card-entry');
    }
    if (module === 'Job card entry' && action === 'List') {
      navigate('/garage/job-card-list');
    }
    if (module === 'Estimation entry' && action === 'Entry') {
      navigate('/garage/estimation-entry');
    }
    if (module === 'Estimation entry' && action === 'List') {
      navigate('/garage/estimation-list');
    }
    if (module === 'Workshop monitor' && action === 'Monitor') {
      navigate('/garage/workshop-monitor');
    }
    if (module === 'Parts search' && action === 'Search') {
      navigate('/garage/parts-search');
    }
    if (module === 'Technician monitor' && action === 'Monitor') {
      navigate('/garage/technician-monitor');
    }
    if (module === 'Vehicle history' && action === 'History') {
      navigate('/garage/vehicle-history');
    }
    // HR Routes
    if (module === 'Employee' && action === 'Directory') {
      navigate('/hr/employees');
    }
    if (module === 'Employee' && action === 'Add Employee') {
      navigate('/hr/employee-entry');
    }
    if (module === 'Overview' && action === 'Dashboard') {
      navigate('/hr/dashboard');
    }
    if (module === 'Overview' && action === 'Attendance') {
      navigate('/hr/attendance');
    }
    if (module === 'Overview' && action === 'Leaves') {
      navigate('/hr/leave-management');
    }
    if (module === 'Masters' && action === 'Shift Master') {
      navigate('/hr/shift-master');
    }
    if (module === 'Masters' && action === 'Leave Master') {
      navigate('/hr/leave-type-master');
    }
    if (module === 'Masters' && action === 'Document Master') {
      navigate('/hr/document-type-master');
    }
  };

  return (
    <div
      className={`sticky top-0 left-0 z-40 min-w-0 overflow-hidden rounded-lg bg-[#fde8e8] shadow-sm ring-1 ring-rose-200/60 box-border my-2 sm:my-[15px] mx-[15px] ${
        expanded ? 'min-h-[90px] sm:min-h-[105px]' : ''
      }`}
    >
      <div className="relative border-b border-rose-200/60">
        {expanded ? (
          <div className="flex items-end justify-start gap-4 sm:gap-8 px-2 sm:px-4 pt-2 pb-0 pr-11 sm:pr-12 overflow-x-auto no-scrollbar">
            {availableTabs.map((tab) => {
              const isActive = safeActiveTab === tab.key;
              return (
                <div key={tab.key} className="flex flex-shrink-0 flex-col items-stretch gap-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="border-none bg-transparent p-0 text-left text-[9px] sm:text-[10px] font-bold tracking-wide text-slate-800 cursor-pointer whitespace-nowrap hover:text-slate-950 transition-colors"
                  >
                    {tab.label}
                  </button>
                  <div
                    className={`h-0.5 w-full rounded-full ${isActive ? 'bg-[#800000]' : 'bg-transparent'}`}
                    aria-hidden
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-1.5 px-2 sm:px-4 py-2 pr-11 sm:pr-12">
            <span className="truncate text-[10px] font-semibold text-slate-800 sm:text-[11px]">
              {activeTabLabel}
            </span>
            {(selectedAction?.module || selectedAction?.action) && <BreadcrumbChevron />}
            {selectedAction?.module && (
              <span className="max-w-[min(100%,14rem)] truncate whitespace-nowrap text-[10px] font-semibold text-slate-800 sm:text-[11px]">
                {selectedAction.module}
              </span>
            )}
            {selectedAction?.action && (
              <>
                <BreadcrumbChevron />
                <span className="truncate text-[10px] font-medium text-slate-700 sm:text-[11px]">
                  {selectedAction.action}
                </span>
              </>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => onExpandedChange((v) => !v)}
          className={`absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 ${
            expanded ? 'h-8 w-8' : 'h-6 w-6'
          }`}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide toolbars' : 'Show toolbars'}
        >
          <span className={expanded ? '' : 'scale-[0.85]'} aria-hidden>
            <ExpandChevron expanded={expanded} />
          </span>
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-wrap justify-start gap-3 px-2 sm:px-4 py-3 min-w-0">
          {currentModules.map((module) => (
            <div
              key={module.name}
              className={`flex-none rounded-md bg-white/60 p-1 shadow-sm ring-1 ring-rose-100/70 backdrop-blur-sm ${
                isAccountsTab
                  ? module.actions?.length === 4
                    ? 'h-[64px] w-[252px] sm:h-[64px] sm:w-[272px]'
                    : module.actions?.length === 3
                      ? 'h-[64px] w-[198px] sm:w-[210px]'
                      : 'h-[64px] w-[162px] sm:w-[172px]'
                  : module.name === 'Product'
                    ? 'h-[64px] w-[156px] sm:w-[172px]'
                    : 'h-[64px] w-[120px]'
              }`}
            >
              <div
                className={`mb-2 font-bold leading-tight text-[#5A6578] text-center whitespace-nowrap px-0.5 ${
                  isAccountsTab ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'
                }`}
              >
                {module.name}
              </div>
              <div
                className={`flex gap-0 p-1 ${
                  module.actions?.length === 3 ||
                  module.actions?.length === 4 ||
                  module.name === 'Product'
                    ? 'flex-nowrap'
                    : 'flex-wrap'
                }`}
              >
                {module.actions.map((action) => {
                  const makeBlack = ['List', 'Debit list', 'Credit list', 'Income list', 'Expense list'].includes(
                    action.label,
                  );
                  const isSelected =
                    selectedAction.module === module.name &&
                    selectedAction.action === action.label;
                  const oneRow =
                    module.actions?.length === 3 ||
                    module.actions?.length === 4 ||
                    module.name === 'Product';

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleActionClick(module.name, action.label)}
                      className={`flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-0 p-0 ${
                        oneRow ? 'basis-0 shrink' : 'basis-[calc(50%-1px)]'
                      }`}
                    >
                      <img
                        src={action.icon}
                        alt=""
                        className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                          isSelected ? '' : makeBlack ? 'filter brightness-0' : ''
                        }`}
                        style={
                          isSelected
                            ? {
                                filter:
                                  'invert(13%) sepia(88%) saturate(3223%) hue-rotate(350deg) brightness(92%) contrast(105%)',
                              }
                            : undefined
                        }
                      />
                      <span
                        className={`w-full truncate text-center text-[7px] sm:text-[9px] font-semibold ${
                          isSelected ? 'text-[#800000]' : 'text-[#5A6578]'
                        }`}
                      >
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
