import React, { useMemo, useState } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import PostIcon from '../assets/icons/post.svg';
import LedgerIcon from '../assets/icons/ledger.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import {
  CommonTable,
  ConfirmDialog,
  DateInputField,
  DropdownInput,
  InputField,
  SubInputField,
} from '../components/ui';

function getProductDetails(row) {
  const orDash = (v) => (v != null && v !== '' ? String(v) : '-');
  return {
    productCode: orDash(row[1]),
    stockOnHand: '-',
    lastCustomer: '-',
    unitCost: '-',
    minUnitPrice: '-',
    profit: '-',
    creditLimit: '-',
    currentOsBal: '-',
    osBalance: '-',
    receiptNo: '-',
    location: '-',
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
  qutnNo: '',
  doNo: '',
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
  const [saleRows, setSaleRows] = useState([
    [
      'OR-001',
      'PC-1001',
      'Product A',
      'SN-001',
      'pkt 10',
      'PCS',
      2,
      0,
      0,
      120.0,
      5,
      12.0,
      228.0,
      18,
      41.04,
      269.04,
    ],
  ]);
  const [form, setForm] = useState(initialFormState);
  const [returnForm, setReturnForm] = useState(returnFormInitial);
  const [billPanel, setBillPanel] = useState(billPanelInitial);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  /** null | { mode: 'single', idx: number } | { mode: 'bulk' } */
  const [pendingDelete, setPendingDelete] = useState(null);

  const fillFormFromRow = (row) => {
    setForm({
      ownRef: String(row[0] ?? ''),
      productCode: String(row[1] ?? ''),
      shortDescription: String(row[2] ?? ''),
      serialNo: String(row[3] ?? ''),
      packetDetails: String(row[4] ?? ''),
      unit: String(row[5] ?? ''),
      salesQty: String(row[6] ?? ''),
      focQty: String(row[7] ?? ''),
      returnQty: String(row[8] ?? ''),
      unitPrice: String(row[9] ?? ''),
      discPercent: String(row[10] ?? ''),
      discAmt: String(row[11] ?? ''),
      subTotal: String(row[12] ?? ''),
      taxPercent: String(row[13] ?? ''),
      taxAmt: String(row[14] ?? ''),
      total: String(row[15] ?? ''),
      qutnNo: '',
      doNo: '',
    });
  };

  const handleEdit = (row, idx) => {
    fillFormFromRow(row);
    setEditingRowIndex(idx);
  };

  const handleDelete = (idx) => {
    setSaleRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRows((prev) => new Set([...prev].filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))));
    if (editingRowIndex === idx) {
      setEditingRowIndex(null);
      setForm(initialFormState);
    } else if (editingRowIndex !== null && editingRowIndex > idx) {
      setEditingRowIndex((i) => i - 1);
    }
  };

  const toggleRowSelection = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const toDelete = new Set(selectedRows);
    setSaleRows((prev) => prev.filter((_, i) => !toDelete.has(i)));
    setSelectedRows(new Set());
    if (editingRowIndex !== null && toDelete.has(editingRowIndex)) {
      setEditingRowIndex(null);
      setForm(initialFormState);
    } else if (editingRowIndex !== null) {
      const deletedBefore = [...toDelete].filter((i) => i < editingRowIndex).length;
      setEditingRowIndex(editingRowIndex - deletedBefore);
    }
  };

  const handleSaveOrUpdate = () => {
    const newRow = [
      form.ownRef,
      form.productCode,
      form.shortDescription,
      form.serialNo,
      form.packetDetails,
      form.unit,
      form.salesQty ? Number(form.salesQty) : 0,
      form.focQty ? Number(form.focQty) : 0,
      form.returnQty ? Number(form.returnQty) : 0,
      form.unitPrice ? Number(form.unitPrice) : 0,
      form.discPercent ? Number(form.discPercent) : 0,
      form.discAmt ? Number(form.discAmt) : 0,
      form.subTotal ? Number(form.subTotal) : 0,
      form.taxPercent ? Number(form.taxPercent) : 0,
      form.taxAmt ? Number(form.taxAmt) : 0,
      form.total ? Number(form.total) : 0,
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
    setForm(initialFormState);
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

  const totalDiscAmt = useMemo(
    () => saleRows.reduce((sum, r) => sum + Number(r[11] ?? 0), 0),
    [saleRows]
  );
  const totalSubTotal = useMemo(
    () => saleRows.reduce((sum, r) => sum + Number(r[12] ?? 0), 0),
    [saleRows]
  );
  const totalTaxPercent = useMemo(
    () => saleRows.reduce((sum, r) => sum + Number(r[13] ?? 0), 0),
    [saleRows]
  );
  const totalTaxAmt = useMemo(
    () => saleRows.reduce((sum, r) => sum + Number(r[14] ?? 0), 0),
    [saleRows]
  );
  const totalLineTotal = useMemo(
    () => saleRows.reduce((sum, r) => sum + Number(r[15] ?? 0), 0),
    [saleRows]
  );

  const rowsWithTotal = useMemo(() => {
    const body = saleRows.map((r, idx) => [
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
    ]);

    const avgTax = saleRows.length ? (totalTaxPercent / saleRows.length).toFixed(2) : '0.00';

    // Total row has same total columns count as headers (18)
    return [
      ...body,
      [
        {
          content: <div className="text-left font-bold">Total</div>,
          colSpan: 12,
          className: 'align-middle font-bold',
        },
        totalDiscAmt.toFixed(2),
        totalSubTotal.toFixed(2),
        avgTax,
        totalTaxAmt.toFixed(2),
        totalLineTotal.toFixed(2),
        '',
      ],
    ];
  }, [
    primary,
    saleRows,
    selectedRows,
    totalDiscAmt,
    totalLineTotal,
    totalSubTotal,
    totalTaxAmt,
    totalTaxPercent,
  ]);

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

      <div className="my-2 flex min-h-0 flex-1 flex-col overflow-hidden px-1 sm:my-[15px] sm:mx-[-10px] sm:px-0">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              Sales return
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              {selectedRows.size > 0 && (
                <button
                  type="button"
                  onClick={() => setPendingDelete({ mode: 'bulk' })}
                  className="sale-btn-outline flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                  style={{ borderColor: primary, color: primary }}
                >
                  <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  Delete
                </button>
              )}

              {[
                { icon: PrinterIcon, label: 'Print' },
                { icon: CancelIcon, label: 'Cancel' },
                { icon: LedgerIcon, label: 'Acc Post Temp' },
                { icon: PostIcon, label: 'Post' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                >
                  <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden xl:flex-row">
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 xl:w-[70%] xl:max-w-[70%] xl:shrink-0">
              <div className="shrink-0 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                <div className="flex flex-col gap-2">
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

                  <div className="mt-1 flex flex-col gap-2 rounded border border-gray-100 bg-gray-50 p-2 sm:p-2.5">
                    <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
                      <SubInputField
                        label="OwnRef #"
                        widthPx={72}
                        value={form.ownRef}
                        onChange={(e) => setForm((f) => ({ ...f, ownRef: e.target.value }))}
                      />
                      <SubInputField
                        label="Product Code"
                        widthPx={88}
                        value={form.productCode}
                        onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))}
                      />
                      <InputField
                        label="Short description"
                        widthPx={160}
                        value={form.shortDescription}
                        onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                      />
                      <SubInputField
                        label="serial#"
                        widthPx={72}
                        value={form.serialNo}
                        onChange={(e) => setForm((f) => ({ ...f, serialNo: e.target.value }))}
                      />
                      <SubInputField
                        label="packet details"
                        widthPx={96}
                        value={form.packetDetails}
                        onChange={(e) => setForm((f) => ({ ...f, packetDetails: e.target.value }))}
                      />
                      <SubInputField
                        label="unit"
                        widthPx={56}
                        value={form.unit}
                        onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                      />
                    </div>

                    <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
                      <SubInputField
                        label="sales Qty"
                        type="number"
                        value={form.salesQty}
                        onChange={(e) => setForm((f) => ({ ...f, salesQty: e.target.value }))}
                      />
                      <SubInputField
                        label="FOC Qty"
                        type="number"
                        value={form.focQty}
                        onChange={(e) => setForm((f) => ({ ...f, focQty: e.target.value }))}
                      />
                      <SubInputField
                        label="Return Qty"
                        type="number"
                        value={form.returnQty}
                        onChange={(e) => setForm((f) => ({ ...f, returnQty: e.target.value }))}
                      />
                      <SubInputField
                        label="Selling price"
                        type="number"
                        value={form.unitPrice}
                        onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                      />
                      <SubInputField
                        label="Disc %"
                        type="number"
                        value={form.discPercent}
                        onChange={(e) => setForm((f) => ({ ...f, discPercent: e.target.value }))}
                      />
                      <SubInputField
                        label="Disc Amt"
                        type="number"
                        value={form.discAmt}
                        onChange={(e) => setForm((f) => ({ ...f, discAmt: e.target.value }))}
                      />
                      <SubInputField
                        label="Sub total"
                        type="number"
                        value={form.subTotal}
                        onChange={(e) => setForm((f) => ({ ...f, subTotal: e.target.value }))}
                      />
                      <SubInputField
                        label="Tax %"
                        type="number"
                        value={form.taxPercent}
                        onChange={(e) => setForm((f) => ({ ...f, taxPercent: e.target.value }))}
                      />
                      <SubInputField
                        label="Tax amt"
                        type="number"
                        value={form.taxAmt}
                        onChange={(e) => setForm((f) => ({ ...f, taxAmt: e.target.value }))}
                      />
                      <SubInputField
                        label="Line total"
                        type="number"
                        value={form.total}
                        onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
                      />

                      <div className="flex shrink-0 items-end">
                        <button
                          type="button"
                          className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-2 text-[8px] font-medium text-white sm:px-3 sm:text-[9px]"
                          style={{ backgroundColor: primary }}
                          onClick={handleSaveOrUpdate}
                        >
                          {editingRowIndex !== null ? 'Update line' : 'Add line'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

            <div className="flex w-full min-w-0 shrink-0 flex-col xl:w-[30%] xl:min-h-0 xl:min-w-[min(100%,280px)] xl:shrink-0 xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:overscroll-contain xl:pr-1">
              <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5">
                <div className="min-w-0 rounded border border-gray-200 bg-white p-2 sm:p-2.5">
                  <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                    <InputField
                      label="Return bill no"
                      fullWidth
                      value={billPanel.returnBillNo}
                      onChange={(e) => setBillPanel((p) => ({ ...p, returnBillNo: e.target.value }))}
                    />
                    <SubInputField
                      label="Cust.Lpo #"
                      fullWidth
                      value={billPanel.custLpo}
                      onChange={(e) => setBillPanel((p) => ({ ...p, custLpo: e.target.value }))}
                    />
                    <SubInputField
                      label="Local Bill No"
                      fullWidth
                      value={billPanel.localBillNo}
                      onChange={(e) => setBillPanel((p) => ({ ...p, localBillNo: e.target.value }))}
                    />
                  </div>

                  <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                    <InputField
                      label="Customer name"
                      fullWidth
                      value={billPanel.customerName}
                      onChange={(e) => setBillPanel((p) => ({ ...p, customerName: e.target.value }))}
                    />
                    <DateInputField
                      label="Return bill date"
                      fullWidth
                      value={billPanel.returnBillDate}
                      onChange={(v) => setBillPanel((p) => ({ ...p, returnBillDate: v }))}
                    />
                    <DateInputField
                      label="Payment date"
                      fullWidth
                      value={billPanel.paymentDate}
                      onChange={(v) => setBillPanel((p) => ({ ...p, paymentDate: v }))}
                    />
                  </div>

                  <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                    <InputField
                      label="Credit card no"
                      fullWidth
                      value={billPanel.creditCardNo}
                      onChange={(e) => setBillPanel((p) => ({ ...p, creditCardNo: e.target.value }))}
                    />
                    <InputField
                      label="Credit card"
                      fullWidth
                      value={billPanel.creditCard}
                      onChange={(e) => setBillPanel((p) => ({ ...p, creditCard: e.target.value }))}
                    />
                  </div>

                  <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                    <DropdownInput
                      label="Cashier name"
                      options={['Cashier 1', 'Cashier 2']}
                      placeholder="Select"
                      fullWidth
                      value={billPanel.cashierName}
                      onChange={(v) => setBillPanel((p) => ({ ...p, cashierName: v }))}
                    />
                    <InputField
                      label="Invoice amt"
                      type="number"
                      fullWidth
                      value={billPanel.invoiceAmt}
                      onChange={(e) => setBillPanel((p) => ({ ...p, invoiceAmt: e.target.value }))}
                    />
                  </div>

                  <div className="mt-2">
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
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.mode === 'bulk' ? 'Delete selected lines?' : 'Delete line item?'}
        message={
          pendingDelete?.mode === 'bulk'
            ? `This will remove ${selectedRows.size} selected row(s). This action cannot be undone.`
            : 'This will remove the row from the return. This action cannot be undone.'
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
          <div
            className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 id="product-details-title" className="mb-4 text-center text-base font-bold sm:text-lg" style={{ color: primary }}>
              Product details
            </h2>

            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
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
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-2 sm:gap-[10px]">
                  <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                    {label}
                  </label>
                  <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
