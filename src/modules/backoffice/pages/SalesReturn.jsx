import React, { useMemo, useState } from 'react';
import { colors } from '../../../shared/constants/theme';
import PrinterIcon from '../../../shared/assets/icons/printer.svg';
import CancelIcon from '../../../shared/assets/icons/cancel.svg';
import PostIcon from '../../../shared/assets/icons/post.svg';
import LedgerIcon from '../../../shared/assets/icons/ledger.svg';
import ViewActionIcon from '../../../shared/assets/icons/view.svg';
import EditActionIcon from '../../../shared/assets/icons/edit4.svg';
import DeleteActionIcon from '../../../shared/assets/icons/delete2.svg';
import { InputField, SubInputField, DropdownInput, DateInputField, CommonTable, ConfirmDialog } from '../../../shared/components/ui';

// Keep the same table structure as Sale.jsx (Sales return uses the same columns).
function getProductDetails(row) {
  const orDash = (v) => (v != null && v !== '' ? String(v) : '-');
  return {
    productCode: orDash(row[1]),
    stockOnHand: orDash(null),
    lastCustomer: orDash(null),
    unitCost: orDash(null),
    minUnitPrice: orDash(null),
    profit: orDash(null),
    creditLimit: orDash(null),
    currentOsBal: orDash(null),
    osBalance: orDash(null),
    receiptNo: orDash(null),
    location: orDash(null),
    productName: orDash(row[2]),
  };
}

const initialFormState = {
  ownRef: '',
  productCode: '',
  shortDescription: '',
  serialNo: '',
  packetDetails: '',
  unit: '',
  salesQty: '',
  focQty: '',
  returnQty: '',
  unitPrice: '',
  discPercent: '',
  discAmt: '',
  subTotal: '',
  taxPercent: '',
  taxAmt: '',
  total: '',
  qutnNo: 'QTN-001',
  doNo: 'DO-001',
};

const returnFormInitial = {
  returnType: 'Full',
  billNo: '',
  counterNo: '',
  billDate: '',
  paymentMode: 'Cash',
  station: 'Main',
};

const billPanelInitial = {
  returnBillNo: '',
  custLpo: '',
  localBillNo: '',
  customerName: '',
  returnBillDate: '',
  paymentDate: '',
  creditCardNo: '',
  creditCard: '',
  cashierName: '',
  invoiceAmt: '',
  station: 'Main',
  salesTerms: '',
  counterNo: '',
  paidAmount: '',
  balanceAmount: '',
};

export default function SalesReturn() {
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [returnForm, setReturnForm] = useState(returnFormInitial);
  const [billPanel, setBillPanel] = useState(billPanelInitial);

  const [saleRows, setSaleRows] = useState([
    ['OR-001', 'PC-1001', 'Product A', 'SN-001', 'pkt 10', 'PCS', 2, 0, 0, 120.0, 5, 12.0, 228.0, 18, 41.04, 269.04],
    ['OR-002', 'PC-2034', 'Product B', 'SN-002', 'ea', 'EA', 1, 0, 0, 450.0, 10, 45.0, 405.0, 18, 72.9, 477.9],
    ['OR-003', 'PC-9090', 'Service C', 'SN-003', '-', 'HR', 3, 0, 0, 80.0, 0, 0.0, 240.0, 5, 12.0, 252.0],
  ]);
  const [form, setForm] = useState(initialFormState);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  /** null | { mode: 'single', idx: number } | { mode: 'bulk' } */
  const [pendingDelete, setPendingDelete] = useState(null);

  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDelete = (idx) => {
    setSaleRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
    } else if (editingRowIndex !== null && editingRowIndex > idx) {
      setEditingRowIndex((i) => i - 1);
    }
  };

  const handleDeleteSelected = () => {
    const toDelete = new Set(selectedRows);
    setSaleRows((prev) => prev.filter((_, i) => !toDelete.has(i)));
    setSelectedRows(new Set());
    if (editingRowIndex !== null && toDelete.has(editingRowIndex)) {
      setEditingRowIndex(null);
    } else if (editingRowIndex !== null) {
      const deletedBefore = [...toDelete].filter((i) => i < editingRowIndex).length;
      setEditingRowIndex(editingRowIndex - deletedBefore);
    }
  };

  const handleEdit = (_row, idx) => {
    setEditingRowIndex(idx);
    // Keep form update for compatibility (even though return screen doesn't use sales form fields)
    setForm((f) => ({ ...f }));
  };

  const handleReturnAdd = () => {
    const desc = `Return (${returnForm.returnType}) — Bill ${returnForm.billNo || '-'}`;
    const newRow = [
      '',
      returnForm.counterNo || '-',
      desc,
      '',
      '',
      '',
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ];
    if (editingRowIndex !== null) {
      setSaleRows((prev) => {
        const next = [...prev];
        next[editingRowIndex] = newRow;
        return next;
      });
      setEditingRowIndex(null);
    } else {
      setSaleRows((prev) => [newRow, ...prev]);
    }
  };

  const totalDiscAmt = saleRows.reduce((sum, r) => sum + Number(r[11] ?? 0), 0);
  const totalSubTotal = saleRows.reduce((sum, r) => sum + Number(r[12] ?? 0), 0);
  const totalTaxPercent = saleRows.reduce((sum, r) => sum + Number(r[13] ?? 0), 0);
  const totalTaxAmt = saleRows.reduce((sum, r) => sum + Number(r[14] ?? 0), 0);
  const totalLineTotal = saleRows.reduce((sum, r) => sum + Number(r[15] ?? 0), 0);

  const rowsWithTotal = useMemo(
    () => [
      ...saleRows.map((r, idx) => [
        <div key={`chk-${idx}`} className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedRows.has(idx)}
            onChange={() => toggleRowSelection(idx)}
            className="h-3 w-3 cursor-pointer sm:h-3.5 sm:w-3.5"
            style={{ accentColor: primary }}
          />
        </div>,
        r[0],
        r[1],
        r[2],
        r[3],
        r[4],
        r[5],
        r[6],
        r[7],
        r[8],
        r[9],
        r[10],
        r[11],
        r[12],
        r[13],
        r[14],
        r[15],
        <div key={`action-${idx}`} className="flex items-center justify-center gap-0.5 sm:gap-1">
          <button type="button" className="p-0.5" onClick={() => setSelectedProduct(getProductDetails(r))}>
            <img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className="p-0.5" onClick={() => handleEdit(r, idx)}>
            <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
          <button type="button" className="p-0.5" onClick={() => setPendingDelete({ mode: 'single', idx })}>
            <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>,
      ]),
      [
        { content: <div key="total" className="text-left font-bold">Total</div>, colSpan: 12, className: 'align-middle font-bold' },
        totalDiscAmt.toFixed(2),
        totalSubTotal.toFixed(2),
        saleRows.length ? (totalTaxPercent / saleRows.length).toFixed(2) : '0.00',
        totalTaxAmt.toFixed(2),
        totalLineTotal.toFixed(2),
        '',
      ],
    ],
    [saleRows, selectedRows, primary, totalDiscAmt, totalSubTotal, totalTaxPercent, totalTaxAmt, totalLineTotal]
  );

  return (
    <div className="sale-page">
      <style>{`
        .sale-btn-outline:hover {
          border-color: ${primary} !important;
          background: ${primaryHover} !important;
          color: ${primary} !important;
        }
        .sale-btn-outline:active {
          background: ${primaryActive} !important;
        }
      `}</style>

      <div className="my-2 flex flex-1 min-h-0 flex-col overflow-hidden px-1 sm:my-[15px] sm:mx-[-10px] sm:px-0">
        <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
          {/* Header */}
          <div className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              Sales return
            </h1>
            <div className="flex gap-2 flex-wrap items-center">
              {[{ icon: PrinterIcon }, { icon: CancelIcon, label: 'Cancel' }, { icon: LedgerIcon, label: 'Acc Post Temp' }, { icon: PostIcon, label: 'Post' }].map(
                (btn, idx) => (
                  <button
                    key={btn.label ?? `toolbar-${idx}`}
                    type="button"
                    className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                  >
                    <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                    {btn.label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden xl:flex-row">
            {/* LEFT */}
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 xl:w-[70%] xl:max-w-[70%] xl:shrink-0">
              {/* Return header form */}
              <div className="shrink-0 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
                  <DropdownInput
                    label="Return type"
                    options={['Full', 'Partial', 'Credit note', 'Exchange']}
                    value={returnForm.returnType}
                    onChange={(v) => setReturnForm((f) => ({ ...f, returnType: v }))}
                    widthPx={120}
                  />
                  <SubInputField
                    label="Bill no"
                    widthPx={88}
                    value={returnForm.billNo}
                    onChange={(e) => setReturnForm((f) => ({ ...f, billNo: e.target.value }))}
                  />
                  <SubInputField
                    label="Counter no"
                    widthPx={88}
                    value={returnForm.counterNo}
                    onChange={(e) => setReturnForm((f) => ({ ...f, counterNo: e.target.value }))}
                  />
                  <DateInputField
                    label="Bill date"
                    widthPx={118}
                    value={returnForm.billDate}
                    onChange={(v) => setReturnForm((f) => ({ ...f, billDate: v }))}
                  />
                  <DropdownInput
                    label="Payment mode"
                    options={['Cash', 'Card', 'Bank Transfer', 'Credit', 'Cheque']}
                    value={returnForm.paymentMode}
                    onChange={(v) => setReturnForm((f) => ({ ...f, paymentMode: v }))}
                    widthPx={130}
                  />
                  <DropdownInput
                    label="Station"
                    options={['Main', 'Branch 1', 'Branch 2', 'Warehouse']}
                    value={returnForm.station}
                    onChange={(v) => setReturnForm((f) => ({ ...f, station: v }))}
                    widthPx={120}
                  />
                  <div className="flex shrink-0 items-end">
                    <button
                      type="button"
                      className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-2 text-[8px] font-medium text-white sm:px-3 sm:text-[9px]"
                      style={{ backgroundColor: primary }}
                      onClick={handleReturnAdd}
                    >
                      {editingRowIndex !== null ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="w-full min-w-0 rounded border border-gray-200 bg-white p-2 sm:p-3">
                <CommonTable
                  fitParentWidth
                  maxVisibleRows={11}
                  headers={[
                    '',
                    'OwnRef #',
                    'Product Code',
                    'Short description',
                    'serial#',
                    'packet details',
                    'unit',
                    'sales Qty',
                    'FOC Qty',
                    'Return Qty',
                    'Selling price',
                    'Disc %',
                    'Disc Amt',
                    'Sub total',
                    'Tax %',
                    'Tax amt',
                    'Line Total',
                    'Action',
                  ]}
                  rows={rowsWithTotal}
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex w-full min-w-0 shrink-0 flex-col xl:w-[30%] xl:min-h-0 xl:min-w-[min(100%,280px)] xl:shrink-0 xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:overscroll-contain xl:pr-1">
              <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5">
                {/* Bill / Customer section */}
                <div className="min-w-0 rounded border border-gray-200 bg-white p-2 sm:p-2.5">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="min-w-0">
                        <InputField
                          label="Return bill no"
                          fullWidth
                          value={billPanel.returnBillNo}
                          onChange={(e) => setBillPanel((p) => ({ ...p, returnBillNo: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-0">
                        <SubInputField
                          label="Cust.Lpo #"
                          fullWidth
                          value={billPanel.custLpo}
                          onChange={(e) => setBillPanel((p) => ({ ...p, custLpo: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-0">
                        <SubInputField
                          label="Local Bill No"
                          fullWidth
                          value={billPanel.localBillNo}
                          onChange={(e) => setBillPanel((p) => ({ ...p, localBillNo: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="min-w-0">
                        <InputField
                          label="Customer name"
                          fullWidth
                          value={billPanel.customerName}
                          onChange={(e) => setBillPanel((p) => ({ ...p, customerName: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-0">
                        <DateInputField
                          label="Return bill date"
                          fullWidth
                          value={billPanel.returnBillDate}
                          onChange={(v) => setBillPanel((p) => ({ ...p, returnBillDate: v }))}
                        />
                      </div>
                      <div className="min-w-0">
                        <DropdownInput
                          label="Payment"
                          options={['Cash', 'Card', 'Bank Transfer', 'Credit', 'Cheque']}
                          fullWidth
                          value={billPanel.paymentDate}
                          onChange={(v) => setBillPanel((p) => ({ ...p, paymentDate: v }))}
                        />
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="min-w-0">
                        <InputField
                          label="Credit card no"
                          fullWidth
                          value={billPanel.creditCardNo}
                          onChange={(e) => setBillPanel((p) => ({ ...p, creditCardNo: e.target.value }))}
                        />
                      </div>
                      <div className="min-w-0">
                        <InputField
                          label="Credit card"
                          fullWidth
                          value={billPanel.creditCard}
                          onChange={(e) => setBillPanel((p) => ({ ...p, creditCard: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="min-w-0">
                        <DropdownInput
                          label="Cashier name"
                          options={['Cashier 1', 'Cashier 2']}
                          placeholder="Select"
                          fullWidth
                          value={billPanel.cashierName}
                          onChange={(v) => setBillPanel((p) => ({ ...p, cashierName: v }))}
                        />
                      </div>
                      <div className="min-w-0">
                        <InputField
                          label="Invoice amt"
                          type="number"
                          fullWidth
                          value={billPanel.invoiceAmt}
                          onChange={(e) => setBillPanel((p) => ({ ...p, invoiceAmt: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="min-w-0 sm:col-span-2">
                        <DropdownInput
                          label="Station"
                          options={['Main', 'Branch 1', 'Branch 2', 'Warehouse']}
                          fullWidth
                          value={billPanel.station}
                          onChange={(v) => setBillPanel((p) => ({ ...p, station: v }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales terms + Counter # + Paid / Balance */}
                <div className="rounded border border-gray-200 bg-white p-2 sm:p-2.5">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-2">
                      <label className="min-w-0 shrink-0 pt-0.5 text-[9px] font-semibold text-gray-700 sm:w-[96px] sm:pt-1 sm:text-right sm:text-[10px]">
                        Sales terms
                      </label>
                      <textarea
                        value={billPanel.salesTerms}
                        onChange={(e) => setBillPanel((p) => ({ ...p, salesTerms: e.target.value }))}
                        rows={2}
                        className="min-h-[44px] min-w-0 flex-1 resize-y rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:text-[10px]"
                        placeholder="Sales terms"
                      />
                    </div>

                    <div className="flex min-w-0 items-center gap-2 sm:gap-2">
                      <label className="min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[96px] sm:text-right sm:text-[10px]">
                        Counter #
                      </label>
                      <input
                        type="text"
                        value={billPanel.counterNo}
                        onChange={(e) => setBillPanel((p) => ({ ...p, counterNo: e.target.value }))}
                        className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                      />
                    </div>

                    <div className="flex min-w-0 items-center gap-2 sm:gap-2">
                      <label className="min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[96px] sm:text-right sm:text-[10px]">
                        Paid amount
                      </label>
                      <input
                        type="number"
                        value={billPanel.paidAmount}
                        onChange={(e) => setBillPanel((p) => ({ ...p, paidAmount: e.target.value }))}
                        className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                      />
                    </div>

                    <div className="flex min-w-0 items-center gap-2 sm:gap-2">
                      <label className="min-w-0 shrink-0 text-[9px] font-semibold text-gray-700 sm:w-[96px] sm:text-right sm:text-[10px]">
                        Balance amount
                      </label>
                      <input
                        type="number"
                        value={billPanel.balanceAmount}
                        onChange={(e) => setBillPanel((p) => ({ ...p, balanceAmount: e.target.value }))}
                        className="min-h-[24px] min-w-0 flex-1 max-w-full rounded border border-gray-300 bg-gray-100 px-2 py-1 text-[9px] outline-none sm:min-h-[28px] sm:text-[10px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.mode === 'bulk' ? 'Delete selected lines?' : 'Delete line item?'}
        message={
          pendingDelete?.mode === 'bulk'
            ? `This will remove ${selectedRows.size} selected row(s). This action cannot be undone.`
            : 'This will remove the row from the sales return. This action cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.mode === 'bulk') handleDeleteSelected();
          else handleDelete(pendingDelete.idx);
        }}
      />

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-details-title"
        >
          <div className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 id="product-details-title" className="text-sm font-bold sm:text-base" style={{ color: primary }}>
                Product details
              </h2>
              <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setSelectedProduct(null)} aria-label="Close details">
                x
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Product code', selectedProduct.productCode],
                ['Stock on hand', selectedProduct.stockOnHand],
                ['Last customer', selectedProduct.lastCustomer],
                ['Unit cost', selectedProduct.unitCost],
                ['Min unit price', selectedProduct.minUnitPrice],
                ['Profit', selectedProduct.profit],
                ['Credit limit', selectedProduct.creditLimit],
                ['Current OS bal', selectedProduct.currentOsBal],
                ['OS balance', selectedProduct.osBalance],
                ['Receipt no', selectedProduct.receiptNo],
                ['Location', selectedProduct.location],
                ['Product name', selectedProduct.productName],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <div className="font-semibold text-gray-700">{label}</div>
                  <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1">{value}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
