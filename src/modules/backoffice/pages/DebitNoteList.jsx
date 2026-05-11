import React from 'react';
import AccountVoucherListPage from './AccountVoucherListPage';

export default function DebitNoteList() {
  return (
    <AccountVoucherListPage
      title="DEBIT NOTE LIST"
      voucherTypeName="Debit Note"
      newVoucherPath="/debit-note-entry"
      newVoucherLabel="New debit note"
    />
  );
}
