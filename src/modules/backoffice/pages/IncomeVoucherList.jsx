import React from 'react';
import AccountVoucherListPage from './AccountVoucherListPage';

export default function IncomeVoucherList() {
  return (
    <AccountVoucherListPage
      title="INCOME VOUCHER LIST"
      voucherTypeName="Income Voucher"
      newVoucherPath="/income-voucher"
      newVoucherLabel="New income voucher"
    />
  );
}
