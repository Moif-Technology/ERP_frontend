import React from 'react';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

const TITLES = {
  '/reports/sales-summary':         'DAILY SALES SUMMARY',
  '/reports/sales-by-customer':     'SALES BY CUSTOMER',
  '/reports/sales-by-product':      'SALES BY PRODUCT',
  '/reports/sales-by-agent':        'SALES BY AGENT',
  '/reports/purchase-summary':      'PURCHASE SUMMARY',
  '/reports/supplier-purchase':     'SUPPLIER-WISE PURCHASE',
  '/reports/stock-summary':         'STOCK SUMMARY',
  '/reports/product-movement-report': 'PRODUCT MOVEMENT REPORT',
  '/reports/reorder-report':        'REORDER REPORT',
  '/reports/receivables-report':    'RECEIVABLES REPORT',
  '/reports/payables-report':       'PAYABLES REPORT',
  '/reports/attendance-report':     'ATTENDANCE REPORT',
  '/reports/leave-report':          'LEAVE REPORT',
};

export default function ReportsPlaceholderPage() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'REPORTS';

  return (
    <div className="box-border w-full min-w-0 max-w-full rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        {title}
      </h1>
      <p className="mt-6 text-center text-sm text-gray-600">Report screen — coming soon.</p>
    </div>
  );
}
