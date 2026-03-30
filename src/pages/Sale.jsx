import React, { useState } from 'react';
import { colors } from '../constants/theme';
import PrinterIcon from '../assets/icons/printer.svg';
import CancelIcon from '../assets/icons/cancel.svg';
import PostIcon from '../assets/icons/post.svg';
import LedgerIcon from '../assets/icons/ledger.svg';
import ViewActionIcon from '../assets/icons/view.svg';
import EditActionIcon from '../assets/icons/edit4.svg';
import DeleteActionIcon from '../assets/icons/delete2.svg';
import { InputField, SubInputField, DropdownInput, DateInputField, CommonTable } from '../components/ui';

// Helper: get product details from table row, use "-" for empty values
// Row: [0 OwnRef, 1 Product Code, 2 Short description, ...]
function getProductDetails(row, idx) {
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

export default function Sale({ pageTitle = 'Sales', useReturnHeaderForm = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleRows, setSaleRows] = useState([
    ['OR-001', 'PC-1001', 'Product A', 'SN-001', 'pkt 10', 'PCS', 2, 0, 0, 120.0, 5, 12.0, 228.0, 18, 41.04, 269.04],
    ['OR-002', 'PC-2034', 'Product B', 'SN-002', 'ea', 'EA', 1, 0, 0, 450.0, 10, 45.0, 405.0, 18, 72.9, 477.9],
    ['OR-003', 'PC-9090', 'Service C', 'SN-003', '-', 'HR', 3, 0, 0, 80.0, 0, 0.0, 240.0, 5, 12.0, 252.0],
  ]);
  const [form, setForm] = useState(initialFormState);
  const [returnForm, setReturnForm] = useState(returnFormInitial);
  const [billPanel, setBillPanel] = useState(billPanelInitial);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const primary = colors.primary?.main || '#790728';
  const primaryHover = colors.primary?.[50] || '#F2E6EA';
  const primaryActive = colors.primary?.[100] || '#E4CDD3';

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
      qutnNo: 'QTN-001',
      doNo: 'DO-001',
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

  // Calculate totals (column indices: 11 Disc Amt, 12 Sub total, 13 Tax %, 14 Tax amt, 15 Line total)
  const totalDiscAmt = saleRows.reduce((sum, r) => sum + Number(r[11] ?? 0), 0);
  const totalSubTotal = saleRows.reduce((sum, r) => sum + Number(r[12] ?? 0), 0);
  const totalTaxPercent = saleRows.reduce((sum, r) => sum + Number(r[13] ?? 0), 0);
  const totalTaxAmt = saleRows.reduce((sum, r) => sum + Number(r[14] ?? 0), 0);
  const totalLineTotal = saleRows.reduce((sum, r) => sum + Number(r[15] ?? 0), 0);

  // Build rows with action buttons
// Build rows with action buttons and totals without labels
const rowsWithTotal = [
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
      <button type="button" className="p-0.5" onClick={() => setSelectedProduct(getProductDetails(r, idx))}>
        <img src={ViewActionIcon} alt="View" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
      <button type="button" className="p-0.5" onClick={() => handleEdit(r, idx)}>
        <img src={EditActionIcon} alt="Edit" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
      <button type="button" className="p-0.5" onClick={() => handleDelete(idx)}>
        <img src={DeleteActionIcon} alt="Delete" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
    </div>
  ]),
 

[
  {
    content: (
      <div key="total" className="text-left font-bold">
        Total
      </div>
    ),
    colSpan: 12,
    className: 'align-middle font-bold',
  },
  totalDiscAmt.toFixed(2),
  totalSubTotal.toFixed(2),
  saleRows.length ? (totalTaxPercent / saleRows.length).toFixed(2) : '0.00',
  totalTaxAmt.toFixed(2),
  totalLineTotal.toFixed(2),
  '',
]



];

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

        .sale-btn-primary:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-primary:active {
          background: ${primaryActive} !important;
        }

        .sale-btn-red-outline:hover {
          background: ${primaryHover} !important;
          color: ${primary} !important;
          border-color: ${primary} !important;
        }
        .sale-btn-red-outline:active {
          background: ${primaryActive} !important;
        }
      `}</style>

      <div className="my-2 flex flex-1 min-h-0 flex-col overflow-hidden px-1 sm:my-[15px] sm:mx-[-10px] sm:px-0">
        <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">

          {/* Header */}
          <div className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-base font-bold sm:text-lg xl:text-xl" style={{ color: primary }}>
              {pageTitle}
            </h1>

            <div className="flex gap-2 flex-wrap items-center">
              {selectedRows.size > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="sale-btn-outline flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                  style={{ borderColor: primary, color: primary }}
                >
                  <img src={DeleteActionIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  Delete
                </button>
              )}
              {/* <button className="sale-btn-outline flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white sm:h-8 sm:w-8">
                <img src={PrinterIcon} alt="" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button> */}

              {[
                { icon: PrinterIcon },
                { icon: CancelIcon, label: 'Cancel' },
                { icon: LedgerIcon, label: 'Acc Post Temp' },
                { icon: PostIcon, label: 'Post' },
              ].map((btn, idx) => (
                <button
                  key={btn.label ?? `toolbar-${idx}`}
                  type="button"
                  className="sale-btn-outline flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[11px]"
                >
                  <img src={btn.icon} alt="" className="h-3 w-3 sm:h-4 sm:w-4" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content: fills viewport; xl = side-by-side with internal scroll; stacked = scroll inside main */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden xl:flex-row">

            {/* LEFT — ~70% on xl so form + table share space with wider right rail */}
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 xl:w-[70%] xl:max-w-[70%] xl:shrink-0">
              {/* Form section - bordered */}
              <div className="shrink-0 overflow-hidden rounded border border-gray-200 bg-white p-2 sm:p-3">
                <div className="flex flex-col gap-2">
                  {useReturnHeaderForm ? (
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
                  ) : (
                    <>
                      {/* Row 1: OwnRef, product, description, serial, packet */}
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
                          widthPx={128}
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
                          widthPx={88}
                          value={form.packetDetails}
                          onChange={(e) => setForm((f) => ({ ...f, packetDetails: e.target.value }))}
                        />
                      </div>

                      {/* Row 2: unit, qtys, selling price */}
                      <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
                        <SubInputField
                          label="unit"
                          widthPx={56}
                          value={form.unit}
                          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                        />
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
                      </div>

                      {/* Row 3: Disc, sub, tax, line total, Qutn/DO, Add */}
                      <div className="flex flex-wrap items-end gap-2 overflow-hidden xl:flex-nowrap">
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
                        <DropdownInput
                          label="Qutn. no"
                          options={['QTN-001']}
                          value={form.qutnNo}
                          onChange={(v) => setForm((f) => ({ ...f, qutnNo: v }))}
                        />
                        <DropdownInput
                          label="DO. no"
                          options={['DO-001']}
                          value={form.doNo}
                          onChange={(v) => setForm((f) => ({ ...f, doNo: v }))}
                        />
                        <div className="flex shrink-0 items-end">
                          <button
                            type="button"
                            className="flex h-[20.08px] min-h-[20.08px] items-center justify-center rounded px-2 text-[8px] font-medium text-white sm:px-3 sm:text-[9px]"
                            style={{ backgroundColor: primary }}
                            onClick={handleSaveOrUpdate}
                          >
                            {editingRowIndex !== null ? 'Update' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Table — fits column width (table-fixed); no nested vertical scroll */}
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

            {/* RIGHT — ~30% on xl; scrolls inside viewport so totals + bill + terms fit on screen */}
            <div className="flex w-full min-w-0 shrink-0 flex-col xl:w-[30%] xl:min-h-0 xl:min-w-[min(100%,280px)] xl:shrink-0 xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:overscroll-contain xl:pr-1">
              <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5">
                {/* Totals — compact grid for narrow rail */}
                <div
                  className="w-full min-w-0 rounded bg-white p-2 sm:p-2.5"
                  style={{
                    borderRadius: '8px',
                    border: '0.49px solid #e5e7eb',
                  }}
                >
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                      <div className="min-w-0">
                        <InputField label="Sub Total" defaultValue="00000.00" fullWidth />
                      </div>
                      <div className="min-w-0 shrink-0">
                        <SubInputField label="Discount Amount" defaultValue="1" widthPx={92} />
                      </div>
                      <div className="min-w-0 shrink-0">
                        <SubInputField label="" defaultValue="11" suffix="%" widthPx={72} />
                      </div>
                    </div>
                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                      <div className="min-w-0">
                        <InputField label="Total Amount" defaultValue="00000.00" fullWidth />
                      </div>
                      <div className="min-w-0 shrink-0">
                        <SubInputField label="Tax" defaultValue="1" widthPx={92} />
                      </div>
                      <div className="min-w-0 shrink-0">
                        <SubInputField label="" defaultValue="67" suffix="%" widthPx={72} />
                      </div>
                    </div>
                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                      <InputField label="Round Off" defaultValue="00000.00" fullWidth />
                      <InputField label="Net Amount" defaultValue="00000.00" fullWidth />
                    </div>
                  </div>
                </div>

                {/* Bill / Customer section — return bill + dates + card + cashier + station */}
                <div className="min-w-0 rounded border border-gray-200 bg-white p-2 sm:p-2.5">
                  <div className="flex min-w-0 flex-col gap-2">
                    {/* Row 1: Return bill no + Cust.Lpo # + Local Bill No */}
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

                    {/* Row 2: Customer name + Return bill date + Payment date — always three columns from sm up (one row) */}
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
                        <DateInputField
                          label="Payment date"
                          fullWidth
                          value={billPanel.paymentDate}
                          onChange={(v) => setBillPanel((p) => ({ ...p, paymentDate: v }))}
                        />
                      </div>
                    </div>

                    {/* Row 3: Credit card no + Credit card */}
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

                    {/* Row 4: Cashier name (dropdown) + Invoice amt */}
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

                    {/* Station — full width of row */}
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

                {/* Sales terms + Counter # + Paid / Balance — compact labels for narrow rail */}
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

      {/* Product Details Modal */}
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

            <h2
              id="product-details-title"
              className="mb-4 text-center text-base font-bold sm:text-lg"
              style={{ color: primary }}
            >
              Product details
            </h2>

            {/* Product details - labels left, values right, "-" when empty */}
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-2 sm:gap-[10px]">
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Product code
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.productCode}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Stock on hand
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.stockOnHand}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Last customer
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.lastCustomer}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Unit cost
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.unitCost}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Min unit price
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.minUnitPrice}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Profit
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.profit}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Credit limit
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.creditLimit}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Current OS bal
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.currentOsBal}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  OS balance
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.osBalance}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Receipt no
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.receiptNo}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-[10px]">
                <label className="w-[130px] shrink-0 text-left text-[9px] font-semibold text-gray-700 sm:text-[10px]">
                  Location
                </label>
                <span className="min-h-[24px] flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] text-gray-800 sm:min-h-[28px] sm:text-[10px]">
                  {selectedProduct.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}