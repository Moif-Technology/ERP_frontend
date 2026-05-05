import React from 'react';
import AccountVoucherListPage from './AccountVoucherListPage';

export default function CreditNoteList() {
  return (
    <AccountVoucherListPage
      title="CREDIT NOTE LIST"
      voucherTypeName="Credit Note"
      newVoucherPath="/credit-note-entry"
      newVoucherLabel="New credit note"
    />
  );
}
