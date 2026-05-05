import React from 'react';
import AccountVoucherListPage from './AccountVoucherListPage';

export default function ExpenseVoucherList() {
  return (
    <AccountVoucherListPage
      title="EXPENSE VOUCHER LIST"
      voucherTypeName="Expense Voucher"
      newVoucherPath="/expense-voucher"
      newVoucherLabel="New expense voucher"
    />
  );
}
