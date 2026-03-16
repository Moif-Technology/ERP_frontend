// src/components/common/ModuleTabs.jsx
import React, { useState } from 'react';
import { colors } from '../constants/theme';

// Icons – replace with your real paths
import ProductIcon from '../assets/icons/ProductIcon.svg';
import QuotationIcon from '../assets/icons/QuotationIcon.svg';
import DeliveryIcon from '../assets/icons/DeliveryIcon.svg';
import SaleIcon from '../assets/icons/SaleIcon.svg';
import ReturnIcon from '../assets/icons/ReturnIcon.svg';

// Example: different modules for each top tab
const moduleGroups = {
  customer: [
    { name: 'Product', icon: ProductIcon, actions: ['Products', 'List', 'Edit', 'Search'] },
    { name: 'Quotation', icon: QuotationIcon, actions: ['Quotation', 'List', 'Edit', 'Search'] },
    { name: 'Delivery Order', icon: DeliveryIcon, actions: ['Delivery', 'List', 'Edit', 'Search'] },
    { name: 'Sale', icon: SaleIcon, actions: ['Sales', 'List', 'Edit', 'Search'] },
    { name: 'Sale Return', icon: ReturnIcon, actions: ['Returns', 'List', 'Edit', 'Search'] },
  ],
  supplier: [
    { name: 'Purchase', icon: ProductIcon, actions: ['Purchases', 'List', 'Edit', 'Search'] },
    { name: 'Purchase Order', icon: QuotationIcon, actions: ['Orders', 'List', 'Edit', 'Search'] },
    { name: 'GRN', icon: DeliveryIcon, actions: ['GRN', 'List', 'Edit', 'Search'] },
    { name: 'Supplier Invoice', icon: SaleIcon, actions: ['Invoices', 'List', 'Edit', 'Search'] },
    { name: 'Supplier Return', icon: ReturnIcon, actions: ['Returns', 'List', 'Edit', 'Search'] },
  ],
  accounts: [
    { name: 'Ledger', icon: ProductIcon, actions: ['Ledgers', 'List', 'Edit', 'Search'] },
    { name: 'Journal', icon: QuotationIcon, actions: ['Journals', 'List', 'Edit', 'Search'] },
    { name: 'Receipt', icon: DeliveryIcon, actions: ['Receipts', 'List', 'Edit', 'Search'] },
    { name: 'Payment', icon: SaleIcon, actions: ['Payments', 'List', 'Edit', 'Search'] },
    { name: 'Contra', icon: ReturnIcon, actions: ['Contras', 'List', 'Edit', 'Search'] },
  ],
};

export default function ModuleTabs() {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'supplier' | 'accounts'

  const currentModules = moduleGroups[activeTab] || moduleGroups.customer;

  return (
    <div
      style={{
        background: colors.primary[50],
        borderBottom: `1px solid ${colors.primary[200]}`,
      }}
    >
      {/* Top row: CUSTOMER | SUPPLIER | ACCOUNTS */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.primary[200]}`,
        }}
      >
        {['CUSTOMER', 'SUPPLIER', 'ACCOUNTS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.toLowerCase() ? 600 : 500,
              color:
                activeTab === tab.toLowerCase()
                  ? colors.primary.DEFAULT
                  : colors.neutral[600],
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {tab}
            {activeTab === tab.toLowerCase() && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '3px',
                  background: colors.primary.DEFAULT,
                  borderRadius: '3px 3px 0 0',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Bottom modules grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px',
          padding: '12px 16px',
        }}
      >
        {currentModules.map((module) => (
            <div
              key={module.name}
              style={{
                flex: '1 1 180px',
                minWidth: 160,
                background: colors.background,
                border: `1px solid ${colors.primary[200]}`,
                borderRadius: '6px',
                padding: '10px 12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: colors.primary.DEFAULT,
                  marginBottom: '8px',
                }}
              >
              {module.name}
            </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                >
              <img src={module.icon} alt="" style={{ width: 20, height: 20 }} />
              {module.actions.map((action) => (
                <button
                  key={action}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: colors.neutral[600],
                    }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}