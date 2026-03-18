// src/components/layouts/ModuleTabs.jsx
import React, { useState } from 'react';
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
    { name: 'Product', icon: ProductIcon, actions: getActionItems(ProductIcon, ['Products', 'List', 'Edit', 'Search']) },
    { name: 'Quotation', icon: QuotationIcon, actions: getActionItems(QuotationIcon, ['Quotation', 'List', 'Edit', 'Search']) },
    { name: 'Delivery Order', icon: DeliveryIcon, actions: getActionItems(DeliveryIcon, ['Delivery', 'List', 'Edit', 'Search']) },
    { name: 'Sale', icon: SaleIcon, actions: getActionItems(SaleIcon, ['Sales', 'List', 'Edit', 'Search']) },
    { name: 'Sale Return', icon: ReturnIcon, actions: getActionItems(ReturnIcon, ['Returns', 'List', 'Edit', 'Search']) },
  ],
  supplier: [
    { name: 'Purchase', icon: ProductIcon, actions: getActionItems(ProductIcon, ['Purchases', 'List', 'Edit', 'Search']) },
    { name: 'Purchase Order', icon: QuotationIcon, actions: getActionItems(QuotationIcon, ['Orders', 'List', 'Edit', 'Search']) },
    { name: 'GRN', icon: DeliveryIcon, actions: getActionItems(DeliveryIcon, ['GRN', 'List', 'Edit', 'Search']) },
    { name: 'Supplier Invoice', icon: SaleIcon, actions: getActionItems(SaleIcon, ['Invoices', 'List', 'Edit', 'Search']) },
    { name: 'Supplier Return', icon: ReturnIcon, actions: getActionItems(ReturnIcon, ['Returns', 'List', 'Edit', 'Search']) },
  ],
  accounts: [
    { name: 'Ledger', icon: ProductIcon, actions: getActionItems(ProductIcon, ['Ledgers', 'List', 'Edit', 'Search']) },
    { name: 'Journal', icon: QuotationIcon, actions: getActionItems(QuotationIcon, ['Journals', 'List', 'Edit', 'Search']) },
    { name: 'Receipt', icon: DeliveryIcon, actions: getActionItems(DeliveryIcon, ['Receipts', 'List', 'Edit', 'Search']) },
    { name: 'Payment', icon: SaleIcon, actions: getActionItems(SaleIcon, ['Payments', 'List', 'Edit', 'Search']) },
    { name: 'Contra', icon: ReturnIcon, actions: getActionItems(ReturnIcon, ['Contras', 'List', 'Edit', 'Search']) },
  ],
};

export default function ModuleTabs() {
  const [activeTab, setActiveTab] = useState('customer');
  const [selectedAction, setSelectedAction] = useState({ module: null, action: null });

  const currentModules = moduleGroups[activeTab] || moduleGroups.customer;

  return (
    // <div className="sticky top-0 left-0 z-40 w-full min-w-0 min-h-[90px] sm:min-h-[105px] max-w-full bg-[#fde8e8] border-b border-[#fbd5d5] box-border m-2 sm:m-[15px] lg:max-w-[1240px]">
    //   <div className="border-b border-neutral-300 overflow-x-auto">
    //     <div className="flex items-center justify-start gap-4 sm:gap-8 px-2 sm:px-4 py-2 min-w-0">
    //       {['CUSTOMER', 'SUPPLIER', 'ACCOUNTS'].map((tab) => {
    //         const isActive = activeTab === tab.toLowerCase();
    //         return (
    //           <div
    //             key={tab}
    //             className="relative flex flex-col items-start pb-1 flex-shrink-0"
    //           >
    //             <button
    //               type="button"
    //               onClick={() => setActiveTab(tab.toLowerCase())}
    //               className="p-0 text-[9px] sm:text-[10px] font-bold text-black bg-transparent border-none cursor-pointer whitespace-nowrap"
    //             >
    //               {tab}
    //             </button>
    //             <div
    //               className={`absolute inset-x-0 -bottom-2 h-[2px] ${
    //                 isActive ? 'bg-[#800000]' : 'bg-transparent'
    //               }`}
    //             />
    //           </div>
    //         );
    //       })}
    //     </div>
    //   </div>

    //   <div className="flex flex-wrap gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 min-w-0">
    //     {currentModules.map((module) => (
    //       <div
    //         key={module.name}
    //         className="box-border flex min-h-14 sm:min-h-16 min-w-[100px] sm:min-w-[120px] flex-1 basis-[100px] sm:basis-[160px] max-w-full flex-col items-center justify-center rounded-[6px] bg-white/50 text-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm"
    //       >
    //         <div className="mb-1 sm:mb-1.5 text-[9px] sm:text-[10px] font-bold text-[#5A6578] leading-tight">
    //           {module.name}
    //         </div>
    //         <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
    //           {module.actions.map((action) => {
    //             const makeBlack = ['List', 'Edit', 'Search'].includes(action.label);
    //             const isSelected =
    //               selectedAction.module === module.name &&
    //               selectedAction.action === action.label;

    //             return (
    //               <button
    //                 key={action.label}
    //                 type="button"
    //                 onClick={() =>
    //                   setSelectedAction({ module: module.name, action: action.label })
    //                 }
    //                 className={`flex flex-col items-center gap-0.5 sm:gap-1 bg-transparent border-none p-0 cursor-pointer min-w-0 ${
    //                   isSelected ? 'text-[#800000]' : ''
    //                 }`}
    //               >
    //                 <img
    //                   src={action.icon}
    //                   alt=""
    //                   className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
    //                     isSelected
    //                       ? ''
    //                       : makeBlack
    //                       ? 'filter brightness-0'
    //                       : ''
    //                   }`}
    //                   style={
    //                     isSelected
    //                       ? {
    //                           filter:
    //                             'invert(13%) sepia(88%) saturate(3223%) hue-rotate(350deg) brightness(92%) contrast(105%)',
    //                         }
    //                       : undefined
    //                   }
    //                 />
    //                 <span
    //                   className={`text-[8px] sm:text-[10px] font-semibold truncate max-w-[4rem] sm:max-w-none ${
    //                     isSelected ? 'text-[#800000]' : 'text-[#5A6578]'
    //                   }`}
    //                 >
    //                   {action.label}
    //                 </span>
    //               </button>
    //             );
    //           })}
    //         </div>
            











    //       </div>
    //     ))}
    //   </div>
    // </div>


<div className="sticky top-0 left-0 z-40 w-full min-w-0 min-h-[90px] sm:min-h-[105px] bg-[#fde8e8] border-b border-[#fbd5d5] box-border m-2 sm:m-[15px] lg:max-w-[1240px]">
      {/* Tabs: CUSTOMER | SUPPLIER | ACCOUNTS */}
      <div className="border-b border-neutral-300 overflow-x-auto">
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
      <div className="flex flex-wrap gap-2 px-2 sm:px-4 py-3 min-w-0">   {/* ← gap between cards */}
        {currentModules.map((module) => (
          <div
            key={module.name}
            className="flex-1 basis-[100px] sm:basis-[160px] min-w-[100px] sm:min-w-[120px] 
                       min-h-14 sm:min-h-16 
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
                const makeBlack = ['List', 'Edit', 'Search'].includes(action.label);
                const isSelected =
                  selectedAction.module === module.name &&
                  selectedAction.action === action.label;

                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() =>
                      setSelectedAction({ module: module.name, action: action.label })
                    }
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

