import React from 'react';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

const TITLES = {
  '/lists/product-price-list': 'PRODUCT PRICE LIST',
  '/lists/customer-list': 'CUSTOMER LIST',
  '/lists/supplier-list': 'SUPPLIER LIST',
  '/lists/agent-list': 'AGENT LIST',
};

/**
 * Placeholder for sidebar List → sub-routes until dedicated list UIs exist.
 */
export default function ListPlaceholderPage() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'LIST';

  return (
    <div className="box-border w-full min-w-0 max-w-full rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        {title}
      </h1>
      <p className="mt-6 text-center text-sm text-gray-600">Screen placeholder — connect listing API here.</p>
    </div>
  );
}
