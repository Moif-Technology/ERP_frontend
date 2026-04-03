import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';

const primary = colors.primary?.main || '#790728';

/**
 * Placeholder list for Accounts → Sales voucher → List.
 * Expand with table + API when ready (see PurchaseVoucherList).
 */
export default function SalesVoucherList() {
  return (
    <div className="box-border w-full min-w-0 max-w-full rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-bold sm:text-lg" style={{ color: primary }}>
          SALES VOUCHER LIST
        </h1>
        <Link
          to="/sales-voucher-entry"
          className="inline-flex items-center justify-center rounded border px-3 py-1.5 text-[10px] font-semibold text-white no-underline sm:text-[11px]"
          style={{ backgroundColor: primary, borderColor: primary }}
        >
          New sales voucher
        </Link>
      </div>
      <p className="mt-6 text-center text-sm text-gray-600">No saved sales vouchers yet — connect listing API here.</p>
    </div>
  );
}
