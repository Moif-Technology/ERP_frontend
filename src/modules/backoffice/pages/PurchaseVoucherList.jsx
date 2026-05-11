import React from 'react';
import AccountVoucherListPage from './AccountVoucherListPage';

export default function PurchaseVoucherList() {
  return (
    <AccountVoucherListPage
      title="PURCHASE VOUCHER LIST"
      voucherTypeName="Purchase Voucher"
      newVoucherPath="/purchase-voucher-entry"
      newVoucherLabel="New purchase voucher"
    />
  );
}
