import React from 'react';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

const TITLES = {
  '/income-expense-voucher-list': 'INCOME / EXPENSE VOUCHER LIST',
  '/payment-voucher-list': 'PAYMENT VOUCHER LIST',
  '/receipt-voucher-list': 'RECEIPT VOUCHER LIST',
  '/contra-journal-voucher-list': 'CONTRA / JOURNAL VOUCHER LIST',
  '/trial-balance': 'TRIAL BALANCE',
  '/statement-payable-summary': 'ACCOUNTS PAYABLE SUMMARY',
  '/statement-receivable-summary': 'ACCOUNTS RECEIVABLE SUMMARY',
  '/statement-of-accounts-list': 'STATEMENT OF ACCOUNTS — LIST',
};

/**
 * Placeholder for Accounts module shortcuts until dedicated screens exist.
 */
export default function AccountsPlaceholderPage() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'ACCOUNTS';

  return (
    <div className="box-border w-full min-w-0 max-w-full rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
        {title}
      </h1>
      <p className="mt-6 text-center text-sm text-gray-600">Screen placeholder — connect entry or list UI here.</p>
    </div>
  );
}
