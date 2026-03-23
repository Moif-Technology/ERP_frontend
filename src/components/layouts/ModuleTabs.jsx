// src/components/layouts/ModuleTabs.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../constants/theme';

import ProductIcon from '../../assets/icons/ProductIcon.svg';
import QuotationIcon from '../../assets/icons/QuotationIcon.svg';
import DeliveryIcon from '../../assets/icons/DeliveryIcon.svg';
import SaleIcon from '../../assets/icons/SaleIcon.svg';
import ReturnIcon from '../../assets/icons/ReturnIcon.svg';
import ListIcon from '../../assets/icons/list2.svg';
import SearchIcon from '../../assets/icons/search2.svg';
import ConfigIcon from '../../assets/icons/edit.svg';

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
    { name: 'Sale Return', icon: ReturnIcon, actions: getActionItems(ReturnIcon, ['Returns', 'List']) },
  ],
  supplier: [
    { name: 'Purchase', icon: ProductIcon, actions: getActionItems(ProductIcon, ['Purchases', 'List']) },
    { name: 'Purchase Order', icon: QuotationIcon, actions: getActionItems(QuotationIcon, ['Orders', 'List']) },
    { name: 'GRN', icon: DeliveryIcon, actions: getActionItems(DeliveryIcon, ['GRN', 'List']) },
    { name: 'Supplier Invoice', icon: SaleIcon, actions: getActionItems(SaleIcon, ['Invoices', 'List']) },
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

export default function ModuleTabs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer');
  const [selectedAction, setSelectedAction] = useState({ module: null, action: null });

  const currentModules = moduleGroups[activeTab] || moduleGroups.customer;

  const handleActionClick = (module, action) => {
    setSelectedAction({ module, action });
    if (module === 'Sale' && action === 'Sales') {
      navigate('/sales');
    }
  };

  return (


<div className="sticky top-0 left-0 z-40 min-w-0 min-h-[90px]  sm:min-h-[105px] bg-[#fde8e8] border-b border-[#fbd5d5] box-border my-2 sm:my-[15px] mx-[15px]">
      {/* Tabs: CUSTOMER | SUPPLIER | ACCOUNTS */}
      <div className="border-b border-neutral-300 overflow-x-hidden">
        <div className="flex items-center justify-start gap-4 sm:gap-8 px-2 sm:px-4 py-2">
          {['CUSTOMER', 'SUPPLIER', 'ACCOUNTS'].map((tab) => {
            const isActive = activeTab === tab.toLowerCase();
            return (
              <div key={tab} className="relative flex flex-col items-start pb-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className="p-0 text-[9px] sm:text-[10px] font-bold text-black bg-transparent border-none cursor-pointer whitespace-nowrap"
                >
                  {tab}
                </button>
                <div
                  className={`absolute inset-x-0 -bottom-2 h-[2px] ${
                    isActive ? 'bg-[#800000]' : 'bg-transparent'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Cards */}
      <div className="flex flex-wrap justify-start gap-3 px-2 sm:px-4 py-3 min-w-0">   {/* 12px gap between cards */}
        {currentModules.map((module) => (
          <div
            key={module.name}
            className="flex-none w-[120px] h-[64px]
                       rounded-[6px] bg-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                       backdrop-blur-sm p-1"   // ← 12px padding (inner box distance)
          >
            {/* Module Title */}
            <div className="mb-2 text-[9px] sm:text-[10px] font-bold text-[#5A6578] leading-tight text-center">
              {module.name}
            </div>

            {/* Action Buttons - Gap = 6px */}
            <div className="flex flex-wrap gap-0 p-1">   {/* ← this is your 6px gap */}
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
                    className={`flex flex-col items-center gap-0 p-0 cursor-pointer min-w-0 flex-1 basis-[calc(10.33%-1px)]`}
                  >
                    <img
                      src={action.icon}
                      alt=""
                      className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                        isSelected
                          ? ''
                          : makeBlack
                          ? 'filter brightness-0'
                          : ''
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
                      className={`text-[7px] sm:text-[9px] font-semibold truncate text-center w-full ${
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
    </div>


  );
}

