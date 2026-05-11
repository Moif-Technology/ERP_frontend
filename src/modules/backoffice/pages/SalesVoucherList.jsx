import React from 'react';
import AccountVoucherListPage from './AccountVoucherListPage';

export default function SalesVoucherList() {
  return (
    <AccountVoucherListPage
      title="SALES VOUCHER LIST"
      voucherTypeName="Sales Voucher"
      newVoucherPath="/sales-voucher-entry"
      newVoucherLabel="New sales voucher"
    />
  );
}
