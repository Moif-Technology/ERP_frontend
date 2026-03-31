// src/components/layouts/ModuleTabs.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductIcon from '../../assets/icons/ProductIcon.svg';
import QuotationIcon from '../../assets/icons/QuotationIcon.svg';
import DeliveryIcon from '../../assets/icons/DeliveryIcon.svg';
import SaleIcon from '../../assets/icons/SaleIcon.svg';
import ReturnIcon from '../../assets/icons/ReturnIcon.svg';
import SalesReturnIcon from '../../assets/icons/refresh.svg';
import PurchaseIcon from '../../assets/icons/purchase.svg';
import PurchaseOrderIcon from '../../assets/icons/purchase order.svg';
import GrnIcon from '../../assets/icons/grn.svg';
import SupplierInvoiceIcon from '../../assets/icons/invoice.svg';
import ListIcon from '../../assets/icons/list2.svg';
import SearchIcon from '../../assets/icons/search2.svg';
import ConfigIcon from '../../assets/icons/edit.svg';

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
    { name: 'Product', icon: ProductIcon, actions: getActionItems(ProductIcon, ['Products', 'List']) },
    { name: 'Quotation', icon: QuotationIcon, actions: getActionItems(QuotationIcon, ['Quotation', 'List']) },
    { name: 'Delivery Order', icon: DeliveryIcon, actions: getActionItems(DeliveryIcon, ['Delivery', 'List']) },
    { name: 'Sale', icon: SaleIcon, actions: getActionItems(SaleIcon, ['Sales', 'List']) },
    { name: 'Sale Return', icon: SalesReturnIcon, actions: getActionItems(SalesReturnIcon, ['Returns', 'List']) },
  ],
  supplier: [
    { name: 'Purchase', icon: PurchaseIcon, actions: getActionItems(PurchaseIcon, ['Purchases', 'List']) },
    { name: 'Local Purchase Order', icon: PurchaseOrderIcon, actions: getActionItems(PurchaseOrderIcon, ['LPO', 'List']) },
    { name: 'GRN', icon: GrnIcon, actions: getActionItems(GrnIcon, ['GRN', 'List']) },
    { name: 'Supplier Invoice', icon: SupplierInvoiceIcon, actions: getActionItems(SupplierInvoiceIcon, ['Invoices', 'List']) },
    { name: 'Supplier Return', icon: ReturnIcon, actions: getActionItems(ReturnIcon, ['Returns', 'List']) },
  ],
  accounts: [
    { name: 'Ledger', icon: ProductIcon, actions: getActionItems(ProductIcon, ['Ledgers', 'List']) },
    { name: 'Journal', icon: QuotationIcon, actions: getActionItems(QuotationIcon, ['Journals', 'List']) },
    { name: 'Receipt', icon: DeliveryIcon, actions: getActionItems(DeliveryIcon, ['Receipts', 'List']) },
    { name: 'Payment', icon: SaleIcon, actions: getActionItems(SaleIcon, ['Payments', 'List']) },
    { name: 'Contra', icon: ReturnIcon, actions: getActionItems(ReturnIcon, ['Contras', 'List']) },
  ],
};

export default function ModuleTabs({ expanded, onExpandedChange }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer');
  const [selectedAction, setSelectedAction] = useState({ module: null, action: null });

  const currentModules = moduleGroups[activeTab] || moduleGroups.customer;
  const activeTabLabel = activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : '';

  const handleActionClick = (module, action) => {
    setSelectedAction({ module, action });
    if (module === 'Sale' && action === 'Sales') {
      navigate('/sales');
    }
    if (module === 'Quotation' && (action === 'Quotation' || action === 'List')) {
      navigate('/quotation');
    }
    if (module === 'Delivery Order' && (action === 'Delivery' || action === 'List')) {
      navigate('/delivery-order');
    }
    if (module === 'Purchase' && (action === 'Purchases' || action === 'List')) {
      navigate('/purchase');
    }
    if (module === 'Local Purchase Order' && (action === 'LPO' || action === 'List')) {
      navigate('/purchase-order');
    }
    if (module === 'GRN' && (action === 'GRN' || action === 'List')) {
      navigate('/goods-receive-note');
    }
    if (module === 'Sale Return' && (action === 'Returns' || action === 'List')) {
      navigate('/sales-return');
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
          <div className="flex items-end justify-start gap-4 sm:gap-8 px-2 sm:px-4 pt-2 pb-0 pr-11 sm:pr-12">
            {['CUSTOMER', 'SUPPLIER', 'ACCOUNTS'].map((tab) => {
              const isActive = activeTab === tab.toLowerCase();
              return (
                <div key={tab} className="flex flex-shrink-0 flex-col items-stretch gap-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className="border-none bg-transparent p-0 text-left text-[9px] sm:text-[10px] font-bold tracking-wide text-slate-800 cursor-pointer whitespace-nowrap hover:text-slate-950 transition-colors"
                  >
                    {tab}
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
              <span className="truncate text-[10px] font-semibold text-slate-800 sm:text-[11px]">
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
              className="flex-none w-[120px] h-[64px] rounded-md bg-white/60 p-1 shadow-sm ring-1 ring-rose-100/70 backdrop-blur-sm"
            >
              <div className="mb-2 text-[9px] sm:text-[10px] font-bold text-[#5A6578] leading-tight text-center">
                {module.name}
              </div>
              <div className="flex flex-wrap gap-0 p-1">
                {module.actions.map((action) => {
                  const makeBlack = ['List'].includes(action.label);
                  const isSelected =
                    selectedAction.module === module.name &&
                    selectedAction.action === action.label;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => handleActionClick(module.name, action.label)}
                      className="flex min-w-0 flex-1 basis-[calc(50%-1px)] cursor-pointer flex-col items-center gap-0 p-0"
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
